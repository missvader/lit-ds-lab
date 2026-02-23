// ─────────────────────────────────────────────────────────────────────────────
// ds-user-list.test.js — Suite de tests del Bloque 7
//
// Conceptos clave de este archivo:
//
//   window.fetch mock:
//     Reemplazamos window.fetch con una función que devuelve una Response
//     controlada. Esto permite testear los estados del componente sin red real.
//     SIEMPRE restaurar el original en afterEach para no contaminar otros tests.
//
//   aTimeout(0):
//     Fuerza que se vacíe la cola de microtareas. Necesario cuando el path
//     de éxito incluye response.json() (dos awaits internos).
//     Sin él, leemos el DOM antes de que el fetch asíncrono haya completado.
//
//   Patrón beforeEach/afterEach:
//     beforeEach → instala el mock (fetch exitoso por defecto)
//     afterEach  → restaura window.fetch original
//     Tests individuales pueden sobreescribir window.fetch para casos especiales
//     (loading infinito, error HTTP 500).
// ─────────────────────────────────────────────────────────────────────────────

import { fixture, html, expect, oneEvent, aTimeout } from "@open-wc/testing";
import "../src/components/ds-user-list.js";

const MOCK_USERS = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

describe("ds-user-list", () => {
  let originalFetch;

  // ── beforeEach: mock de fetch exitoso por defecto ─────────────────────────
  // Todos los tests que no sobreescriban window.fetch usarán este mock.
  // Devuelve MOCK_USERS con status 200 — simula una API real sin red.
  beforeEach(() => {
    originalFetch = window.fetch;
    window.fetch = () =>
      Promise.resolve(
        new Response(JSON.stringify(MOCK_USERS), { status: 200 }),
      );
  });

  // ── afterEach: restaurar fetch original ───────────────────────────────────
  // CRÍTICO: sin esto, el mock contamina los tests siguientes (y otros archivos).
  afterEach(() => {
    window.fetch = originalFetch;
  });

  // ── Test 1: estado loading ─────────────────────────────────────────────────
  // Para testear el estado 'loading' necesitamos que el fetch NUNCA resuelva.
  // new Promise(() => {}) crea una Promise que queda pendiente para siempre →
  // el componente se queda en _status = 'loading' indefinidamente.
  //
  // No necesitamos aTimeout ni updateComplete porque leemos el DOM justo
  // después del montaje, cuando firstUpdated ya ha cambiado _status a 'loading'.
  it("shows a loading message while fetching users", async () => {
    window.fetch = () => new Promise(() => {}); // fetch que nunca resuelve → simula loading infinito
    const el = await fixture(html`<ds-user-list></ds-user-list>`);
    expect(el.shadowRoot.querySelector("p").textContent).to.include("Loading");
  });

  // ── Test 2: estado success ────────────────────────────────────────────────
  // El fetch del beforeEach resuelve con MOCK_USERS (2 usuarios).
  //
  // ⚠️  Por qué necesitamos aTimeout(0) + updateComplete:
  //   firstUpdated() llama a _loadUsers() que internamente hace:
  //     await fetch()          → microtask 1
  //     await response.json()  → microtask 2 (extra vs. el path de error)
  //   aTimeout(0) vacía la cola de microtareas (flush).
  //   Luego updateComplete espera el re-render de Lit con el estado 'success'.
  it("renders users cards after successful fetch", async () => {
    const el = await fixture(html`<ds-user-list></ds-user-list>`);
    await aTimeout(0);
    await el.updateComplete; // esperar a que el componente procese el fetch y renderice
    const cards = el.shadowRoot.querySelectorAll("ds-card");
    expect(cards.length).to.equal(2);
  });

  // ── Test 3: estado error ──────────────────────────────────────────────────
  // Sobreescribimos el mock para devolver un 500.
  // user-service.js comprueba response.ok → lanza Error → catch en _loadUsers →
  // _status = 'error' → el componente renderiza <ds-alert>.
  //
  // El path de error NO llama a response.json() → solo 1 microtask interno.
  // aTimeout(0) se incluye igualmente por consistencia y para evitar tests flaky.
  it("renders an error message if fetch fails", async () => {
    window.fetch = () =>
      Promise.resolve(
        new Response("", { status: 500, statusText: "Internal Server Error" }),
      );
    const el = await fixture(html`<ds-user-list></ds-user-list>`);
    await aTimeout(0);
    await el.updateComplete;
    const alert = el.shadowRoot.querySelector("ds-alert");
    expect(alert).to.exist;
  });

  // ── Test 4: emisión de CustomEvent ────────────────────────────────────────
  // Verifica el patrón Child → Parent: al hacer click en una ds-card,
  // el componente emite 'ds-user-selected' con { user } en el detail.
  //
  // oneEvent se registra ANTES del click (igual que en ds-alert.test.js).
  // deep.equal compara el objeto completo — no solo la referencia.
  it("emits ds-user-selected event with user data when a card is clicked", async () => {
    const el = await fixture(html`<ds-user-list></ds-user-list>`);
    await aTimeout(0);
    await el.updateComplete;
    const firstCard = el.shadowRoot.querySelector("ds-card");
    const listener = oneEvent(el, "ds-user-selected"); // preparar el listener ANTES de hacer click
    firstCard.click();                                  // disparar la acción (click en la card)
    const { detail } = await listener;                  // esperar a que el evento ocurra
    expect(detail.user).to.deep.equal(MOCK_USERS[0]);  // verificar que el payload es correcto
  });

  // ── Test 5: filtro local sin refetch ──────────────────────────────────────
  // Cambiamos _filter directamente (es @state) → Lit re-renderiza →
  // el getter _filteredUsers recalcula → la lista se reduce a 1 card.
  //
  // No necesitamos aTimeout porque el cambio de _filter es síncrono.
  // Solo updateComplete para esperar el re-render de Lit.
  it("filters cards by name when _filter is set", async () => {
    const el = await fixture(html`<ds-user-list></ds-user-list>`);
    await aTimeout(0);
    await el.updateComplete;
    el._filter = "Alice";      // cambiar el filtro
    await el.updateComplete;   // esperar a que el componente re-renderice con el nuevo filtro
    const cards = el.shadowRoot.querySelectorAll("ds-card");
    expect(cards.length).to.equal(1);
  });

});
