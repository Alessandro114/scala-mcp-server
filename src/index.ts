#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { apiRequest } from "./api.js";
import { createServer } from "./server.js";

export { apiRequest };

// ── START (stdio: un utente per processo, chiave da SCALA_API_KEY) ───────────

async function main() {
  const server = createServer({ remote: false });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("S.C.A.L.A. AI OS MCP server running");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
