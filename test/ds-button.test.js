// ─────────────────────────────────────────────────────────────────────────────
// ds-button.test.js — Suite de tests del Bloque 6
//
// Herramientas:
//   fixture  → monta el componente en un DOM real con su lifecycle completo
//   html     → tag template literal para describir el fixture
//   expect   → aserciones estilo Chai (BDD)
//
// ⚠️  Por qué NO hacemos `new DsButton()`:
//   El constructor no monta el elemento en el DOM → connectedCallback y
//   firstUpdated no se ejecutan → shadowRoot no existe → no hay nada que testear.
//   fixture() monta el elemento en un <div> conectado al document real.
// ─────────────────────────────────────────────────────────────────────────────

import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import "../src/components/ds-button.js"; // registra <ds-button> en customElements

describe("ds-button", () => {
  // ── Test 1: valor por defecto de @property ────────────────────────────────
  // Verifica que el contrato de la API pública se cumple:
  // si el consumidor no especifica variant, debe ser 'primary'.
  // No necesitamos updateComplete — leemos la propiedad JS directamente,
  // no el DOM. La propiedad existe desde el constructor.
  it("has default primary variant", async () => {
    const el = await fixture(html`<ds-button>OK</ds-button>`);
    expect(el.variant).to.equal("primary");
  });

  // ── Test 2: classMap aplica la clase CSS correcta ─────────────────────────
  // Verifica que classMap({ danger: this.variant === 'danger' }) funciona.
  // variant se pasa en el fixture → el componente ya renderiza con esa variante.
  // No necesitamos updateComplete porque no cambiamos nada después del montaje.
  // Accedemos al <button> interno via shadowRoot — es shadow DOM, invisible desde fuera.
  it("variant danger adds the correct CSS class to the inner button", async () => {
    const el = await fixture(html`<ds-button variant="danger">OK</ds-button>`);
    const button = el.shadowRoot.querySelector("button");
    expect(button).to.have.class("danger");
  });

  // ── Test 3: binding ?disabled funciona ───────────────────────────────────
  // Verifica que el binding `?disabled="${this.disabled}"` en el template
  // sincroniza la propiedad del host con el atributo del <button> interno.
  //
  // ⚠️  await el.updateComplete es OBLIGATORIO aquí:
  //   Cambiamos disabled DESPUÉS del montaje → Lit encola un re-render asíncrono.
  //   Sin el await, leemos el DOM antes de que Lit lo haya actualizado → false negativo.
  it("disabled=true adds the disabled attribute to the inner button", async () => {
    const el = await fixture(html`<ds-button>OK</ds-button>`);
    el.disabled = true;
    await el.updateComplete; // esperar a que Lit actualice el DOM
    const button = el.shadowRoot.querySelector("button");
    expect(button.disabled).to.be.true;
  });

  // ── Test 4: reflect: true sincroniza la propiedad con el atributo del host ─
  // Verifica que `reflect: true` en la definición de la propiedad hace que
  // el atributo HTML aparezca en el HOST (<ds-button disabled>).
  //
  // ¿Por qué importa? Para que :host([disabled]) { ... } funcione en CSS.
  // Sin reflect, el CSS no puede seleccionar el host por ese atributo.
  //
  // Diferencia con Test 3:
  //   Test 3 → el.shadowRoot.querySelector('button').disabled (botón interno)
  //   Test 4 → el.hasAttribute('disabled')                    (host exterior)
  it("disabled=true reflects the attribute on the host element", async () => {
    const el = await fixture(html`<ds-button>OK</ds-button>`);
    el.disabled = true;
    await el.updateComplete;
    expect(el).to.have.attribute("disabled");
  });

  // ── Test 5: el slot proyecta el contenido correctamente ──────────────────
  // Verifica que el texto pasado entre las etiquetas aparece en el componente.
  //
  // El contenido del slot es LIGHT DOM (lo pone el consumidor, no el componente).
  // Por eso usamos el.textContent directamente — sin shadowRoot.
  // shadowRoot.textContent solo devolvería el contenido del shadow, no del light.
  it("default slot renders the passed text", async () => {
    const el = await fixture(html`<ds-button>Click me</ds-button>`);
    expect(el.textContent.trim()).to.equal("Click me");
  });

  it("emits ds-click when the button is clicked ", async () => {
    const el = await fixture(html`<ds-button>Click me</ds-button>`);
    const listener = oneEvent(el, "ds-click"); // preparar el listener ANTES de hacer click
    el.shadowRoot.querySelector("button").click(); // disparar la acción
    const event = await listener; // esperar a que el evento ocurra
    expect(event).to.exist;
  });
});
