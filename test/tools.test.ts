// Ogni strumento, e la chiamata che produce.
//
// Non verificano che l'API risponda: verificano il contratto fra il server MCP
// e l'API — endpoint, metodo, parametri, corpo. E il pezzo che si rompe in
// silenzio quando l'API sposta una rotta, e che nessuno si accorge finche un
// utente non chiede a Claude una cosa che non funziona piu.

import { describe, it, expect, beforeEach, vi } from "vitest";

const apiRequest = vi.fn(async () => ({ risposta: "ok" }));
const scoreRequest = vi.fn(async () => ({ risposta: "ok" }));
vi.mock("../src/api.js", async (originale) => ({
    ...(await originale<Record<string, unknown>>()),
    apiRequest: (...a: unknown[]) => apiRequest(...a as []),
    scoreRequest: (...a: unknown[]) => scoreRequest(...a as []),
}));

const { handleScoreTool } = await import("../src/tools/score.js");
const { handleCrmTool } = await import("../src/tools/crm.js");
const { handleBookingTool } = await import("../src/tools/booking.js");
const { handleInvoiceTool } = await import("../src/tools/invoice.js");
const { handleSaraTool } = await import("../src/tools/sara.js");
const { handleFinanceTool } = await import("../src/tools/finance.js");
const { handleVerticalTool } = await import("../src/tools/verticals.js");
const { handleWorkflowTool } = await import("../src/tools/workflows.js");

beforeEach(() => { apiRequest.mockClear(); scoreRequest.mockClear(); });

/** [gestore, nome, argomenti, chiamata attesa a apiRequest] */
type Caso = [Function, string, Record<string, unknown>, unknown[]];

