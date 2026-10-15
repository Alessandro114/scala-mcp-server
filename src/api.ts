import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Modalita' remota (server HTTP multi-utente): MCP_REMOTE=1. Qui NESSUNA credenziale
 * viene mai letta dall'ambiente: ogni richiesta porta la propria (AsyncLocalStorage),
 * altrimenti una chiave globale servirebbe tutti gli utenti con l'identita' di uno solo.
 */
export const REMOTE = process.env.MCP_REMOTE === "1";
const credenziale = new AsyncLocalStorage<{ token: string }>();

/** Esegue `fn` con il token dell'utente della richiesta corrente (solo modalita' remota). */
export function conCredenziale<T>(token: string, fn: () => T): T {
  return credenziale.run({ token }, fn);
}

function chiaveCorrente(): string {
  if (!REMOTE) return API_KEY;
  const t = credenziale.getStore()?.token;
  if (!t) throw new Error("Not authenticated");
  return t;
}

/** Un segmento di percorso fornito dal modello: sempre codificato, mai vuoto. */
export function seg(value: unknown): string {
  const v = String(value ?? "").trim();
  if (!v || v.length > 200) throw new Error("Invalid identifier");
  return encodeURIComponent(v);
}

const API_KEY = REMOTE ? "" : process.env.SCALA_API_KEY || "";
const BASE_URL = (process.env.SCALA_API_URL || process.env.SCALA_BASE_URL || "https://app.get-scala.com").replace(/\/$/, "");

// S.C.A.L.A. Score (company data) is a separate service with its own key and base URL.
const SCORE_API_KEY = REMOTE ? "" : process.env.SCORE_API_KEY || API_KEY;
const SCORE_BASE_URL = (process.env.SCORE_API_URL || "https://score.get-scala.com/api/v1").replace(/\/$/, "");

if (!REMOTE && !API_KEY) {
  console.error("Warning: SCALA_API_KEY not set. Some tools require authentication.");
  console.error("Get your API key at https://app.get-scala.com → Settings → API Keys");
}

export async function apiRequest(
  endpoint: string,
  params?: Record<string, string>,
  method = "GET",
  body?: unknown
) {
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
    );
    if (qs.toString()) url += `?${qs}`;
  }

  const init: RequestInit = {
    method,
    headers: {
      "X-API-Key": chiaveCorrente(),
      "Content-Type": "application/json",
    },
  };
  if (body) init.body = JSON.stringify(body);

  const resp = await fetch(url, init);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`API ${resp.status}: ${text.slice(0, 500)}`);
  }
  return resp.json();
}

/** GET against the Score API (/search, /company/{id}, /usage, /countries). Auth: X-API-Key. */
export async function scoreRequest(endpoint: string, params?: Record<string, string>) {
  if (REMOTE) throw new Error("Score tools are not available on the remote server yet.");
  if (!SCORE_API_KEY) throw new Error("SCORE_API_KEY not set. Get a free key at https://score.get-scala.com/builders");
  const url = new URL(`${SCORE_BASE_URL}${endpoint}`);
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  }
  const resp = await fetch(url, { headers: { "X-API-Key": SCORE_API_KEY } });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Score API ${resp.status}: ${text.slice(0, 500)}`);
  }
  return resp.json();
}

const MAX_REMOTE_CHARS = 100_000;

export function ok(data: unknown) {
  let text = JSON.stringify(data, null, 2) ?? "null";
  if (REMOTE && text.length > MAX_REMOTE_CHARS) {
    text = text.slice(0, MAX_REMOTE_CHARS) + `\n...[truncated: response exceeded ${MAX_REMOTE_CHARS} characters; narrow the query]`;
  }
  return { content: [{ type: "text" as const, text }] };
}

export function err(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true as const };
}
