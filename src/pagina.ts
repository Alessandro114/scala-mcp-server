// Paginazione degli elenchi restituiti dai tool di lettura.
//
// PERCHE ESISTE: il 17/11/2026, provando i 14 tool in Claude, `crm_list_contacts` con limit=5 ha restituito ~51
// contatti (risposta troncata a 100.000 caratteri) e `sara_conversations` 58,9 KB: il backend ignorava `limit`.
// La Software Directory Policy (par. 5.B) chiede risposte proporzionate al compito. Quindi:
//  - il tool manda SEMPRE limit e offset al backend (default 20, massimo 50);
//  - se il backend e' vecchio e li ignora, l'elenco viene ritagliato QUI e la risposta lo dichiara in `page`.

export const LIMITE_DEFAULT = 20;
export const LIMITE_MASSIMO = 50;

export type Pagina = { limit: number; offset: number };

function intPositivo(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/** Legge limit/offset dagli argomenti del tool; sempre valori sicuri (1..massimo, offset >= 0). */
export function leggiPagina(args: Record<string, unknown>, def = LIMITE_DEFAULT, max = LIMITE_MASSIMO): Pagina {
  const l = intPositivo(args.limit);
  const o = intPositivo(args.offset);
  return {
    limit: l === null ? Math.min(def, max) : Math.min(Math.max(l, 1), max),
    offset: o === null ? 0 : Math.min(Math.max(o, 0), 100_000),
  };
}

/** Parametri di query per il backend. */
export function paramsPagina(p: Pagina): Record<string, string> {
  return { limit: String(p.limit), offset: String(p.offset) };
}

type Elenco = Record<string, unknown> & { page?: { limit: number; offset: number; returned: number; has_more: boolean } };

/**
 * Se la risposta del backend ha un elenco sotto una delle `chiavi` piu' lungo di `limit`, lo ritaglia e aggiunge `page`.
 * Se il backend ha gia' paginato (blocco `page` presente) la risposta e' lasciata com'e'.
 */
export function limitaElenco(risposta: unknown, p: Pagina, chiavi: string[]): unknown {
  if (!risposta || typeof risposta !== "object" || Array.isArray(risposta)) return risposta;
  const r = risposta as Elenco;
  if (r.page) return r;
  for (const k of chiavi) {
    const v = r[k];
    if (Array.isArray(v)) {
      const finestra = v.slice(p.offset, p.offset + p.limit);
      return {
        ...r,
        [k]: finestra,
        page: { limit: p.limit, offset: p.offset, returned: finestra.length, has_more: v.length > p.offset + p.limit },
      };
    }
  }
  return r;
}

/**
 * Accorcia a `max` caratteri il campo di testo `campo` di ogni elemento dell'elenco `chiave` e lo segnala con `<campo>_truncated: true`.
 * Serve a non mandare all'assistente note lunghe (~2.000 caratteri a contatto) quando basta una lista.
 */
export function accorciaCampi(risposta: unknown, chiave: string, campo: string, max: number): unknown {
  if (!risposta || typeof risposta !== "object" || Array.isArray(risposta)) return risposta;
  const r = risposta as Record<string, unknown>;
  const elenco = r[chiave];
  if (!Array.isArray(elenco)) return risposta;
  return {
    ...r,
    [chiave]: elenco.map((el) => {
      if (!el || typeof el !== "object") return el;
      const o = el as Record<string, unknown>;
      const v = o[campo];
      if (typeof v !== "string" || v.length <= max) return el;
      return { ...o, [campo]: v.slice(0, max) + "…", [campo + "_truncated"]: true };
    }),
  };
}
