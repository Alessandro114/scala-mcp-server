// Tetto di dimensione della risposta nel server remoto: gli elenchi si riducono e lo dichiarano; mai JSON spezzato.
process.env.MCP_REMOTE = "1";
process.env.MCP_MAX_RESPONSE_CHARS = "5000";

import test from "node:test";
import assert from "node:assert/strict";

const { ok, restringi, MAX_REMOTE_CHARS } = await import("./api.js");

const grande = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i, nome: "contatto " + i, nota: "x".repeat(80) }));

test("risposta piccola: invariata", () => {
  const r = ok({ contacts: grande(3) });
  const j = JSON.parse(r.content[0].text);
  assert.equal(j.contacts.length, 3);
  assert.equal(j.truncated, undefined);
});

test("risposta oltre il tetto: elenco ridotto, dichiarato in truncated, JSON valido e sotto il tetto", () => {
  assert.equal(MAX_REMOTE_CHARS, 5000);
  const r = ok({ contacts: grande(200), altro: "campo" });
  const testo = r.content[0].text;
  assert.ok(testo.length <= 5000, `lunghezza ${testo.length}`);
  const j = JSON.parse(testo); // deve restare JSON valido
  assert.ok(j.contacts.length >= 1 && j.contacts.length < 200);
  assert.equal(j.truncated.total, 200);
  assert.equal(j.truncated.returned, j.contacts.length);
  assert.equal(j.altro, "campo");
});

test("restringi: nessun elenco -> null (si ricade sul taglio del testo)", () => {
  assert.equal(restringi({ a: "x".repeat(10_000) }, 5000), null);
  assert.equal(restringi("stringa", 5000), null);
  assert.equal(restringi([1, 2, 3], 5000), null);
});

test("risposta senza elenco oltre il tetto: testo tagliato con avviso", () => {
  const r = ok({ a: "x".repeat(10_000) });
  assert.ok(r.content[0].text.includes("truncated"));
  assert.ok(r.content[0].text.length < 5300);
});

test("un solo elemento enorme: cade sul taglio del testo, non va in loop", () => {
  const r = ok({ contacts: [{ nota: "y".repeat(20_000) }] });
  assert.ok(r.content[0].text.length < 5300);
});