const CASI: Caso[] = [
    // ── crm ──
    [handleCrmTool, "crm_list_contacts", {}, ["/api/crm/contacts", { limit: "20", offset: "0" }]],
    [handleCrmTool, "crm_list_contacts", { search: "rossi", stage: "lead", limit: 20 },
        ["/api/crm/contacts", { search: "rossi", stage: "lead", limit: "20", offset: "0" }]],
    [handleCrmTool, "crm_create_contact", { name: "Mario" },
        ["/api/crm/contacts", undefined, "POST", { name: "Mario" }]],
    // l'identificativo va nel percorso, NON nel corpo dell'aggiornamento
    [handleCrmTool, "crm_update_contact", { id: "c9", name: "nuovo" },
        ["/api/crm/contacts/c9", undefined, "PATCH", { name: "nuovo" }]],
    [handleCrmTool, "crm_pipeline", {}, ["/api/crm/pipeline", { limit: "50", offset: "0" }]],
    [handleCrmTool, "crm_contact_timeline", { contact_id: "c9" },
        ["/api/crm/contacts/c9/timeline"]],

    // ── booking ──
    [handleBookingTool, "booking_get_slots", { booking_code: "abc" },
        ["/api/booking/abc/slots", {}]],
    [handleBookingTool, "booking_get_slots", { booking_code: "abc", date: "2026-09-01" },
        ["/api/booking/abc/slots", { date: "2026-09-01" }]],
    // anche qui il codice esce dal corpo ed entra nel percorso
    [handleBookingTool, "booking_create", { booking_code: "abc", nome: "Mario" },
        ["/api/booking/abc", undefined, "POST", { nome: "Mario" }]],
    [handleBookingTool, "booking_cancel", { booking_id: "b1" },
        ["/api/booking/manage/b1", undefined, "DELETE"]],

    // ── invoice ──
    [handleInvoiceTool, "invoice_list", {}, ["/api/invoicing/list", {}]],
    [handleInvoiceTool, "invoice_list", { status: "unpaid", limit: 5 },
        ["/api/invoicing/list", { status: "unpaid", limit: "5" }]],
    [handleInvoiceTool, "invoice_create", { totale: 100 },
        ["/api/invoicing/create", undefined, "POST", { totale: 100 }]],
    [handleInvoiceTool, "invoice_send", { invoice_id: "f1" },
        ["/api/invoicing/f1/send", undefined, "POST"]],
    [handleInvoiceTool, "invoice_get_pdf", { invoice_id: "f1" },
        ["/api/invoicing/f1/pdf"]],

    // ── sara ──
    [handleSaraTool, "sara_chat", { message: "ciao", conversation_id: "k1" },
        ["/api/sara/chat", undefined, "POST", { message: "ciao", conversation_id: "k1" }]],
    [handleSaraTool, "sara_conversations", {}, ["/api/sara/conversations", { limit: "20", offset: "0" }]],
    [handleSaraTool, "sara_conversations", { limit: 3 },
        ["/api/sara/conversations", { limit: "3", offset: "0" }]],
    [handleSaraTool, "sara_insights", {}, ["/api/sara/business-insights"]],
    [handleSaraTool, "sara_alerts", {}, ["/api/sara/alerts", { limit: "20", offset: "0" }]],
    [handleSaraTool, "sara_proactive", {}, ["/api/sara/proactive"]],

    // ── finance ──
    [handleFinanceTool, "finance_summary", {}, ["/api/finance/summary"]],
    [handleFinanceTool, "finance_health_score", {}, ["/api/finance/health-score"]],
    [handleFinanceTool, "finance_cash_flow", {}, ["/api/finance/cash-flow", {}]],
    // `period` non esiste piu: il backend non lo legge (descrizioni fedeli alle risposte vere, Policy 2.A)
    [handleFinanceTool, "finance_cash_flow", { period: "mensile", months: 6 },
        ["/api/finance/cash-flow", { months: "6" }]],

    // ── verticals ──
    [handleVerticalTool, "vertical_kpis", { vertical: "dineos" }, ["/api/dineos/kpis"]],
    [handleVerticalTool, "vertical_list_data", { table: "okrs" }, ["/api/data/okrs", {}]],
    [handleVerticalTool, "vertical_list_data", { table: "okrs", limit: 5, search: "q" },
        ["/api/data/okrs", { limit: "5", search: "q" }]],
    // il record sta in args.data, non in args
    [handleVerticalTool, "vertical_create_record", { table: "okrs", data: { objective: "x" } },
        ["/api/data/okrs", undefined, "POST", { objective: "x" }]],
    [handleVerticalTool, "vertical_access", {}, ["/api/verticals/access"]],

    // ── workflows ──
    [handleWorkflowTool, "workflow_list", {}, ["/api/workflows/list"]],
    [handleWorkflowTool, "workflow_run", { workflow_id: "w1", input: { a: 1 } },
        ["/api/workflows/w1/run", undefined, "POST", { input: { a: 1 } }]],
    [handleWorkflowTool, "workflow_stats", {}, ["/api/workflows/stats"]],
];

describe("ogni strumento chiama l endpoint giusto", () => {
    it.each(CASI)("%# %s", async (gestore, nome, args, attesa) => {
        await (gestore as (n: string, a: Record<string, unknown>) => Promise<unknown>)(nome, args);
        expect(apiRequest).toHaveBeenCalledOnce();
        expect(apiRequest).toHaveBeenCalledWith(...(attesa as []));
    });
});

// Lo Score e un servizio separato (score.get-scala.com/api/v1, X-API-Key): passa da scoreRequest, non da apiRequest.
const CASI_SCORE: Array<[string, Record<string, unknown>, unknown[]]> = [
    ["search_companies", { query: "Ferrero" }, ["/search", { limit: "10", q: "Ferrero" }]],
    ["search_companies", { tax_id: "IT00159560366", country: "it", limit: 500 },
        ["/search", { limit: "100", tax_id: "IT00159560366", country: "IT" }]],
    ["search_companies", { query: "x", limit: "abc" }, ["/search", { limit: "10", q: "x" }]],
    ["lookup_company", { company_id: "IT 1" }, ["/company/IT%201"]],
    ["list_countries", {}, ["/countries"]],
    ["check_credits", {}, ["/usage"]],
];

