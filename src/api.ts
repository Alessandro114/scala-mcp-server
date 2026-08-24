// Letti a ogni chiamata e non una volta sola all'import: un server MCP resta
// acceso per ore, e una chiave ruotata o un indirizzo cambiato devono avere
// effetto senza riavviarlo. Prima erano costanti di modulo, quindi il valore
// era quello del momento in cui Claude Desktop ha caricato il processo.
const apiKey = () => process.env.SCALA_API_KEY || "";
const baseUrl = () =>
  (process.env.SCALA_API_URL || process.env.SCALA_BASE_URL || "https://app.get-scala.com").replace(/\/$/, "");

if (!apiKey()) {
  console.error("Warning: SCALA_API_KEY not set. Some tools require authentication.");
  console.error("Get your API key at https://app.get-scala.com → Settings → API Keys");
}

export async function apiRequest(
  endpoint: string,
  params?: Record<string, string>,
  method = "GET",
  body?: unknown
) {
  let url = `${baseUrl()}${endpoint}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
    );
    if (qs.toString()) url += `?${qs}`;
  }

  const init: RequestInit = {
    method,
    headers: {
      "X-API-Key": apiKey(),
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

export function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function err(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true as const };
}
