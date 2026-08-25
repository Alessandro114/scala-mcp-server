// L'eseguibile vero, avviato come lo avvia Claude Desktop.
//
// Gli altri test importano i moduli. Questo lancia `node dist/index.js` come
// processo separato e ci parla sopra lo stdio con il protocollo MCP, che e
// esattamente cio che fa un client reale.
//
// E l'ultimo pezzo scoperto del file: main() e la guardia che decide se
// avviarsi. Coprirli importando il modulo non si puo — la guardia esiste
// proprio per NON avviare il server quando qualcuno lo importa. L'unico modo
// onesto e eseguirlo.
//
// Vale piu del numero di copertura: verifica che il pacchetto pubblicato parta.
// Un bin rotto non lo vede nessun test unitario, lo vede l'utente che lo
// installa e non gli si apre.

import { describe, it, expect } from "vitest";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const RADICE = join(dirname(fileURLToPath(import.meta.url)), "..");
const ESEGUIBILE = join(RADICE, "dist", "index.js");

/** Avvia il server, gli manda una richiesta MCP, restituisce la risposta. */
function interroga(richiesta: object, timeoutMs = 15_000): Promise<{ risposta: any; stderr: string }> {
    return new Promise((risolvi, rifiuta) => {
        const p = spawn(process.execPath, [ESEGUIBILE], {
            stdio: ["pipe", "pipe", "pipe"],
            env: { ...process.env, SCALA_API_KEY: "chiave-di-prova" },
        });

        let stdout = "";
        let stderr = "";
        const timer = setTimeout(() => {
            p.kill();
            rifiuta(new Error(`nessuna risposta entro ${timeoutMs}ms. stderr:\n${stderr}`));
        }, timeoutMs);

        p.stdout.on("data", (c) => {
            stdout += c.toString();
            // Il protocollo manda un oggetto JSON per riga.
            for (const riga of stdout.split("\n")) {
                if (!riga.trim()) continue;
                try {
                    const o = JSON.parse(riga);
                    if (o.id === 1) {
                        clearTimeout(timer);
                        p.kill();
                        risolvi({ risposta: o, stderr });
                    }
                } catch { /* riga ancora incompleta */ }
            }
        });
        p.stderr.on("data", (c) => { stderr += c.toString(); });
        p.on("error", (e) => { clearTimeout(timer); rifiuta(e); });

        p.stdin.write(JSON.stringify(richiesta) + "\n");
    });
}

const costruito = existsSync(ESEGUIBILE);

describe.skipIf(!costruito)("l eseguibile pubblicato", () => {
    it("parte e risponde a initialize", async () => {
        const { risposta, stderr } = await interroga({
            jsonrpc: "2.0", id: 1, method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: { name: "prova", version: "0" },
            },
        });
        expect(risposta.result, `nessun result. stderr:\n${stderr}`).toBeDefined();
        expect(risposta.result.serverInfo?.name).toBe("scala-ai-os");
    }, 20_000);

    it("annuncia di saper fare strumenti, risorse e prompt", async () => {
        const { risposta } = await interroga({
            jsonrpc: "2.0", id: 1, method: "initialize",
            params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "p", version: "0" } },
        });
        const c = risposta.result.capabilities;
        for (const attesa of ["tools", "resources", "prompts"]) {
            expect(c?.[attesa], `il server non annuncia ${attesa}`).toBeDefined();
        }
    }, 20_000);

    it("avvisa sullo stderr quando manca la chiave, senza morire", async () => {
        // Lo stderr e il canale giusto: sullo stdout ci passa il protocollo, e
        // una riga di avviso li dentro romperebbe il client.
        const p = spawn(process.execPath, [ESEGUIBILE], {
            stdio: ["pipe", "pipe", "pipe"],
            env: { ...process.env, SCALA_API_KEY: "" },
        });
        const avviso = await new Promise<string>((risolvi) => {
            let s = "";
            p.stderr.on("data", (c) => {
                s += c.toString();
                if (s.includes("SCALA_API_KEY")) { p.kill(); risolvi(s); }
            });
            setTimeout(() => { p.kill(); risolvi(s); }, 10_000);
        });
        expect(avviso).toContain("SCALA_API_KEY");
    }, 15_000);
});
