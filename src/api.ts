const API_KEY = process.env.SCALA_API_KEY || "";
const BASE_URL = (process.env.SCALA_API_URL || process.env.SCALA_BASE_URL || "https://app.get-scala.com").replace(/\/$/, "");

// S.C.A.L.A. Score (company data) is a separate service with its own key and base URL.
const SCORE_API_KEY = process.env.SCORE_API_KEY || API_KEY;
const SCORE_BASE_URL = (process.env.SCORE_API_URL || "https://score.get-scala.com/api/v1").replace(/\/$/, "");

if (!API_KEY) {
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
      "X-API-Key": API_KEY,
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

export function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function err(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true as const };
}
