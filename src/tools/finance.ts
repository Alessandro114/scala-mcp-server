import { apiRequest, ok } from "../api.js";

export const financeTools = [
  {
    name: "finance_summary",
    description:
      "Get the year-to-date financial summary: revenue (paid invoices), cost of goods sold, operating expenses, " +
      "tax, gross margin, EBITDA, net profit and total costs, in EUR. Does not include outstanding invoices or monthly trends.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "finance_health_score",
    description:
      "Get your business financial health score (0-100) with a letter grade (A-F) and four scored factors: " +
      "profit margin (max 30), revenue growth vs last year (max 25), cash flow as invoice collection rate over 6 months (max 25), " +
      "and recent business activity (max 20).",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "finance_cash_flow",
    description:
      "Get monthly cash flow: inflows, outflows and net cash per month for the last N months, " +
      "plus a 6-month projection (marked is_projection). Useful for forecasting and trend analysis.",
    inputSchema: {
      type: "object" as const,
      properties: {
        months: { type: "number", description: "Months of history (default 12, max 36)" },
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
      if (args.months) params.months = String(args.months);
      return ok(await apiRequest("/api/finance/cash-flow", params));
    }
    default:
      return { content: [{ type: "text" as const, text: `Unknown finance tool: ${name}` }], isError: true as const };
  }
}
