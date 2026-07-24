import { apiRequest, ok } from "../api.js";

export const crmTools = [
  {
    name: "crm_list_contacts",
    description:
      "List CRM contacts with optional search. Returns name, email, phone, company, " +
      "deal stage (lead/qualified/proposal/won/lost), score, and tags.",
    inputSchema: {
      type: "object" as const,
      properties: {
        search: { type: "string", description: "Search by name, email, or company" },
        stage: {
          type: "string",
          enum: ["lead", "qualified", "proposal", "won", "lost"],
          description: "Filter by pipeline stage",
        },
        limit: { type: "number", description: "Max results (default 20)" },
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
    description: "Get the CRM pipeline view — contacts grouped by stage with counts and deal values.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "crm_contact_timeline",
    description: "Get the full activity timeline for a contact: calls, emails, meetings, notes, deals.",
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
      const params: Record<string, string> = {};
      if (args.search) params.search = args.search as string;
      if (args.stage) params.stage = args.stage as string;
      if (args.limit) params.limit = String(args.limit);
      return ok(await apiRequest("/api/crm/contacts", params));
    }
    case "crm_create_contact":
      return ok(await apiRequest("/api/crm/contacts", undefined, "POST", args));
    case "crm_update_contact": {
      const { id, ...updates } = args;
      return ok(await apiRequest(`/api/crm/contacts/${id}`, undefined, "PATCH", updates));
    }
    case "crm_pipeline":
      return ok(await apiRequest("/api/crm/pipeline"));
    case "crm_contact_timeline":
      return ok(await apiRequest(`/api/crm/contacts/${args.contact_id}/timeline`));
    default:
      return { content: [{ type: "text" as const, text: `Unknown CRM tool: ${name}` }], isError: true as const };
  }
}
