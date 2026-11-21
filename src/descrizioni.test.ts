// Le descrizioni dei tool devono corrispondere a cio' che il backend restituisce davvero (Software Directory Policy 2.A).
// Verificato nel codice del backend il 17/11/2026; qui si bloccano le frasi false trovate quel giorno.
process.env.MCP_REMOTE = "1";

import test from "node:test";
import assert from "node:assert/strict";

const { crmTools } = await import("./tools/crm.js");
const { financeTools } = await import("./tools/finance.js");
const { saraTools } = await import("./tools/sara.js");
const { workflowTools } = await import("./tools/workflows.js");
const { verticalTools } = await import("./tools/verticals.js");
const { accorciaCampi } = await import("./pagina.js");

type Tool = { name: string; description: string; inputSchema: { properties?: Record<string, unknown> } };
const tutti = [...crmTools, ...financeTools, ...saraTools, ...workflowTools, ...verticalTools] as Tool[];
const d = (n: string) => {
  const t = tutti.find((x) => x.name === n);
  assert.ok(t, `tool ${n} mancante`);
  return t;
};

test("finance_summary: solo cio' che il backend restituisce (YTD, costi, margini, utile)", () => {
  const t = d("finance_summary");
  const senzaAvviso = t.description.replace(/Does not include outstanding invoices or monthly trends\./, "");
  assert.doesNotMatch(senzaAvviso, /outstanding invoices|cash position|month-over-month/i);
  assert.match(t.description, /year-to-date/i);
  assert.match(t.description, /EBITDA/);
  assert.match(t.description, /Does not include outstanding invoices/);
});

test("finance_health_score: i quattro fattori veri, non liquidita'/scaduto/burn rate", () => {
  const t = d("finance_health_score");
  assert.doesNotMatch(t.description, /liquidity|receivables aging|burn rate/i);
  for (const w of [/profit margin/i, /revenue growth/i, /collection rate/i, /business activity/i, /A-F/]) assert.match(t.description, w);
});

test("finance_cash_flow: mensile + proiezione; nessun parametro period (il backend lo ignora)", () => {
  const t = d("finance_cash_flow");
  assert.equal(t.inputSchema.properties?.period, undefined);
  assert.ok(t.inputSchema.properties?.months);
  assert.doesNotMatch(t.description, /daily|weekly/i);
  assert.match(t.description, /monthly/i);
  assert.match(t.description, /projection/i);
});

test("crm_pipeline: elenco piatto, non raggruppato", () => {
  const t = d("crm_pipeline");
  assert.doesNotMatch(t.description, /grouped by stage with counts/i);
  assert.match(t.description, /flat list/i);
  assert.match(t.description, /has_more/);
});

test("crm_list_contacts: dichiara paginazione e note accorciate", () => {
  const t = d("crm_list_contacts");
  assert.match(t.description, /notes_truncated/);
  assert.match(t.description, /offset/);
  assert.ok(t.inputSchema.properties?.offset);
});

test("crm_contact_timeline: niente 'deals' ne' 'full'", () => {
  const t = d("crm_contact_timeline");
  assert.doesNotMatch(t.description, /\bdeals\b|\bfull\b/i);
  assert.match(t.description, /tasks/);
});

test("sara_insights: calcolati dall'attivita' WhatsApp, non 'AI-generated' ne' anomalie/raccomandazioni", () => {
  const t = d("sara_insights");
  assert.doesNotMatch(t.description, /AI-generated|anomalies|recommendations/i);
  assert.match(t.description, /WhatsApp/);
  assert.match(t.description, /empty/i);
});

test("workflow_list e workflow_stats: niente success rate / avg duration / paused", () => {
  assert.doesNotMatch(d("workflow_list").description, /paused/i);
  assert.doesNotMatch(d("workflow_list").description.replace(/Does not include a success rate\./, ""), /success rate/i);
  const s = d("workflow_stats").description;
  assert.doesNotMatch(s, /success rate|avg duration/i);
  assert.match(s, /failed runs/);
});

test("accorciaCampi: note lunghe tagliate e segnalate; corte e altri campi intatti", () => {
  const r = accorciaCampi({ contacts: [{ id: 1, notes: "x".repeat(2000) }, { id: 2, notes: "ok" }, { id: 3 }], page: { has_more: true } }, "contacts", "notes", 200) as {
    contacts: { id: number; notes?: string; notes_truncated?: boolean }[];
    page: unknown;
  };
  assert.equal(r.contacts[0].notes?.length, 201);
  assert.equal(r.contacts[0].notes_truncated, true);
  assert.equal(r.contacts[1].notes, "ok");
  assert.equal(r.contacts[1].notes_truncated, undefined);
  assert.equal(r.contacts[2].notes, undefined);
  assert.deepEqual(r.page, { has_more: true });
});

test("accorciaCampi: forme inattese passano senza errori", () => {
  assert.equal(accorciaCampi(null, "contacts", "notes", 200), null);
  assert.deepEqual(accorciaCampi({ altro: 1 }, "contacts", "notes", 200), { altro: 1 });
  assert.deepEqual(accorciaCampi({ contacts: [null, 5, "s"] }, "contacts", "notes", 200), { contacts: [null, 5, "s"] });
});