describe("gli strumenti Score chiamano il servizio Score", () => {
    it.each(CASI_SCORE)("%s %j", async (nome, args, attesa) => {
        await handleScoreTool(nome, args);
        expect(scoreRequest).toHaveBeenCalledOnce();
        expect(scoreRequest).toHaveBeenCalledWith(...(attesa as [string]));
        expect(apiRequest).not.toHaveBeenCalled();
    });

    it("search_companies senza nome ne tax_id risponde con un errore e non chiama niente", async () => {
        const r = await handleScoreTool("search_companies", {}) as { isError?: boolean };
        expect(r.isError).toBe(true);
        expect(scoreRequest).not.toHaveBeenCalled();
    });

    it("lookup_company senza id risponde con un errore e non chiama niente", async () => {
        const r = await handleScoreTool("lookup_company", {}) as { isError?: boolean };
        expect(r.isError).toBe(true);
        expect(scoreRequest).not.toHaveBeenCalled();
    });
});

describe("la risposta viene incartata come vuole il protocollo MCP", () => {
    it("il contenuto e testo, e il testo e JSON leggibile", async () => {
        apiRequest.mockResolvedValueOnce({ a: 1 } as never);
        const r = await handleFinanceTool("finance_summary", {}) as {
            content: Array<{ type: string; text: string }>;
        };
        expect(r.content[0].type).toBe("text");
        expect(JSON.parse(r.content[0].text)).toEqual({ a: 1 });
    });
});

describe("uno strumento sconosciuto dentro un modulo", () => {
    it.each([
        [handleScoreTool, "score", "Unknown score tool"],
        [handleCrmTool, "crm", "Unknown CRM tool"],
        [handleBookingTool, "booking", "Unknown booking tool"],
        [handleInvoiceTool, "invoice", "Unknown invoice tool"],
        [handleSaraTool, "sara", "Unknown SARA tool"],
        [handleFinanceTool, "finance", "Unknown finance tool"],
        [handleVerticalTool, "vertical", "Unknown vertical tool"],
        [handleWorkflowTool, "workflow", "Unknown workflow tool"],
    ])("%# %s risponde con isError e non chiama l API", async (gestore, _m, messaggio) => {
        const r = await (gestore as (n: string, a: Record<string, unknown>) => Promise<{
            isError?: boolean; content: Array<{ text: string }>;
        }>)("qualcosa_di_inventato", {});
        expect(r.isError).toBe(true);
        expect(r.content[0].text).toContain(messaggio);
        expect(apiRequest).not.toHaveBeenCalled();
    });
});

describe("le dichiarazioni degli strumenti", () => {
    it("ogni strumento dichiarato ha nome, descrizione e schema", async () => {
        const moduli = await Promise.all([
            import("../src/tools/score.js"), import("../src/tools/crm.js"),
            import("../src/tools/booking.js"), import("../src/tools/invoice.js"),
            import("../src/tools/sara.js"), import("../src/tools/finance.js"),
            import("../src/tools/verticals.js"), import("../src/tools/workflows.js"),
        ]);
        const tutti = moduli.flatMap(m => Object.values(m).find(Array.isArray) ?? []) as Array<{
            name: string; description: string; inputSchema: { type: string };
        }>;
        expect(tutti.length).toBeGreaterThan(30);
        for (const t of tutti) {
            expect(typeof t.name, JSON.stringify(t)).toBe("string");
            expect(typeof t.description, t.name).toBe("string");
            expect(t.inputSchema?.type, t.name).toBe("object");
        }
    });

    it("nessun nome di strumento e duplicato fra i moduli", async () => {
        const moduli = await Promise.all([
            import("../src/tools/score.js"), import("../src/tools/crm.js"),
            import("../src/tools/booking.js"), import("../src/tools/invoice.js"),
            import("../src/tools/sara.js"), import("../src/tools/finance.js"),
            import("../src/tools/verticals.js"), import("../src/tools/workflows.js"),
        ]);
        const nomi = (moduli.flatMap(m => Object.values(m).find(Array.isArray) ?? []) as Array<{ name: string }>)
            .map(t => t.name);
        expect(nomi.length).toBe(new Set(nomi).size);
    });
});
