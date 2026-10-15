import { scoreRequest, ok } from "../api.js";

const LICENCE_NOTE =
  "Financial fields (revenue, employees, net income) are returned only for FR, NO, LT, EE, LV, CO, " +
  "where the data licence is confirmed; for all other countries the record carries " +
  "financials_withheld='licence_not_confirmed'. Where present, revenue_type is 'reported' (filed accounts) " +
  "or 'estimated' (model estimate). Keep the data_licences field of the output when displaying or " +
  "redistributing data (attribution required).";

export const scoreTools = [
  {
    name: "search_companies",
    description:
      "Search companies worldwide (identification data for all countries) by name prefix or by tax/VAT id. " +
      "Optional ISO 2-letter country filter. 1 credit per call. " + LICENCE_NOTE,
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Company name (prefix match). Provide query or tax_id." },
        tax_id: { type: "string", description: "Tax/VAT id, e.g. IT00159560366. Provide query or tax_id." },
        country: { type: "string", description: "ISO 2-letter country code (e.g. FR, IT, DE)" },
        limit: { type: "number", description: "Max results (1-100, default 10)" },
      },
    },
  },
  {
    name: "lookup_company",
    description:
      "Full company profile by the id returned from search_companies. 1 credit. " +
      "Includes revenue_type, revenue_confidence and source where financials are available. " + LICENCE_NOTE,
    inputSchema: {
      type: "object" as const,
      properties: {
        company_id: { type: "string", description: "Company id from search_companies" },
      },
      required: ["company_id"],
    },
  },
  {
    name: "list_countries",
    description: "List the countries available in the Score database. Keep data_licences attribution if present.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "check_credits",
    description: "Remaining API credits for the current Score key (free call).",
    inputSchema: { type: "object" as const, properties: {} },
  },
];

const bad = (text: string) => ({ content: [{ type: "text" as const, text }], isError: true as const });

export async function handleScoreTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "search_companies": {
      const q = typeof args.query === "string" ? args.query.trim() : "";
      const taxId = typeof args.tax_id === "string" ? args.tax_id.trim() : "";
      if (!q && !taxId) return bad("Provide query (name) or tax_id.");
      const lim = Math.min(100, Math.max(1, Math.trunc(Number(args.limit ?? 10)) || 10));
      const params: Record<string, string> = { limit: String(lim) };
      if (q) params.q = q;
      if (taxId) params.tax_id = taxId;
      if (args.country) params.country = String(args.country).toUpperCase();
      return ok(await scoreRequest("/search", params));
    }
    case "lookup_company":
      return ok(await scoreRequest(`/company/${encodeURIComponent(String(args.company_id ?? ""))}`));
    case "list_countries":
      return ok(await scoreRequest("/countries"));
    case "check_credits":
      return ok(await scoreRequest("/usage"));
    default:
      return bad(`Unknown score tool: ${name}`);
  }
}
