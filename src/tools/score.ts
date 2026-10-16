import { scoreRequest, ok } from "../api.js";

const FINANCIALS_LICENSED = new Set(["FR", "NO", "LT", "EE", "LV", "CO"]);

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
      "Search companies by name prefix or tax/VAT id. Coverage and licence status differ per country: see data_licences in the output (some countries are marked to_verify). " +
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
    description: "List the countries available in the Score database (company counts; financial-field counts only for FR, NO, LT, EE, LV, CO).",
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
    case "lookup_company": {
      const id = String(args.company_id ?? "").trim();
      if (!id) return bad("company_id is required (use the id returned by search_companies).");
      return ok(await scoreRequest(`/company/${encodeURIComponent(id)}`));
    }
    case "list_countries": {
      // Row counts of financial fields are hidden for countries without a confirmed data licence.
      const data = (await scoreRequest("/countries")) as { countries?: Record<string, unknown>[] };
      if (Array.isArray(data.countries)) {
        data.countries = data.countries.map((c) =>
          FINANCIALS_LICENSED.has(String(c.country))
            ? c
            : Object.fromEntries(Object.entries(c).filter(([k]) => k !== "with_revenue" && k !== "with_emp"))
        );
      }
      return ok(data);
    }
    case "check_credits":
      return ok(await scoreRequest("/usage"));
    default:
      return bad(`Unknown score tool: ${name}`);
  }
}
