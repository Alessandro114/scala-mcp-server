import { Server } from "@modelcontextprotocol/sdk/server/index.js";
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
import { REMOTE_READ_TOOLS, withAnnotations } from "./annotations.js";

const allTools = withAnnotations([
  ...scoreTools,
  ...crmTools,
  ...bookingTools,
  ...invoiceTools,
  ...saraTools,
  ...financeTools,
  ...verticalTools,
  ...workflowTools,
]);

/** Elenco dei tool esposti: in remoto v1 SOLO le letture dell'allowlist. */
export function toolsFor(remote: boolean) {
  return remote ? allTools.filter((t) => REMOTE_READ_TOOLS.has(t.name)) : allTools;
}

/**
 * Costruisce un server MCP. `remote: true` = server HTTP multi-utente: solo tool di lettura
 * dell'allowlist, niente resources/prompts, e il chiamante deve avvolgere ogni richiesta
 * in `conCredenziale(token, ...)` (api.ts).
 */
export function createServer(opts: { remote: boolean }): Server {
  const remote = opts.remote;
  const server = new Server(
    { name: "scala-ai-os", version: "1.0.0" },
    { capabilities: remote ? { tools: {} } : { tools: {}, resources: {}, prompts: {} } }
  );

  const tools = toolsFor(remote);
  const consentiti = new Set(tools.map((t) => t.name));

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      if (!consentiti.has(name)) {
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
      }
      const a = (args ?? {}) as Record<string, unknown>;
      // Route to the correct handler based on tool prefix
      if (name.startsWith("score_") || ["search_companies", "lookup_company", "list_countries", "check_credits"].includes(name)) {
        return await handleScoreTool(name, a);
      }
      if (name.startsWith("crm_")) return await handleCrmTool(name, a);
      if (name.startsWith("booking_")) return await handleBookingTool(name, a);
      if (name.startsWith("invoice_")) return await handleInvoiceTool(name, a);
      if (name.startsWith("sara_")) return await handleSaraTool(name, a);
      if (name.startsWith("finance_")) return await handleFinanceTool(name, a);
      if (name.startsWith("vertical_")) return await handleVerticalTool(name, a);
      if (name.startsWith("workflow_")) return await handleWorkflowTool(name, a);
      return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  });

  if (!remote) {
    server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources }));
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => handleResource(request.params.uri));
    server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts }));
    server.setRequestHandler(GetPromptRequestSchema, async (request) => handlePrompt(request.params.name, request.params.arguments));
  }

  return server;
}
