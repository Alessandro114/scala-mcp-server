import { apiRequest, ok, seg } from "../api.js";
import { leggiPagina, paramsPagina, limitaElenco, accorciaCampi } from "../pagina.js";

export const crmTools = [
  {
    name: "crm_list_contacts",
    description:
      "List CRM contacts with optional search. Returns name, email, phone, company, " +
      "deal stage (lead/qualified/proposal/won/lost), score, and tags. " +
      "Returns one page (default 20, max 50 contacts); use offset for the next page. The response includes page.has_more. " +
      "Long notes are cut to 200 characters and marked notes_truncated.",
    inputSchema: {
      type: "object" as const,
      properties: {
        search: { type: "string", description: "Search by name, email, or company" },
        stage: {
          type: "string",
          enum: ["lead", "qualified", "proposal", "won", "lost"],
          description: "Filter by pipeline stage",
        },
        limit: { type: "number", description: "Max results per page (default 20, max 50)" },
        offset: { type: "number", description: "Number of results to skip (default 0)" },
      },
    },
  },
  {
    name: "crm_create_contact",
    description: "Create a new CRM contact with name, email, phone, company, and tags.",
    inputSchema: {
      type: "object" as const,
      properties: {
        full_name: { type: "string", description: "Contact full name" },
        email: { type: "string", description: "Email address" },
        phone: { type: "string", description: "Phone number" },
        company: { type: "string", description: "Company name" },
        stage: {
          type: "string",
          enum: ["lead", "qualified", "proposal", "won", "lost"],
          description: "Pipeline stage (default: lead)",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags to assign",
        },
        notes: { type: "string", description: "Notes about the contact" },
      },
      required: ["full_name"],
    },
  },
  {
    name: "crm_update_contact",
    description: "Update an existing CRM contact by ID. Any field can be updated.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "Contact ID" },
        full_name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        company: { type: "string" },
        stage: { type: "string", enum: ["lead", "qualified", "proposal", "won", "lost"] },
        tags: { type: "array", items: { type: "string" } },
        notes: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "crm_pipeline",
    description:
      "List the CRM pipeline deals as a flat list (not grouped): title, value, currency, stage, contact, probability, expected close. " +
      "Returns one page (default 50, max 100 deals); use offset for the next page. The response includes page.has_more. " +
      "Long notes are cut to 200 characters.",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Max deals per page (default 50, max 100)" },
        offset: { type: "number", description: "Number of deals to skip (default 0)" },
      },
    },
  },
  {
    name: "crm_contact_timeline",
    description:
      "Get the activity timeline for one contact: logged activities (emails, calls, meetings, notes, tasks) " +
      "and CRM actions, with total, limit and offset.",
    inputSchema: {
      type: "object" as const,
      properties: {
        contact_id: { type: "string", description: "Contact ID" },
      },
      required: ["contact_id"],
    },
  },
];

export async function handleCrmTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "crm_list_contacts": {
      const pagina = leggiPagina(args);
      const params: Record<string, string> = { ...paramsPagina(pagina) };
      if (args.search) params.search = args.search as string;
      if (args.stage) params.stage = args.stage as string;
      return ok(accorciaCampi(limitaElenco(await apiRequest("/api/crm/contacts", params), pagina, ["contacts"]), "contacts", "notes", 200));
    }
    case "crm_create_contact":
      return ok(await apiRequest("/api/crm/contacts", undefined, "POST", args));
    case "crm_update_contact": {
      const { id, ...updates } = args;
      return ok(await apiRequest(`/api/crm/contacts/${seg(id)}`, undefined, "PATCH", updates));
    }
    case "crm_pipeline":
    {
      const pagina = leggiPagina(args, 50, 100);
      return ok(accorciaCampi(limitaElenco(await apiRequest("/api/crm/pipeline", paramsPagina(pagina)), pagina, ["deals"]), "deals", "notes", 200));
    }
    case "crm_contact_timeline":
      return ok(await apiRequest(`/api/crm/contacts/${seg(args.contact_id)}/timeline`));
    default:
      return { content: [{ type: "text" as const, text: `Unknown CRM tool: ${name}` }], isError: true as const };
  }
}
