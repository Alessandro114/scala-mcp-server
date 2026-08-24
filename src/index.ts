#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { scoreTools, handleScoreTool } from "./tools/score.js";
import { crmTools, handleCrmTool } from "./tools/crm.js";
import { bookingTools, handleBookingTool } from "./tools/booking.js";
import { invoiceTools, handleInvoiceTool } from "./tools/invoice.js";
import { saraTools, handleSaraTool } from "./tools/sara.js";
import { financeTools, handleFinanceTool } from "./tools/finance.js";
import { verticalTools, handleVerticalTool } from "./tools/verticals.js";
import { workflowTools, handleWorkflowTool } from "./tools/workflows.js";
import { resources, handleResource } from "./resources.js";
import { prompts, handlePrompt } from "./prompts.js";
import { pathToFileURL } from "node:url";
import { apiRequest } from "./api.js";

export { apiRequest };

// Esportato per poter collegare un trasporto in memoria nei test e provare il
// server attraverso il protocollo vero, invece di chiamare le funzioni interne.
export { server };

const server = new Server(
  { name: "scala-ai-os", version: "1.0.0" },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// ── TOOLS ─────────────────────────────────────────────────────────────────────

const allTools = [
  ...scoreTools,
  ...crmTools,
  ...bookingTools,
  ...invoiceTools,
  ...saraTools,
  ...financeTools,
  ...verticalTools,
  ...workflowTools,
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools,
}));

// Gli strumenti dello Score non hanno prefisso per ragioni storiche: sono i
// primi che sono esistiti e i loro nomi sono gia pubblicati.
const STRUMENTI_SCORE = [
  "search_companies", "lookup_company", "company_report",
  "database_stats", "list_countries", "check_credits",
];

/**
 * Smista uno strumento al modulo che lo gestisce.
 *
 * Esportata per poterla verificare: prima la logica viveva dentro il gestore
 * di richieste MCP, e per provarla bisognava avviare un server sullo stdio.
 */
export async function routeTool(name: string, args: Record<string, unknown>) {
  try {
    // `return await` e non `return`: senza l'await la promessa si risolve
    // FUORI da questo try, e il catch qui sotto non ha mai catturato niente.
    // Ogni errore dell'API sfuggiva alla gestione e usciva come guasto di
    // protocollo invece che come isError con il messaggio dentro.
    if (name.startsWith("score_") || STRUMENTI_SCORE.includes(name)) return await handleScoreTool(name, args);
    if (name.startsWith("crm_")) return await handleCrmTool(name, args);
    if (name.startsWith("booking_")) return await handleBookingTool(name, args);
    if (name.startsWith("invoice_")) return await handleInvoiceTool(name, args);
    if (name.startsWith("sara_")) return await handleSaraTool(name, args);
    if (name.startsWith("finance_")) return await handleFinanceTool(name, args);
    if (name.startsWith("vertical_")) return await handleVerticalTool(name, args);
    if (name.startsWith("workflow_")) return await handleWorkflowTool(name, args);

    return { content: [{ type: "text" as const, text: `Unknown tool: ${name}` }], isError: true as const };
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true as const,
    };
  }
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return routeTool(name, (args ?? {}) as Record<string, unknown>);
});

// ── RESOURCES ─────────────────────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources,
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  return handleResource(request.params.uri);
});

// ── PROMPTS ───────────────────────────────────────────────────────────────────

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts,
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  return handlePrompt(request.params.name, request.params.arguments);
});

// ── START ─────────────────────────────────────────────────────────────────────

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
