// Il server provato ATTRAVERSO il protocollo MCP, non aggirandolo.
//
// I test negli altri file chiamano le funzioni interne. Questi collegano un
// client vero con un trasporto in memoria e fanno le stesse richieste che
// farebbe Claude Desktop: cosi si verifica anche il cablaggio — che ogni
// gestore sia registrato, che le capacita dichiarate corrispondano a quelle
// che rispondono, che il formato delle risposte sia quello atteso dal client.
//
// E il cablaggio e esattamente cio che nessun test unitario vede: un
// setRequestHandler dimenticato non rompe nessuna funzione, rompe il prodotto.

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

const apiRequest = vi.fn(async () => ({ risposta: "finta" }));
vi.mock("../src/api.js", async (originale) => ({
    ...(await originale<Record<string, unknown>>()),
    apiRequest: (...a: unknown[]) => apiRequest(...a as []),
}));

const { server } = await import("../src/index.js");

let client: Client;

beforeAll(async () => {
    const [aClient, aServer] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: "prova", version: "0" }, { capabilities: {} });
    await Promise.all([server.connect(aServer), client.connect(aClient)]);
});

afterAll(async () => {
    await client.close();
});

describe("strumenti", () => {
    it("il server ne elenca piu di trenta", async () => {
        const { tools } = await client.listTools();
        expect(tools.length).toBeGreaterThan(30);
    });

    it("ogni strumento elencato ha nome, descrizione e schema", async () => {
        const { tools } = await client.listTools();
        for (const t of tools) {
            expect(typeof t.name).toBe("string");
            expect(typeof t.description, t.name).toBe("string");
            expect(t.inputSchema?.type, t.name).toBe("object");
        }
    });

    it("nessun nome duplicato nell elenco che vede il client", async () => {
        const { tools } = await client.listTools();
        const nomi = tools.map(t => t.name);
        expect(nomi.length).toBe(new Set(nomi).size);
    });

    it("chiamarne uno arriva fino all API", async () => {
        apiRequest.mockClear();
        const r = await client.callTool({ name: "finance_summary", arguments: {} });
        expect(apiRequest).toHaveBeenCalledWith("/api/finance/summary");
        expect((r.content as Array<{ type: string }>)[0].type).toBe("text");
    });

    it("gli argomenti attraversano il protocollo intatti", async () => {
        apiRequest.mockClear();
        await client.callTool({ name: "crm_list_contacts", arguments: { search: "rossi", limit: 7 } });
        expect(apiRequest).toHaveBeenCalledWith("/api/crm/contacts", { search: "rossi", limit: "7" });
    });

    it("uno strumento senza argomenti non fa cadere il server", async () => {
        apiRequest.mockClear();
        const r = await client.callTool({ name: "sara_alerts" });
        expect(r.isError).toBeFalsy();
    });

    it("uno strumento inesistente torna come errore nel contenuto, non come guasto", async () => {
        const r = await client.callTool({ name: "non_esiste_affatto", arguments: {} });
        expect(r.isError).toBe(true);
        expect((r.content as Array<{ text: string }>)[0].text).toContain("non_esiste_affatto");
    });

    it("un errore dell API diventa isError e non fa cadere la connessione", async () => {
        apiRequest.mockRejectedValueOnce(new Error("API 500: esploso"));
        const r = await client.callTool({ name: "finance_summary", arguments: {} });
        expect(r.isError).toBe(true);
        expect((r.content as Array<{ text: string }>)[0].text).toContain("esploso");

        // e la connessione regge: la chiamata successiva funziona ancora
        apiRequest.mockClear();
        const dopo = await client.callTool({ name: "finance_summary", arguments: {} });
        expect(dopo.isError).toBeFalsy();
    });
});

describe("risorse", () => {
    it("il server le elenca", async () => {
        const { resources } = await client.listResources();
        expect(resources.length).toBeGreaterThan(0);
    });

    it("ognuna di quelle elencate si legge davvero", async () => {
        const { resources } = await client.listResources();
        for (const r of resources) {
            const c = await client.readResource({ uri: r.uri });
            expect(c.contents.length, r.uri).toBeGreaterThan(0);
        }
    });

    it("una risorsa inesistente torna come errore di protocollo", async () => {
        await expect(client.readResource({ uri: "scala://mai-vista" })).rejects.toThrow();
    });
});

describe("prompt", () => {
    it("il server li elenca", async () => {
        const { prompts } = await client.listPrompts();
        expect(prompts.length).toBeGreaterThan(0);
    });

    it("ognuno di quelli elencati si ottiene davvero", async () => {
        const { prompts } = await client.listPrompts();
        for (const p of prompts) {
            const g = await client.getPrompt({ name: p.name, arguments: {} });
            expect(g.messages.length, p.name).toBeGreaterThan(0);
        }
    });

    it("gli argomenti arrivano al prompt", async () => {
        const g = await client.getPrompt({
            name: "enterprise_pitch",
            arguments: { company_name: "Ferrero" },
        });
        const testo = g.messages.map(m => (m.content as { text: string }).text).join("\n");
        expect(testo).toContain("Ferrero");
    });

    it("un prompt inesistente torna come errore di protocollo", async () => {
        await expect(client.getPrompt({ name: "mai_visto", arguments: {} })).rejects.toThrow();
    });
});
