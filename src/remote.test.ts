// Test E2E del server MCP remoto: server HTTP reale + backend finto. Esecuzione:
//   npm test   (node:test via tsx, nessuna dipendenza nuova)
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";

const TOK_A = "tok_AAAAAAAAAAAAAAAAAAAAAAAA";
const TOK_B = "tok_BBBBBBBBBBBBBBBBBBBBBBBB";
const TOK_DOWN = "tok_DOWNDOWNDOWNDOWNDOWNDOWN";
const seen: { key: string; url: string; method: string; ip: string }[] = [];
let backend: http.Server;
let remote: http.Server;
let base = "";

before(async () => {
  backend = http.createServer((req, res) => {
    const key = String(req.headers["x-api-key"] || "");
    seen.push({ key, url: req.url || "", method: req.method || "", ip: String(req.headers["cf-connecting-ip"] || "") });
    const send = (s: number, b: unknown) => { res.writeHead(s, { "Content-Type": "application/json" }); res.end(JSON.stringify(b)); };
    if (req.url === "/api/mcp-oauth/whoami") {
      if (key === TOK_DOWN) return send(500, { error: "boom" });
      return key === TOK_A || key === TOK_B ? send(200, { user: { id: key } }) : send(401, { error: "no" });
    }
    if (key !== TOK_A && key !== TOK_B) return send(401, { error: "no" });
    setTimeout(() => send(200, { data: [{ whoami: key, url: req.url }] }), Math.random() * 20);
  });
  await new Promise<void>((r) => backend.listen(0, "127.0.0.1", r));
  process.env.MCP_REMOTE = "1";
  process.env.MCP_NO_LISTEN = "1";
  process.env.SCALA_API_URL = `http://127.0.0.1:${(backend.address() as AddressInfo).port}`;
  process.env.SCALA_API_KEY = "env-key-MUST-NEVER-LEAK-0000";
  process.env.SCORE_API_KEY = "env-score-key-MUST-NEVER-LEAK";
  process.env.MCP_PUBLIC_URL = "https://mcp.test.example";
  process.env.MCP_MAX_BAD_TOKENS_PER_MIN = "5";
  process.env.MCP_OAUTH_ISSUER = "https://auth.test.example";
  const m = await import("./remote.js");
  remote = m.httpServer;
  await new Promise<void>((r) => remote.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(remote.address() as AddressInfo).port}`;
});

after(() => { remote.close(); backend.close(); });

const H = { "Content-Type": "application/json", Accept: "application/json, text/event-stream" };
const rpc = (token: string | null, method: string, params: unknown = {}, id = 1, extra: Record<string, string> = {}) =>
  fetch(`${base}/mcp`, {
    method: "POST",
    headers: { ...H, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });

test("senza token: 401 con WWW-Authenticate e resource_metadata", async () => {
  const r = await rpc(null, "tools/list");
  assert.equal(r.status, 401);
  assert.equal(r.headers.get("www-authenticate"), 'Bearer resource_metadata="https://mcp.test.example/.well-known/oauth-protected-resource"');
});

test("token non valido: 401; backend giu: 503 (non si spaccia per token invalido)", async () => {
  assert.equal((await rpc("tok_inesistente_inesistente", "tools/list")).status, 401);
  assert.equal((await rpc(TOK_DOWN, "tools/list")).status, 503);
});

test("protected resource metadata: resource = URL MCP esatto, issuer = authorization server", async () => {
  for (const p of ["/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp"]) {
    const j = await (await fetch(`${base}${p}`)).json() as Record<string, unknown>;
    assert.equal(j.resource, "https://mcp.test.example/mcp");
    assert.deepEqual(j.authorization_servers, ["https://auth.test.example"]);
    assert.deepEqual(j.scopes_supported, ["mcp:read"]);
  }
});

test("initialize + tools/list: solo le 16 letture, tutte con title e readOnlyHint", async () => {
  const init = await rpc(TOK_A, "initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } });
  assert.equal(init.status, 200);
  const caps = ((await init.json()) as { result: { capabilities: Record<string, unknown> } }).result.capabilities;
  assert.ok(caps.tools);
  assert.equal(caps.resources, undefined);
  assert.equal(caps.prompts, undefined);
  const r = await rpc(TOK_A, "tools/list");
  const tools = ((await r.json()) as { result: { tools: { name: string; title: string; annotations: Record<string, unknown> }[] } }).result.tools;
  assert.equal(tools.length, 16);
  for (const t of tools) {
    assert.ok(t.title, t.name);
    assert.equal(t.annotations.readOnlyHint, true, t.name);
    assert.equal(t.annotations.destructiveHint, undefined, t.name);
    assert.ok(t.name.length <= 64);
  }
  const nomi = new Set(tools.map((t) => t.name));
  for (const vietato of ["crm_create_contact", "crm_update_contact", "booking_create", "booking_cancel", "invoice_create", "invoice_send", "sara_chat", "vertical_create_record", "workflow_run", "vertical_list_data", "invoice_get_pdf", "search_companies", "lookup_company", "list_countries", "check_credits"]) {
    assert.ok(!nomi.has(vietato), `${vietato} non deve essere esposto in remoto v1`);
  }
});

test("un tool fuori allowlist non e' eseguibile nemmeno chiamandolo per nome", async () => {
  seen.length = 0;
  const r = await rpc(TOK_A, "tools/call", { name: "crm_create_contact", arguments: { full_name: "x" } });
  const j = (await r.json()) as { result: { isError: boolean; content: { text: string }[] } };
  assert.equal(j.result.isError, true);
  assert.match(j.result.content[0].text, /Unknown tool/);
  assert.equal(seen.filter((s) => s.method !== "GET" || s.url !== "/api/mcp-oauth/whoami").length, 0); // il backend non e' stato toccato
});

test("isolamento: 40 chiamate parallele con due token vedono SEMPRE e SOLO la propria identita'", async () => {
  const risposte = await Promise.all(Array.from({ length: 40 }, async (_, i) => {
    const token = i % 2 ? TOK_B : TOK_A;
    const r = await rpc(token, "tools/call", { name: "crm_list_contacts", arguments: { limit: 1 } }, i + 1);
    const j = (await r.json()) as { result: { content: { text: string }[] } };
    return { token, testo: j.result.content[0].text };
  }));
  for (const { token, testo } of risposte) {
    assert.ok(testo.includes(token), "la risposta deve portare la chiave del chiamante");
    assert.ok(!testo.includes(token === TOK_A ? TOK_B : TOK_A), "mai la chiave dell'altro utente");
  }
});

test("nessuna credenziale d'ambiente arriva mai al backend", async () => {
  await rpc(TOK_A, "tools/call", { name: "finance_summary", arguments: {} });
  assert.ok(seen.length > 0);
  assert.ok(seen.every((s) => !s.key.includes("MUST-NEVER-LEAK")), "chiave d'ambiente inoltrata al backend");
});

test("gli identificativi dal modello sono codificati: niente path traversal verso altre rotte", async () => {
  seen.length = 0;
  await rpc(TOK_A, "tools/call", { name: "crm_contact_timeline", arguments: { contact_id: "../../admin/users" } });
  const chiamata = seen.find((s) => s.url.includes("timeline"));
  assert.ok(chiamata, "attesa la chiamata al backend");
  assert.equal(chiamata!.url, "/api/crm/contacts/..%2F..%2Fadmin%2Fusers/timeline");
  const r = await rpc(TOK_A, "tools/call", { name: "vertical_kpis", arguments: { vertical: "" } });
  const j = (await r.json()) as { result: { isError: boolean } };
  assert.equal(j.result.isError, true);
});

test("Origin da browser rifiutato; GET/DELETE non ammessi (stateless); corpo troppo grande 413; JSON rotto 400", async () => {
  assert.equal((await rpc(TOK_A, "tools/list", {}, 1, { Origin: "https://evil.example" })).status, 403);
  assert.equal((await fetch(`${base}/mcp`, { method: "GET", headers: { Authorization: `Bearer ${TOK_A}`, Accept: "text/event-stream" } })).status, 405);
  assert.equal((await fetch(`${base}/mcp`, { method: "DELETE", headers: { Authorization: `Bearer ${TOK_A}` } })).status, 405);
  const grande = await fetch(`${base}/mcp`, { method: "POST", headers: { ...H, Authorization: `Bearer ${TOK_A}` }, body: "x".repeat(1_100_000) }).catch(() => null);
  assert.ok(grande === null || grande.status === 413);
  const rotto = await fetch(`${base}/mcp`, { method: "POST", headers: { ...H, Authorization: `Bearer ${TOK_A}` }, body: "{non json" });
  assert.equal(rotto.status, 400);
  assert.equal((await fetch(`${base}/altro`)).status, 404);
  assert.equal((await fetch(`${base}/healthz`)).status, 200);
});

test("il backend riceve un'identita' di rate limit per-token (non l'IP condiviso del server MCP)", async () => {
  seen.length = 0;
  await rpc(TOK_A, "tools/call", { name: "finance_summary", arguments: {} }, 11);
  await rpc(TOK_B, "tools/call", { name: "finance_summary", arguments: {} }, 12);
  const ipA = seen.find((s) => s.key === TOK_A)!.ip;
  const ipB = seen.find((s) => s.key === TOK_B)!.ip;
  assert.match(ipA, /^mcp-[0-9a-f]{16}$/);
  assert.match(ipB, /^mcp-[0-9a-f]{16}$/);
  assert.notEqual(ipA, ipB);
  assert.ok(!ipA.includes(TOK_A));
});

test("'.' e '..' come identificativo sono rifiutati (non si sposta la richiesta su un'altra rotta)", async () => {
  seen.length = 0;
  for (const id of ["..", "."]) {
    const r = await rpc(TOK_A, "tools/call", { name: "crm_contact_timeline", arguments: { contact_id: id } });
    assert.equal(((await r.json()) as { result: { isError: boolean } }).result.isError, true);
  }
  assert.equal(seen.filter((s) => s.url.includes("timeline")).length, 0);
});

test("token inventato: un solo giro al backend (cache negativa), poi stop per IP dopo 5 tentativi; i token validi passano sempre", async () => {
  seen.length = 0;
  const falso = "tok_FALSOFALSOFALSOFALSOFALSO";
  assert.equal((await rpc(falso, "tools/list")).status, 401);
  assert.equal((await rpc(falso, "tools/list")).status, 401);
  assert.equal(seen.filter((s) => s.key === falso).length, 1, "la seconda volta non deve disturbare il backend");
  let ultimo = 0;
  for (let i = 0; i < 8; i++) ultimo = (await rpc(`tok_X${i}XXXXXXXXXXXXXXXXXXXXXXX`, "tools/list")).status;
  assert.equal(ultimo, 429);
  assert.equal((await rpc(TOK_A, "tools/list")).status, 200, "un token valido non e' mai bloccato dal contatore dei falliti");
});

test("tool di Score non esposti e, anche se chiamati dal codice, rifiutano in modalita' remota", async () => {
  const { scoreRequest } = await import("./api.js");
  await assert.rejects(() => scoreRequest("/search", { q: "x" }), /not available on the remote server/);
});
