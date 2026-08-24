// apiRequest e il punto da cui passa OGNI strumento del server. Se sbaglia
// qui, sbagliano tutti e otto i moduli insieme.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const AMBIENTE = { ...process.env };

interface Chiamata { url: string; init: RequestInit }
let viste: Chiamata[];

function rispondi(corpo: unknown, { ok = true, status = 200, testo = "" } = {}) {
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
        viste.push({ url, init });
        return { ok, status, json: async () => corpo, text: async () => testo } as unknown as Response;
    }));
}

beforeEach(() => {
    viste = [];
    vi.resetModules();
    process.env.SCALA_API_KEY = "chiave-di-prova";
    delete process.env.SCALA_API_URL;
    delete process.env.SCALA_BASE_URL;
});

afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...AMBIENTE };
});

const carica = async () => (await import("../src/api.js"));

describe("indirizzo", () => {
    it("usa app.get-scala.com quando non gli si dice altro", async () => {
        rispondi({});
        const { apiRequest } = await carica();
        await apiRequest("/api/score/stats");
        expect(viste[0].url).toBe("https://app.get-scala.com/api/score/stats");
    });

    it("SCALA_API_URL ha la precedenza", async () => {
        process.env.SCALA_API_URL = "https://uno.test";
        process.env.SCALA_BASE_URL = "https://due.test";
        rispondi({});
        const { apiRequest } = await carica();
        await apiRequest("/x");
        expect(viste[0].url).toBe("https://uno.test/x");
    });

    it("SCALA_BASE_URL vale se SCALA_API_URL manca", async () => {
        process.env.SCALA_BASE_URL = "https://due.test";
        rispondi({});
        const { apiRequest } = await carica();
        await apiRequest("/x");
        expect(viste[0].url).toBe("https://due.test/x");
    });

    it("toglie la barra finale, per non produrre un doppio slash", async () => {
        process.env.SCALA_API_URL = "https://uno.test/";
        rispondi({});
        const { apiRequest } = await carica();
        await apiRequest("/x");
        expect(viste[0].url).toBe("https://uno.test/x");
    });
});

describe("parametri", () => {
    it("li mette in coda quando ci sono", async () => {
        rispondi({});
        const { apiRequest } = await carica();
        await apiRequest("/cerca", { q: "Ferrero", limit: "10" });
        expect(viste[0].url).toContain("q=Ferrero");
        expect(viste[0].url).toContain("limit=10");
    });

    it("scarta i vuoti invece di mandarli", async () => {
        rispondi({});
        const { apiRequest } = await carica();
        await apiRequest("/cerca", { q: "x", country: "", nace: undefined as unknown as string });
        expect(viste[0].url).not.toContain("country=");
        expect(viste[0].url).not.toContain("nace=");
    });

    it("se restano solo parametri vuoti non aggiunge il punto interrogativo", async () => {
        rispondi({});
        const { apiRequest } = await carica();
        await apiRequest("/cerca", { a: "", b: "" });
        expect(viste[0].url).toBe("https://app.get-scala.com/cerca");
    });

    it("codifica i valori invece di spezzare l indirizzo", async () => {
        rispondi({});
        const { apiRequest } = await carica();
        await apiRequest("/cerca", { q: "Rossi & Figli" });
        expect(viste[0].url).toContain("q=Rossi+%26+Figli");
    });
});

describe("autenticazione", () => {
    it("manda la chiave nell intestazione e mai nell indirizzo", async () => {
        rispondi({});
        const { apiRequest } = await carica();
        await apiRequest("/x");
        const h = viste[0].init.headers as Record<string, string>;
        expect(h["X-API-Key"]).toBe("chiave-di-prova");
        expect(viste[0].url).not.toContain("chiave-di-prova");
    });

    it("legge la chiave al momento della chiamata, non all import", async () => {
        // Serve per i test, ma serve anche in produzione: un server MCP puo
        // vivere ore, e una chiave cambiata deve avere effetto.
        rispondi({});
        const { apiRequest } = await carica();
        process.env.SCALA_API_KEY = "chiave-nuova";
        await apiRequest("/x");
        expect((viste[0].init.headers as Record<string, string>)["X-API-Key"]).toBe("chiave-nuova");
    });
});

describe("corpo e metodo", () => {
    it("una GET non porta corpo", async () => {
        rispondi({});
        const { apiRequest } = await carica();
        await apiRequest("/x");
        expect(viste[0].init.method).toBe("GET");
        expect(viste[0].init.body).toBeUndefined();
    });

    it("una POST porta il corpo serializzato", async () => {
        rispondi({});
        const { apiRequest } = await carica();
        await apiRequest("/x", undefined, "POST", { a: 1 });
        expect(viste[0].init.method).toBe("POST");
        expect(JSON.parse(viste[0].init.body as string)).toEqual({ a: 1 });
    });
});

describe("errori", () => {
    it("solleva riportando stato e corpo", async () => {
        rispondi(null, { ok: false, status: 429, testo: "rate limited" });
        const { apiRequest } = await carica();
        await expect(apiRequest("/x")).rejects.toThrow("API 429: rate limited");
    });

    it("tronca un corpo lunghissimo invece di riversarlo nel messaggio", async () => {
        rispondi(null, { ok: false, status: 500, testo: "x".repeat(5000) });
        const { apiRequest } = await carica();
        await expect(apiRequest("/x")).rejects.toThrow(/^API 500: x{500}$/);
    });
});
