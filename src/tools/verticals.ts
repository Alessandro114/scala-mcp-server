import { apiRequest, ok } from "../api.js";

export const verticalTools = [
  {
    name: "vertical_kpis",
    description:
      "Get KPIs for a specific vertical module. Each vertical has domain-specific " +
      "metrics: DineOS (covers, avg ticket, food cost), PropertyOS (listings, commissions), " +
      "MotorOS (inventory, test drives, trade-ins), StudioOS (projects, billable hours), etc.",
    inputSchema: {
      type: "object" as const,
      properties: {
        vertical: {
          type: "string",
          enum: [
            "dineos", "propertyos", "agencyos", "motoros", "travelos",
            "studioos", "beautyos", "cleanos", "shopos", "wellnessos",
            "dermalyos", "serviceos", "projectos", "networkos",
            "praxisos", "trichoos", "reputationos", "ados", "landiq",
          ],
          description: "Vertical module slug",
        },
      },
      required: ["vertical"],
    },
  },
  {
    name: "vertical_list_data",
    description:
      "List records from any vertical table. Examples: dineos menu items, motoros vehicles, " +
      "propertyos listings, beautyos appointments, travelos itineraries.",
    inputSchema: {
      type: "object" as const,
      properties: {
        table: {
          type: "string",
          description: "Table name (e.g. dineos_menu, motoros_vehicles, propertyos_listings)",
        },
        limit: { type: "number", description: "Max results (default 20)" },
        search: { type: "string", description: "Search/filter term" },
      },
      required: ["table"],
    },
  },
  {
    name: "vertical_create_record",
    description:
      "Create a record in any vertical table. Pass the table name and the fields as data.",
    inputSchema: {
      type: "object" as const,
      properties: {
        table: { type: "string", description: "Table name" },
        data: {
          type: "object",
          additionalProperties: true,
          description: "Record fields (varies by table)",
        },
      },
      required: ["table", "data"],
    },
  },
  {
    name: "vertical_access",
    description: "Check which vertical modules are active for the current account.",
    inputSchema: { type: "object" as const, properties: {} },
  },
];

export async function handleVerticalTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "vertical_kpis": {
      const vertical = args.vertical as string;
      return ok(await apiRequest(`/api/${vertical}/kpis`));
    }
    case "vertical_list_data": {
      const params: Record<string, string> = {};
      if (args.limit) params.limit = String(args.limit);
      if (args.search) params.search = args.search as string;
      return ok(await apiRequest(`/api/data/${args.table}`, params));
    }
    case "vertical_create_record":
      return ok(await apiRequest(`/api/data/${args.table}`, undefined, "POST", args.data));
    case "vertical_access":
      return ok(await apiRequest("/api/verticals/access"));
    default:
      return { content: [{ type: "text" as const, text: `Unknown vertical tool: ${name}` }], isError: true as const };
  }
}
