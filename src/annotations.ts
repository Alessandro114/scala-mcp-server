// Annotazioni dei tool (title + readOnlyHint/destructiveHint): obbligatorie per la
// Claude Directory e usate da Claude per i permessi automatici. Le letture girano
// senza conferma, ogni tool che modifica dati chiede conferma a ogni chiamata.

/** Livello del connettore remoto, deciso dal backend al consenso (whoami). */
export type Tier = "full";

/** Livello `full` (piani Growth, Scale, Enterprise): le 14 letture della v1. */
export const FULL_TIER_TOOLS = new Set([
  "crm_list_contacts", "crm_pipeline", "crm_contact_timeline",
  "finance_summary", "finance_health_score", "finance_cash_flow",
  "sara_conversations", "sara_insights", "sara_alerts", "sara_proactive",
  "vertical_kpis", "vertical_access",
  "workflow_list", "workflow_stats",
]);
/** Elenco dei tool del livello; livello sconosciuto = nessun tool (fail-closed). */
export function toolNamesForTier(tier: string): ReadonlySet<string> {
  return tier === "full" ? FULL_TIER_TOOLS : new Set();
}
// Esclusi dal remoto v1 perche' un account di prova non puo' farli riuscire senza configurazioni esterne:
// invoice_list (richiede Fatture in Cloud collegato), booking_get_slots (richiede una pagina di prenotazione pubblica).

/** Letture sul database Score (consumano crediti): sola lettura, ma non esposte in remoto v1. */
const SCORE_READ_TOOLS = new Set(["search_companies", "lookup_company", "list_countries", "check_credits"]);
/** Letture tenute fuori dal remoto v1: tabella libera / risposta binaria. */
const OTHER_READ_TOOLS = new Set(["vertical_list_data", "invoice_get_pdf"]);

const TITLES: Record<string, string> = {
  crm_list_contacts: "List CRM contacts", crm_create_contact: "Create CRM contact", crm_update_contact: "Update CRM contact",
  crm_pipeline: "View sales pipeline", crm_contact_timeline: "Contact activity timeline",
  booking_get_slots: "Available booking slots", booking_create: "Create booking", booking_cancel: "Cancel booking",
  invoice_list: "List invoices", invoice_create: "Create invoice", invoice_send: "Send invoice by email", invoice_get_pdf: "Get invoice PDF",
  sara_chat: "Chat with SARA", sara_conversations: "List SARA conversations", sara_insights: "SARA business insights",
  sara_alerts: "Business alerts", sara_proactive: "SARA proactive suggestions",
  finance_summary: "Financial summary", finance_health_score: "Business health score", finance_cash_flow: "Cash flow analysis",
  vertical_kpis: "Vertical module KPIs", vertical_list_data: "List vertical records", vertical_create_record: "Create vertical record",
  vertical_access: "Active vertical modules",
  workflow_list: "List workflows", workflow_run: "Run workflow", workflow_stats: "Workflow statistics",
  search_companies: "Search companies", lookup_company: "Company profile", list_countries: "Score countries", check_credits: "Score credits",
};

type Tool = { name: string; [k: string]: unknown };

export function isReadOnly(name: string): boolean {
  return FULL_TIER_TOOLS.has(name) || SCORE_READ_TOOLS.has(name) || OTHER_READ_TOOLS.has(name);
}

/** Aggiunge title e hint a ogni tool. */
export function withAnnotations<T extends Tool>(tools: T[]): (T & { title: string; annotations: Record<string, unknown> })[] {
  return tools.map((t) => {
    const title = TITLES[t.name] ?? t.name;
    const readOnly = isReadOnly(t.name);
    return {
      ...t,
      title,
      annotations: readOnly
        ? { title, readOnlyHint: true, openWorldHint: false }
        : { title, readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    };
  });
}
