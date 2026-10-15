#!/usr/bin/env node
// Server MCP REMOTO (Streamable HTTP, stateless) per la Claude Directory.
//
// - Ogni richiesta porta il Bearer dell'utente (access token OAuth emesso dal nostro
//   authorization server, che e' una API key a scadenza breve con scope 'read'). Il token
//   viene inoltrato al backend come X-API-Key: autenticazione, rate limit, RLS e scope
//   restano quelli del backend. Nessuna credenziale viene mai letta dall'ambiente.
// - v1: SOLO tool di lettura (annotations.ts). Niente resources/prompts.
// - Pubblicazione: nginx su mcp.get-scala.com -> questo processo (127.0.0.1:PORT).
//   /.well-known/oauth-authorization-server, /register, /authorize, /token, /revoke
//   vanno al backend (docs/MCP-REMOTE-OAUTH.md nel repo del backend).

import http from "node:http";
import crypto from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

if (process.env.MCP_REMOTE !== "1") {
  console.error("MCP_REMOTE=1 obbligatorio per il server remoto (modalita' senza credenziali globali).");
  process.exit(1);
}

const { conCredenziale } = await import("./api.js");
const { createServer } = await import("./server.js");

const PORT = parseInt(process.env.PORT || "3030", 10);
const HOST = process.env.HOST || "127.0.0.1";
const PUBLIC_URL = (process.env.MCP_PUBLIC_URL || "https://mcp.get-scala.com").replace(/\/$/, "");
const ISSUER = (process.env.MCP_OAUTH_ISSUER || PUBLIC_URL).replace(/\/$/, "");
const BACKEND = (process.env.SCALA_API_URL || "https://app.get-scala.com").replace(/\/$/, "");
const MAX_BODY = 1_000_000;
const REQUEST_TIMEOUT_MS = 60_000;
const RATE_PER_MIN = parseInt(process.env.MCP_RATE_PER_MIN || "120", 10);
const MAX_INFLIGHT = parseInt(process.env.MCP_MAX_INFLIGHT || "64", 10);
const ALLOWED_ORIGINS = new Set((process.env.MCP_ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean));
const VALIDATION_TTL_MS = 20_000;

const RESOURCE = `${PUBLIC_URL}/mcp`;
const METADATA_URL = `${PUBLIC_URL}/.well-known/oauth-protected-resource`;

const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

// ── validazione del token (cache breve: solo gli esiti positivi) ─────────────
const validi = new Map<string, number>();

type Esito = "ok" | "invalid" | "unavailable";

async function validaToken(token: string): Promise<Esito> {
  const h = sha(token);
  const scade = validi.get(h);
  if (scade && scade > Date.now()) return "ok";
  try {
    const r = await fetch(`${BACKEND}/api/auth/me`, {
      headers: { "X-API-Key": token },
      signal: AbortSignal.timeout(8000),
    });
    if (r.status === 401 || r.status === 403) return "invalid";
    if (!r.ok) return "unavailable";
    if (validi.size > 5000) validi.clear();
    validi.set(h, Date.now() + VALIDATION_TTL_MS);
    return "ok";
  } catch {
    return "unavailable";
  }
}

// ── rate limit per token (finestra di un minuto, in memoria) ─────────────────
const finestre = new Map<string, { inizio: number; n: number }>();
function entro(h: string): boolean {
  const ora = Date.now();
  const f = finestre.get(h);
  if (!f || ora - f.inizio > 60_000) {
    if (finestre.size > 5000) finestre.clear();
    finestre.set(h, { inizio: ora, n: 1 });
    return true;
  }
  f.n += 1;
  return f.n <= RATE_PER_MIN;
}

let inflight = 0;

function json(res: http.ServerResponse, status: number, body: unknown, extra: Record<string, string> = {}) {
  const s = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(s), "Cache-Control": "no-store", ...extra });
  res.end(s);
}

function non401(res: http.ServerResponse) {
  json(res, 401, { error: "unauthorized" }, { "WWW-Authenticate": `Bearer resource_metadata="${METADATA_URL}"` });
}

function leggiCorpo(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const parts: Buffer[] = [];
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error("too large"), { status: 413 })); req.destroy(); return; }
      parts.push(c);
    });
    req.on("end", () => {
      if (!parts.length) return resolve(undefined);
      try { resolve(JSON.parse(Buffer.concat(parts).toString("utf8"))); }
      catch { reject(Object.assign(new Error("invalid json"), { status: 400 })); }
    });
    req.on("error", reject);
  });
}

export const httpServer = http.createServer(async (req, res) => {
  const t0 = Date.now();
  const url = new URL(req.url || "/", "http://x");
  res.on("finish", () => console.error(JSON.stringify({ m: req.method, p: url.pathname, s: res.statusCode, ms: Date.now() - t0 })));
  req.setTimeout(REQUEST_TIMEOUT_MS);
  try {
    if (url.pathname === "/healthz") return json(res, 200, { ok: true });

    if (url.pathname === "/.well-known/oauth-protected-resource" || url.pathname === "/.well-known/oauth-protected-resource/mcp") {
      return json(res, 200, {
        resource: RESOURCE,
        authorization_servers: [ISSUER],
        scopes_supported: ["mcp:read"],
        bearer_methods_supported: ["header"],
      }, { "Cache-Control": "public, max-age=300" });
    }

    if (url.pathname !== "/mcp") return json(res, 404, { error: "not_found" });

    // Browser: mai. Claude chiama server-to-server e non manda Origin.
    const origin = req.headers.origin;
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json(res, 403, { error: "origin_not_allowed" });

    if (req.method !== "POST") {
      // Stateless: niente stream SSE server->client e niente sessioni da chiudere.
      return json(res, 405, { error: "method_not_allowed" }, { Allow: "POST" });
    }

    const auth = req.headers.authorization || "";
    const m = /^Bearer\s+(\S{20,200})$/i.exec(auth);
    if (!m) return non401(res);
    const token = m[1];
    const h = sha(token);

    const esito = await validaToken(token);
    if (esito === "invalid") return non401(res);
    if (esito === "unavailable") return json(res, 503, { error: "backend_unavailable" }, { "Retry-After": "5" });
    if (!entro(h)) return json(res, 429, { error: "rate_limited" }, { "Retry-After": "60" });
    if (inflight >= MAX_INFLIGHT) return json(res, 503, { error: "busy" }, { "Retry-After": "2" });

    const body = await leggiCorpo(req);

    inflight += 1;
    const server = createServer({ remote: true });
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on("close", () => { inflight -= 1; void transport.close(); void server.close(); });
    await server.connect(transport);
    await conCredenziale(token, () => transport.handleRequest(req, res, body));
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    if (!res.headersSent) json(res, status, { error: status === 500 ? "internal_error" : (e as Error).message });
    else res.end();
  }
});

if (process.env.MCP_NO_LISTEN !== "1") {
  httpServer.listen(PORT, HOST, () => console.error(`S.C.A.L.A. MCP remote on ${HOST}:${PORT} (resource ${RESOURCE})`));
}
