#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_KEY = process.env.SCALA_API_KEY || "";
const BASE_URL = (process.env.SCALA_BASE_URL || "https://app.get-scala.com").replace(/\/$/, "");

if (!API_KEY) {
  console.error("Error: SCALA_API_KEY environment variable is required");
  console.error("Get your API key at https://app.get-scala.com/score/api");
  process.exit(1);
}

async function scoreRequest(endpoint: string, params?: Record<string, string>, method = "GET", body?: unknown) {
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
    );
    if (qs.toString()) url += `?${qs}`;
  }

  const init: RequestInit = {
    method,
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
  };
  if (body) init.body = JSON.stringify(body);

  const resp = await fetch(url, init);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`API error ${resp.status}: ${text}`);
  }
  return resp.json();
}

const server = new Server(
  { name: "scala-score", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_companies",
      description:
        "Search 244M+ companies worldwide by name, VAT number, or keyword. " +
        "Filter by country (ISO 2-letter code), NACE industry code, and active/inactive status. " +
        "Returns company name, address, revenue, employees, health score, and more.",
      inputSchema: {
        type: "object" as const,
        properties: {
          query: { type: "string", description: "Company name, VAT number, or keyword to search" },
          country: { type: "string", description: "ISO 2-letter country code (e.g. IT, DE, FR, US, GB)" },
          nace: { type: "string", description: "NACE industry code (e.g. 56.10 for restaurants, 62.01 for software)" },
          status: { type: "string", enum: ["active", "inactive"], description: "Filter by company status" },
          limit: { type: "number", description: "Max results (1-100, default 10)" },
        },
        required: ["query"],
      },
    },
    {
      name: "lookup_company",
      description:
        "Get detailed company information by ID or VAT number. " +
        "Returns full company profile: legal name, address, revenue, employees, health score, " +
        "NACE classification, legal form, incorporation date, website, phone, email.",
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
        "Generate a detailed company health report. Available types: " +
        "basic (overview, 5 credits), pro (financial analysis, 10 credits), " +
        "enterprise (full due diligence, 20 credits).",
      inputSchema: {
        type: "object" as const,
        properties: {
          company_id: { type: "string", description: "Company ID to generate report for" },
          type: { type: "string", enum: ["basic", "pro", "enterprise"], description: "Report type (default: basic)" },
        },
        required: ["company_id"],
      },
    },
    {
      name: "database_stats",
      description: "Get S.C.A.L.A. Score database statistics: total companies, countries covered, last update date.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "list_countries",
      description: "List all countries available in the database with company counts per country.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "check_credits",
      description: "Check your remaining API credits, current plan, and reset date.",
      inputSchema: { type: "object" as const, properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_companies": {
        const params: Record<string, string> = {
          q: (args as Record<string, unknown>).query as string,
          limit: String((args as Record<string, unknown>).limit ?? 10),
        };
        if ((args as Record<string, unknown>).country) params.country = (args as Record<string, unknown>).country as string;
        if ((args as Record<string, unknown>).nace) params.nace = (args as Record<string, unknown>).nace as string;
        if ((args as Record<string, unknown>).status) params.status = (args as Record<string, unknown>).status as string;

        const data = await scoreRequest("/api/score/search", params);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "lookup_company": {
        const data = await scoreRequest("/api/score/lookup", {
          id: (args as Record<string, unknown>).company_id as string,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "company_report": {
        const data = await scoreRequest("/api/score/report", undefined, "POST", {
          company_id: (args as Record<string, unknown>).company_id,
          type: (args as Record<string, unknown>).type ?? "basic",
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "database_stats": {
        const data = await scoreRequest("/api/score/stats");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "list_countries": {
        const data = await scoreRequest("/api/score/countries");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "check_credits": {
        const data = await scoreRequest("/api/score/credits");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      default:
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
