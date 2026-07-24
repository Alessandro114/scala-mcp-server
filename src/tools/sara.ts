import { apiRequest, ok } from "../api.js";

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
    description: "List recent SARA conversations with message counts and last activity.",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Max conversations (default 20)" },
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
      "(low inventory, overdue invoices, missed bookings, etc.).",
    inputSchema: { type: "object" as const, properties: {} },
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
      const params: Record<string, string> = {};
      if (args.limit) params.limit = String(args.limit);
      return ok(await apiRequest("/api/sara/conversations", params));
    }
    case "sara_insights":
      return ok(await apiRequest("/api/sara/business-insights"));
    case "sara_alerts":
      return ok(await apiRequest("/api/sara/alerts"));
    case "sara_proactive":
      return ok(await apiRequest("/api/sara/proactive"));
    default:
      return { content: [{ type: "text" as const, text: `Unknown SARA tool: ${name}` }], isError: true as const };
  }
}
