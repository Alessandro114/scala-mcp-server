import { apiRequest, ok } from "../api.js";

export const workflowTools = [
  {
    name: "workflow_list",
    description:
      "List all automation workflows with their status (active/paused), " +
      "trigger type, last run, and success rate.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "workflow_run",
    description:
      "Manually execute a workflow by ID. Returns the run result and logs.",
    inputSchema: {
      type: "object" as const,
      properties: {
        workflow_id: { type: "string", description: "Workflow ID to execute" },
        input: {
          type: "object",
          additionalProperties: true,
          description: "Optional input data for the workflow",
        },
      },
      required: ["workflow_id"],
    },
  },
  {
    name: "workflow_stats",
    description: "Get workflow statistics: total runs, success rate, avg duration, errors.",
    inputSchema: { type: "object" as const, properties: {} },
  },
];

export async function handleWorkflowTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "workflow_list":
      return ok(await apiRequest("/api/workflows/list"));
    case "workflow_run":
      return ok(await apiRequest(`/api/workflows/${args.workflow_id}/run`, undefined, "POST", {
        input: args.input,
      }));
    case "workflow_stats":
      return ok(await apiRequest("/api/workflows/stats"));
    default:
      return { content: [{ type: "text" as const, text: `Unknown workflow tool: ${name}` }], isError: true as const };
  }
}
