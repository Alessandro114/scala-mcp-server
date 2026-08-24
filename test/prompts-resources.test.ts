// Prompt e risorse: la parte del server MCP che non chiama l'API ma che
// Claude legge testualmente. Un prompt che rimanda a un numero sbagliato o una
// risorsa che sparisce non danno errore: danno una risposta convincente e
// falsa, che e peggio.

import { describe, it, expect } from "vitest";
import { prompts, handlePrompt } from "../src/prompts.js";
import { resources, handleResource } from "../src/resources.js";

describe("dichiarazione dei prompt", () => {
    it("ce n e almeno uno e ognuno ha nome e descrizione", () => {
        expect(prompts.length).toBeGreaterThan(0);
        for (const p of prompts) {
            expect(typeof p.name, JSON.stringify(p)).toBe("string");
            expect(typeof p.description, p.name).toBe("string");
        }
    });

    it("ogni prompt dichiarato risponde davvero", () => {
        for (const p of prompts) {
            const r = handlePrompt(p.name, {}) as { messages?: unknown[] };
            expect(r.messages, `${p.name} non produce messaggi`).toBeDefined();
            expect(r.messages!.length, p.name).toBeGreaterThan(0);
        }
    });

    it("nessun nome duplicato", () => {
        const nomi = prompts.map(p => p.name);
        expect(nomi.length).toBe(new Set(nomi).size);
    });

    it("gli argomenti dichiarati hanno un nome", () => {
        for (const p of prompts) {
            for (const a of (p.arguments ?? [])) {
                expect(typeof a.name, p.name).toBe("string");
            }
        }
    });
});

describe("i prompt senza argomenti non producono buchi", () => {
    it.each([undefined, {}])("con %o non compare 'undefined' nel testo", (args) => {
        for (const p of prompts) {
            const r = handlePrompt(p.name, args as Record<string, string> | undefined) as {
                messages: Array<{ content: { text: string } }>;
            };
            const testo = r.messages.map(m => m.content.text).join("\n");
            expect(testo, `${p.name} lascia un undefined nel testo`).not.toContain("undefined");
            expect(testo, `${p.name} lascia un [object Object]`).not.toContain("[object Object]");
        }
    });
});

describe("i prompt usano gli argomenti che ricevono", () => {
    it("enterprise_pitch riporta il nome dell azienda", () => {
        const r = handlePrompt("enterprise_pitch", { company_name: "Ferrero" }) as {
            messages: Array<{ content: { text: string } }>;
        };
        expect(r.messages[0].content.text).toContain("Ferrero");
    });

    it("senza nome mette un segnaposto e non una stringa vuota", () => {
        const r = handlePrompt("enterprise_pitch", {}) as {
            messages: Array<{ content: { text: string } }>;
        };
        expect(r.messages[0].content.text).toContain("the prospect");
    });

    it("il ruolo dei messaggi e sempre dichiarato", () => {
        for (const p of prompts) {
            const r = handlePrompt(p.name, {}) as { messages: Array<{ role: string }> };
            for (const m of r.messages) expect(typeof m.role, p.name).toBe("string");
        }
    });
});

describe("un prompt sconosciuto", () => {
    it("solleva invece di restituire messaggi vuoti", () => {
        expect(() => handlePrompt("prompt_inventato", {})).toThrow(/Unknown prompt/);
    });

    it("il messaggio dice quale prompt e stato chiesto", () => {
        expect(() => handlePrompt("prompt_inventato", {})).toThrow(/prompt_inventato/);
    });
});

