import test from "node:test";
import assert from "node:assert/strict";
import { leggiPagina, paramsPagina, limitaElenco, LIMITE_MASSIMO } from "./pagina.js";

test("leggiPagina: default 20, massimo 50, mai valori ostili", () => {
  assert.deepEqual(leggiPagina({}), { limit: 20, offset: 0 });
  assert.deepEqual(leggiPagina({ limit: 5, offset: 10 }), { limit: 5, offset: 10 });
  assert.equal(leggiPagina({ limit: 99999 }).limit, LIMITE_MASSIMO);
  assert.equal(leggiPagina({ limit: 0 }).limit, 1);
  assert.equal(leggiPagina({ limit: -3 }).limit, 1);
  assert.equal(leggiPagina({ limit: "abc" }).limit, 20);
  assert.equal(leggiPagina({ offset: -9 }).offset, 0);
  assert.equal(leggiPagina({ limit: "7" }).limit, 7);
});

test("paramsPagina: sempre limit e offset come stringhe", () => {
  assert.deepEqual(paramsPagina({ limit: 5, offset: 10 }), { limit: "5", offset: "10" });
});

test("limitaElenco: backend vecchio che ignora limit -> elenco ritagliato e dichiarato", () => {
  const contatti = Array.from({ length: 51 }, (_, i) => ({ id: i }));
  const r = limitaElenco({ contacts: contatti }, { limit: 5, offset: 0 }, ["contacts"]) as { contacts: unknown[]; page: Record<string, unknown> };
  assert.equal(r.contacts.length, 5);
  assert.deepEqual(r.page, { limit: 5, offset: 0, returned: 5, has_more: true });
});

test("limitaElenco: offset applicato lato tool solo se il backend non ha paginato", () => {
  const v = Array.from({ length: 12 }, (_, i) => i);
  const r = limitaElenco({ data: v }, { limit: 5, offset: 10 }, ["data"]) as { data: number[]; page: { has_more: boolean } };
  assert.deepEqual(r.data, [10, 11]);
  assert.equal(r.page.has_more, false);
});

test("limitaElenco: backend nuovo (page presente) -> risposta intatta", () => {
  const gia = { contacts: [1, 2], page: { limit: 2, offset: 0, returned: 2, has_more: true } };
  assert.equal(limitaElenco(gia, { limit: 1, offset: 0 }, ["contacts"]), gia);
});

test("limitaElenco: forme inattese passano senza errori", () => {
  assert.equal(limitaElenco(null, { limit: 5, offset: 0 }, ["x"]), null);
  assert.deepEqual(limitaElenco([1, 2, 3], { limit: 1, offset: 0 }, ["x"]), [1, 2, 3]);
  assert.deepEqual(limitaElenco({ altro: 1 }, { limit: 1, offset: 0 }, ["x"]), { altro: 1 });
});
