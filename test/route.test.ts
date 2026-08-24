// Lo smistamento degli strumenti verso i moduli, e la gestione degli errori
// che fino a oggi non funzionava.

import { describe, it, expect, beforeEach, vi } from "vitest";

// Ogni modulo viene sostituito da una spia: cosi il test verifica CHI viene
// chiamato, senza dipendere da cosa fa.
const spie = {
    score: vi.fn(async () => ({ content: [{ type: "text", text: "score" }] })),
    crm: vi.fn(async () => ({ content: [{ type: "text", text: "crm" }] })),
    booking: vi.fn(async () => ({ content: [{ type: "text", text: "booking" }] })),
    invoice: vi.fn(async () => ({ content: [{ type: "text", text: "invoice" }] })),
    sara: vi.fn(async () => ({ content: [{ type: "text", text: "sara" }] })),
    finance: vi.fn(async () => ({ content: [{ type: "text", text: "finance" }] })),
    vertical: vi.fn(async () => ({ content: [{ type: "text", text: "vertical" }] })),
    workflow: vi.fn(async () => ({ content: [{ type: "text", text: "workflow" }] })),
};

vi.mock("../src/tools/score.js", () => ({ scoreTools: [], handleScoreTool: (...a: unknown[]) => spie.score(...a as []) }));
vi.mock("../src/tools/crm.js", () => ({ crmTools: [], handleCrmTool: (...a: unknown[]) => spie.crm(...a as []) }));
vi.mock("../src/tools/booking.js", () => ({ bookingTools: [], handleBookingTool: (...a: unknown[]) => spie.booking(...a as []) }));
vi.mock("../src/tools/invoice.js", () => ({ invoiceTools: [], handleInvoiceTool: (...a: unknown[]) => spie.invoice(...a as []) }));
vi.mock("../src/tools/sara.js", () => ({ saraTools: [], handleSaraTool: (...a: unknown[]) => spie.sara(...a as []) }));
vi.mock("../src/tools/finance.js", () => ({ financeTools: [], handleFinanceTool: (...a: unknown[]) => spie.finance(...a as []) }));
vi.mock("../src/tools/verticals.js", () => ({ verticalTools: [], handleVerticalTool: (...a: unknown[]) => spie.vertical(...a as []) }));
vi.mock("../src/tools/workflows.js", () => ({ workflowTools: [], handleWorkflowTool: (...a: unknown[]) => spie.workflow(...a as []) }));

const { routeTool } = await import("../src/index.js");

beforeEach(() => {
    Object.values(spie).forEach(s => s.mockClear());
});

describe("smistamento per prefisso", () => {
    it.each([
        ["crm_list_contacts", "crm"],
        ["booking_create", "booking"],
        ["invoice_send", "invoice"],
        ["sara_chat", "sara"],
        ["finance_summary", "finance"],
        ["vertical_kpis", "vertical"],
        ["workflow_run", "workflow"],
        ["score_qualcosa", "score"],
    ])("%s va a %s", async (nome, modulo) => {
        await routeTool(nome, {});
        expect(spie[modulo as keyof typeof spie]).toHaveBeenCalledOnce();
        // e nessun altro
        for (const [k, s] of Object.entries(spie)) {
            if (k !== modulo) expect(s, `${k} non doveva essere chiamato`).not.toHaveBeenCalled();
        }
    });

    // Questi sei sono nati prima della convenzione dei prefissi e i loro nomi
    // sono gia pubblicati: non si possono rinominare senza rompere chi li usa.
    it.each([
        "search_companies", "lookup_company", "company_report",
        "database_stats", "list_countries", "check_credits",
    ])("%s va allo score anche senza prefisso", async (nome) => {
        await routeTool(nome, {});
        expect(spie.score).toHaveBeenCalledOnce();
    });

    it("passa gli argomenti al modulo, non solo il nome", async () => {
        await routeTool("crm_list_contacts", { limit: 5 });
        expect(spie.crm).toHaveBeenCalledWith("crm_list_contacts", { limit: 5 });
    });

    it("uno strumento sconosciuto risponde con un errore, non con un guasto", async () => {
        const r = await routeTool("qualcosa_che_non_esiste", {});
        expect(r.isError).toBe(true);
        expect(r.content[0].text).toContain("qualcosa_che_non_esiste");
        for (const s of Object.values(spie)) expect(s).not.toHaveBeenCalled();
    });

    it("un prefisso che somiglia non basta: deve essere all inizio", async () => {
        const r = await routeTool("mio_crm_list", {});
        expect(r.isError).toBe(true);
        expect(spie.crm).not.toHaveBeenCalled();
    });
});

describe("errori di un modulo", () => {
    // Il difetto che questi test hanno scoperto: i gestori venivano
    // restituiti senza await, quindi la promessa si risolveva FUORI dal try
    // e il catch non catturava niente. Ogni errore dell'API usciva come
    // guasto di protocollo invece che come risposta con isError.
    it("un rifiuto diventa una risposta con isError, non un rifiuto", async () => {
        spie.crm.mockRejectedValueOnce(new Error("API 500: esploso"));
        const r = await routeTool("crm_list_contacts", {});
        expect(r.isError).toBe(true);
        expect(r.content[0].text).toBe("Error: API 500: esploso");
    });

    it("vale per ogni modulo, non solo per il primo", async () => {
        for (const [nome, prefisso] of Object.entries({
            score: "search_companies", crm: "crm_x", booking: "booking_x",
            invoice: "invoice_x", sara: "sara_x", finance: "finance_x",
            vertical: "vertical_x", workflow: "workflow_x",
        })) {
            spie[nome as keyof typeof spie].mockRejectedValueOnce(new Error("rotto"));
            const r = await routeTool(prefisso, {});
            expect(r.isError, nome).toBe(true);
            expect(r.content[0].text, nome).toBe("Error: rotto");
        }
    });

    it("anche un rifiuto che non e un Error diventa testo leggibile", async () => {
        spie.sara.mockRejectedValueOnce("stringa nuda");
        const r = await routeTool("sara_chat", {});
        expect(r.isError).toBe(true);
        expect(r.content[0].text).toBe("Error: stringa nuda");
    });

    it("una risposta buona passa intatta", async () => {
        const r = await routeTool("crm_list_contacts", {});
        expect(r.isError).toBeUndefined();
        expect(r.content[0].text).toBe("crm");
    });
});

describe("importare il modulo non avvia un server", () => {
    it("routeTool e utilizzabile senza che nulla si sia collegato allo stdio", async () => {
        // Se main() partisse all'import, questo test non arriverebbe qui:
        // il processo resterebbe appeso al trasporto stdio.
        const r = await routeTool("crm_list_contacts", {});
        expect(r).toBeDefined();
    });
});