describe("risorse", () => {
    it("ne dichiara almeno una e ognuna ha uri e nome", () => {
        expect(resources.length).toBeGreaterThan(0);
        for (const r of resources) {
            expect(typeof r.uri, JSON.stringify(r)).toBe("string");
            expect(typeof r.name, r.uri).toBe("string");
        }
    });

    it("ogni risorsa dichiarata si legge davvero", async () => {
        for (const r of resources) {
            const c = await handleResource(r.uri) as { contents: Array<{ text: string }> };
            expect(c.contents.length, r.uri).toBeGreaterThan(0);
            expect(c.contents[0].text.length, r.uri).toBeGreaterThan(0);
        }
    });

    it.each(["scala://pricing", "scala://verticals", "scala://capabilities"])(
        "%s restituisce JSON valido, non testo qualsiasi",
        async (uri) => {
            const c = await handleResource(uri) as {
                contents: Array<{ uri: string; mimeType: string; text: string }>;
            };
            expect(c.contents[0].uri).toBe(uri);
            expect(c.contents[0].mimeType).toBe("application/json");
            expect(() => JSON.parse(c.contents[0].text)).not.toThrow();
        }
    );

    it("una risorsa sconosciuta solleva invece di restituire vuoto", async () => {
        await expect(handleResource("scala://inventata")).rejects.toThrow(/Unknown resource/);
    });

    it("gli uri dichiarati e quelli gestiti coincidono", async () => {
        // Se qualcuno aggiunge una risorsa all'elenco senza gestirla, Claude
        // la vede, la chiede, e riceve un errore.
        for (const r of resources) {
            await expect(handleResource(r.uri), r.uri).resolves.toBeDefined();
        }
    });
});

describe("i prompt con tutti gli argomenti valorizzati", () => {
    // Ogni prompt ha dei campi opzionali resi con `${x ? ... : ""}`. Senza
    // questi casi meta di quei rami non viene mai percorsa, e un errore
    // dentro il ramo "valorizzato" resterebbe invisibile.
    it("enterprise_pitch riporta anche la dimensione dell azienda", () => {
        const r = handlePrompt("enterprise_pitch", {
            company_name: "Ferrero", vertical: "dine",
            pain_point: "code al banco", company_size: "500 dipendenti",
        }) as { messages: Array<{ content: { text: string } }> };
        const t = r.messages[0].content.text;
        expect(t).toContain("500 dipendenti");
        expect(t).toContain("dine");
        expect(t).toContain("code al banco");
    });

    it("business_analysis riporta anche il paese", () => {
        const r = handlePrompt("business_analysis", {
            company_name: "Ferrero", country: "IT",
        }) as { messages: Array<{ content: { text: string } }> };
        const t = r.messages[0].content.text;
        expect(t).toContain("Ferrero");
        expect(t).toContain("IT");
    });

    it("onboarding_guide riporta anche gli obiettivi", () => {
        const r = handlePrompt("onboarding_guide", {
            business_type: "ristorante", goals: "ridurre i no-show",
        }) as { messages: Array<{ content: { text: string } }> };
        const t = r.messages[0].content.text;
        expect(t).toContain("ristorante");
        expect(t).toContain("ridurre i no-show");
    });

    it("nessuno dei tre lascia una riga vuota al posto del campo assente", () => {
        for (const nome of ["enterprise_pitch", "business_analysis", "onboarding_guide"]) {
            const r = handlePrompt(nome, {}) as { messages: Array<{ content: { text: string } }> };
            expect(r.messages[0].content.text, nome).not.toMatch(/\n\s*:\s*\n/);
        }
    });
});

describe("gli aiuti di formattazione delle risposte", () => {
    it("err marca la risposta come errore e non la incarta in JSON", async () => {
        const { err } = await import("../src/api.js");
        const r = err("qualcosa e andato storto");
        expect(r.isError).toBe(true);
        expect(r.content[0].text).toBe("qualcosa e andato storto");
    });

    it("ok incarta il dato in JSON leggibile", async () => {
        const { ok } = await import("../src/api.js");
        const r = ok({ a: 1 });
        expect(r.content[0].type).toBe("text");
        expect(JSON.parse(r.content[0].text)).toEqual({ a: 1 });
    });
});
