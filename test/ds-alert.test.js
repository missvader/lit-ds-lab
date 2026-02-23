// ─────────────────────────────────────────────────────────────────────────────
// ds-alert.test.js — Suite de tests del Bloque 7
//
// Conceptos clave:
//   fixture        → monta el componente con lifecycle completo
//   updateComplete → necesario cuando se cambia estado DESPUÉS del montaje
//   oneEvent       → registra un listener que resuelve cuando el evento ocurre.
//                    SIEMPRE registrar ANTES de disparar la acción.
//   shadowRoot     → acceso al DOM interno del componente
// ─────────────────────────────────────────────────────────────────────────────

import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import "../src/components/ds-alert.js";

describe("ds-alert", () => {

  // ── Test 1: render condicional — estado visible ───────────────────────────
  // El componente monta directamente con message y type en el fixture.
  // No hay cambio de estado posterior → no necesitamos updateComplete.
  // Accedemos al .alert interno via shadowRoot (shadow DOM, invisible desde fuera).
  it("renders the message when visible", async () => {
    const el = await fixture(
      html`<ds-alert message="Something went wrong" type="error"></ds-alert>`,
    );
    const div = el.shadowRoot.querySelector(".alert");
    expect(div).to.exist;
    expect(div.textContent).to.include("Something went wrong");
  });

  // ── Test 2: render condicional — estado oculto ────────────────────────────
  // Llamamos a _close() directamente (método privado del componente) para
  // simular el cierre sin pasar por la UI.
  //
  // ⚠️  await el.updateComplete es OBLIGATORIO aquí:
  //   _close() modifica _visible (@state) DESPUÉS del montaje.
  //   Lit encola un re-render asíncrono → sin el await leemos el DOM antes
  //   de que Lit lo haya actualizado → false negativo.
  it("renders nothing after calling _close", async () => {
    const el = await fixture(
      html`<ds-alert message="Test" type="success"></ds-alert>`,
    );
    el._close();
    await el.updateComplete;
    expect(el.shadowRoot.querySelector(".alert")).to.be.null;
  });

  // ── Test 3: emisión de CustomEvent ────────────────────────────────────────
  // oneEvent(el, 'ds-close') devuelve una Promise que resuelve cuando el
  // evento ocurre. CRÍTICO: registrar el listener ANTES de hacer click.
  //
  // Si registramos después del click, el evento ya ha ocurrido y la Promise
  // nunca resuelve → el test cuelga y falla por timeout.
  //
  // Patrón correcto:
  //   1. const promise = oneEvent(el, 'event-name')  ← registrar primero
  //   2. trigger()                                    ← disparar la acción
  //   3. const event = await promise                  ← esperar la resolución
  it("emits ds-close when the close button is clicked", async () => {
    const el = await fixture(
      html`<ds-alert message="Test" type="success"></ds-alert>`,
    );
    const closeBtn = el.shadowRoot.querySelector(".close-btn");
    const eventPromise = oneEvent(el, "ds-close"); // preparar el listener ANTES de hacer click
    closeBtn.click();                               // disparar la acción
    const event = await eventPromise;               // esperar a que el evento ocurra
    expect(event).to.exist;
  });

  // ── Test 4: classMap aplica la clase CSS correcta ─────────────────────────
  // Verifica que classMap({ warning: this.type === 'warning' }) funciona.
  // type se pasa en el fixture → no hay cambio posterior → no necesitamos updateComplete.
  it("applies the correct CSS class based on the type", async () => {
    const el = await fixture(
      html`<ds-alert message="Warning!" type="warning"></ds-alert>`,
    );
    const div = el.shadowRoot.querySelector(".alert");
    expect(div).to.have.class("warning");
  });

});
