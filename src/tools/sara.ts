import { apiRequest, ok } from "../api.js";
import { leggiPagina, paramsPagina, limitaElenco } from "../pagina.js";

export const saraTools = [
  {
    name: "sara_chat",
    description:
      "Send a message to SARA, the AI business assistant. SARA can answer questions " +
      "about your business, customers, bookings, inventory, and more. " +
      "She has context about your entire SCALA workspace.",
    inputSchema: {
      type: "object" as const,
      properties: {
        message: { type: "string", description: "Message to send to SARA" },
        conversation_id: { type: "string", description: "Conversation ID to continue (optional)" },
      },
      required: ["message"],
    },
  },
  {
    name: "sara_conversations",
    description:
      "List recent SARA conversations with message counts and last activity. " +
      "Returns one page (default 20, max 50); use offset for the next page. The response includes page.has_more.",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Max conversations per page (default 20, max 50)" },
        offset: { type: "number", description: "Number of conversations to skip (default 0)" },
      },
    },
  },
  {
    name: "sara_insights",
    description:
      "Get SARA's business insights — AI-generated analysis of trends, anomalies, " +
      "and actionable recommendations based on your business data.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "sara_alerts",
    description:
      "Get active SARA alerts — important notifications about your business " +
      "(low inventory, overdue invoices, missed bookings, etc.). " +
      "Returns one page (default 20, max 50 alerts, most urgent first); use offset for the next page. The response includes page.has_more.",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Max alerts per page (default 20, max 50)" },
        offset: { type: "number", description: "Number of alerts to skip (default 0)" },
      },
    },
  },
  {
    name: "sara_proactive",
    description:
      "Get SARA's proactive suggestions — things SARA thinks you should act on " +
      "based on patterns she detected in your data.",
    inputSchema: { type: "object" as const, properties: {} },
  },
];

export async function handleSaraTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "sara_chat":
      return ok(await apiRequest("/api/sara/chat", undefined, "POST", {
        message: args.message,
        conversation_id: args.conversation_id,
      }));
    case "sara_conversations": {
      const pagina = leggiPagina(args);
      return ok(limitaElenco(await apiRequest("/api/sara/conversations", paramsPagina(pagina)), pagina, ["conversations"]));
    }
    case "sara_insights":
      return ok(await apiRequest("/api/sara/business-insights"));
    case "sara_alerts": {
      const pagina = leggiPagina(args);
      return ok(limitaElenco(await apiRequest("/api/sara/alerts", paramsPagina(pagina)), pagina, ["data"]));
    }
    case "sara_proactive":
      return ok(await apiRequest("/api/sara/proactive"));
    default:
      return { content: [{ type: "text" as const, text: `Unknown SARA tool: ${name}` }], isError: true as const };
  }
}
