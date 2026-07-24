import { apiRequest, ok } from "../api.js";

export const bookingTools = [
  {
    name: "booking_get_slots",
    description:
      "Get available booking slots for a business. Returns time slots " +
      "that can be booked by customers.",
    inputSchema: {
      type: "object" as const,
      properties: {
        booking_code: { type: "string", description: "Business booking code" },
        date: { type: "string", description: "Date to check (YYYY-MM-DD)" },
      },
      required: ["booking_code"],
    },
  },
  {
    name: "booking_create",
    description:
      "Create a new booking/appointment. Sends confirmation email to the customer " +
      "in their language (IT/EN/DE/FR/ES).",
    inputSchema: {
      type: "object" as const,
      properties: {
        booking_code: { type: "string", description: "Business booking code" },
        customer_name: { type: "string", description: "Customer full name" },
        customer_email: { type: "string", description: "Customer email" },
        customer_phone: { type: "string", description: "Customer phone" },
        date: { type: "string", description: "Booking date (YYYY-MM-DD)" },
        time: { type: "string", description: "Booking time (HH:MM)" },
        service: { type: "string", description: "Service name or ID" },
        notes: { type: "string", description: "Additional notes" },
      },
      required: ["booking_code", "customer_name", "customer_email", "date", "time"],
    },
  },
  {
    name: "booking_cancel",
    description: "Cancel an existing booking by its ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        booking_id: { type: "string", description: "Booking ID to cancel" },
      },
      required: ["booking_id"],
    },
  },
];

export async function handleBookingTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "booking_get_slots": {
      const params: Record<string, string> = {};
      if (args.date) params.date = args.date as string;
      return ok(await apiRequest(`/api/booking/${args.booking_code}/slots`, params));
    }
    case "booking_create": {
      const { booking_code, ...body } = args;
      return ok(await apiRequest(`/api/booking/${booking_code}`, undefined, "POST", body));
    }
    case "booking_cancel":
      return ok(await apiRequest(`/api/booking/manage/${args.booking_id}`, undefined, "DELETE"));
    default:
      return { content: [{ type: "text" as const, text: `Unknown booking tool: ${name}` }], isError: true as const };
  }
}
