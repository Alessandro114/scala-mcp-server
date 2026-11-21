#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { pathToFileURL } from "node:url";
import { apiRequest } from "./api.js";
import { createServer, routeTool } from "./server.js";

export { apiRequest };

// Esportato per poter collegare un trasporto in memoria nei test e provare il
// server attraverso il protocollo vero, invece di chiamare le funzioni interne.
export const server = createServer({ remote: false });
export { routeTool };

// ── START (stdio: un utente per processo, chiave da SCALA_API_KEY) ───────────

/* v8 ignore start -- verificato da test/avvio.test.ts, che lancia
   `node dist/index.js` come processo separato e ci parla sopra lo stdio con il
   protocollo MCP. Lo strumento di copertura misura il processo dei test, non i
   figli, quindi queste righe risultano scoperte pur essendo provate.

   Non sono coprribili da dentro per costruzione: la guardia qui sotto esiste
   proprio per NON avviare il server quando qualcuno importa il modulo. Un test
   che le eseguisse in-process si prenderebbe un trasporto stdio e resterebbe
   appeso. */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("S.C.A.L.A. AI OS MCP server running");
}

// Si avvia solo se questo modulo E l'eseguibile. Prima partiva anche solo a
// importarlo: bastava caricare il file per prendersi un server sullo stdio,
// che e il motivo per cui la logica di smistamento non era verificabile.
const eseguitoDirettamente =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (eseguitoDirettamente) {
  main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
}
/* v8 ignore stop */
