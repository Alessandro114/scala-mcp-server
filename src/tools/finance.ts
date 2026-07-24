import { apiRequest, ok } from "../api.js";

export const financeTools = [
  {
    name: "finance_summary",
    description:
      "Get a financial overview: revenue, expenses, profit, outstanding invoices, " +
      "cash position, and month-over-month trends.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "finance_health_score",
    description:
      "Get your business financial health score (0-100) with breakdown: " +
      "liquidity, profitability, receivables aging, and burn rate.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "finance_cash_flow",
    description:
      "Get cash flow data with inflows, outflows, and net cash by period. " +
      "Useful for forecasting and trend analysis.",
    inputSchema: {
      type: "object" as const,
      properties: {
        period: {
          type: "string",
          enum: ["daily", "weekly", "monthly"],
          description: "Aggregation period (default: monthly)",
        },
        months: { type: "number", description: "Lookback months (default 6)" },
      },
    },
  },
];

export async function handleFinanceTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "finance_summary":
      return ok(await apiRequest("/api/finance/summary"));
    case "finance_health_score":
      return ok(await apiRequest("/api/finance/health-score"));
    case "finance_cash_flow": {
      const params: Record<string, string> = {};
      if (args.period) params.period = args.period as string;
      if (args.months) params.months = String(args.months);
      return ok(await apiRequest("/api/finance/cash-flow", params));
    }
    default:
      return { content: [{ type: "text" as const, text: `Unknown finance tool: ${name}` }], isError: true as const };
  }
}
