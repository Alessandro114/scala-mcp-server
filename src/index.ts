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
import { apiRequest } from "./api.js";

export { apiRequest };

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

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Route to the correct handler based on tool prefix
    if (name.startsWith("score_") || ["search_companies", "lookup_company", "company_report", "database_stats", "list_countries", "check_credits"].includes(name)) {
      return handleScoreTool(name, args as Record<string, unknown>);
    }
    if (name.startsWith("crm_")) return handleCrmTool(name, args as Record<string, unknown>);
    if (name.startsWith("booking_")) return handleBookingTool(name, args as Record<string, unknown>);
    if (name.startsWith("invoice_")) return handleInvoiceTool(name, args as Record<string, unknown>);
    if (name.startsWith("sara_")) return handleSaraTool(name, args as Record<string, unknown>);
    if (name.startsWith("finance_")) return handleFinanceTool(name, args as Record<string, unknown>);
    if (name.startsWith("vertical_")) return handleVerticalTool(name, args as Record<string, unknown>);
    if (name.startsWith("workflow_")) return handleWorkflowTool(name, args as Record<string, unknown>);

    return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
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

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
