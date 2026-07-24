import { apiRequest, ok } from "../api.js";

export const scoreTools = [
  {
    name: "search_companies",
    description:
      "Search 250M+ companies worldwide by name, VAT number, or keyword. " +
      "Filter by country (ISO 2-letter), NACE industry code, and status.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Company name, VAT number, or keyword" },
        country: { type: "string", description: "ISO 2-letter country code (IT, DE, FR, US, GB)" },
        nace: { type: "string", description: "NACE industry code (56.10 = restaurants, 62.01 = software)" },
        status: { type: "string", enum: ["active", "inactive"], description: "Company status filter" },
        limit: { type: "number", description: "Max results (1-100, default 10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "lookup_company",
    description:
      "Get detailed company profile by ID or VAT number. Returns revenue, employees, " +
      "health score, NACE classification, legal form, incorporation date, contacts.",
    inputSchema: {
      type: "object" as const,
      properties: {
        company_id: { type: "string", description: "Company ID or VAT number (e.g. IT02727330014)" },
      },
      required: ["company_id"],
    },
  },
  {
    name: "company_report",
    description:
      "Generate a company health report. Types: basic (5 credits), pro (10), enterprise (20).",
    inputSchema: {
      type: "object" as const,
      properties: {
        company_id: { type: "string", description: "Company ID" },
        type: { type: "string", enum: ["basic", "pro", "enterprise"], description: "Report type (default: basic)" },
      },
      required: ["company_id"],
    },
  },
  {
    name: "database_stats",
    description: "Get S.C.A.L.A. Score database statistics: total companies, countries, last update.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "list_countries",
    description: "List all countries available in the database with company counts.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "check_credits",
    description: "Check your remaining API credits, plan, and reset date.",
    inputSchema: { type: "object" as const, properties: {} },
  },
];

export async function handleScoreTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "search_companies": {
      const params: Record<string, string> = {
        q: args.query as string,
        limit: String(args.limit ?? 10),
      };
      if (args.country) params.country = args.country as string;
      if (args.nace) params.nace = args.nace as string;
      if (args.status) params.status = args.status as string;
      return ok(await apiRequest("/api/score/search", params));
    }
    case "lookup_company":
      return ok(await apiRequest("/api/score/lookup", { id: args.company_id as string }));
    case "company_report":
      return ok(await apiRequest("/api/score/report", undefined, "POST", {
        company_id: args.company_id,
        type: args.type ?? "basic",
      }));
    case "database_stats":
      return ok(await apiRequest("/api/score/stats"));
    case "list_countries":
      return ok(await apiRequest("/api/score/countries"));
    case "check_credits":
      return ok(await apiRequest("/api/score/credits"));
    default:
      return { content: [{ type: "text" as const, text: `Unknown score tool: ${name}` }], isError: true as const };
  }
}
