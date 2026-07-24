import { apiRequest, ok } from "../api.js";

export const invoiceTools = [
  {
    name: "invoice_list",
    description:
      "List invoices with optional filters. Returns invoice number, customer, " +
      "amount, currency, status (draft/open/paid/overdue/void), and dates.",
    inputSchema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["draft", "open", "paid", "overdue", "void"],
          description: "Filter by invoice status",
        },
        limit: { type: "number", description: "Max results (default 20)" },
      },
    },
  },
  {
    name: "invoice_create",
    description:
      "Create a new invoice. Supports multiple providers: FattureInCloud (IT), " +
      "Stripe, Xero, QuickBooks, Holded, or local fallback.",
    inputSchema: {
      type: "object" as const,
      properties: {
        customer_email: { type: "string", description: "Customer email" },
        customer_name: { type: "string", description: "Customer name" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              description: { type: "string" },
              quantity: { type: "number" },
              unit_price: { type: "number", description: "Price in cents" },
            },
          },
          description: "Line items",
        },
        currency: { type: "string", description: "Currency code (EUR, USD, GBP). Default: EUR" },
        due_days: { type: "number", description: "Days until due (default 30)" },
        notes: { type: "string", description: "Invoice notes" },
      },
      required: ["customer_email", "items"],
    },
  },
  {
    name: "invoice_send",
    description: "Send an invoice to the customer by email.",
    inputSchema: {
      type: "object" as const,
      properties: {
        invoice_id: { type: "string", description: "Invoice ID to send" },
      },
      required: ["invoice_id"],
    },
  },
  {
    name: "invoice_get_pdf",
    description: "Get the PDF download URL for an invoice.",
    inputSchema: {
      type: "object" as const,
      properties: {
        invoice_id: { type: "string", description: "Invoice ID" },
      },
      required: ["invoice_id"],
    },
  },
];

export async function handleInvoiceTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "invoice_list": {
      const params: Record<string, string> = {};
      if (args.status) params.status = args.status as string;
      if (args.limit) params.limit = String(args.limit);
      return ok(await apiRequest("/api/invoicing/list", params));
    }
    case "invoice_create":
      return ok(await apiRequest("/api/invoicing/create", undefined, "POST", args));
    case "invoice_send":
      return ok(await apiRequest(`/api/invoicing/${args.invoice_id}/send`, undefined, "POST"));
    case "invoice_get_pdf":
      return ok(await apiRequest(`/api/invoicing/${args.invoice_id}/pdf`));
    default:
      return { content: [{ type: "text" as const, text: `Unknown invoice tool: ${name}` }], isError: true as const };
  }
}
