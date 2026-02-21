// ─────────────────────────────────────────────────────────────────────────────
// RawCounter — Web Component vanilla (sin LitElement)
//
// Propósito: demostrar los fundamentos de Web Components puros antes de usar
// LitElement. Este boilerplate es exactamente lo que Lit abstrae por nosotros.
//
// Uso en HTML:
//   <raw-counter></raw-counter>          → step por defecto = 1
//   <raw-counter step="5"></raw-counter> → incrementa/decrementa de 5 en 5
// ─────────────────────────────────────────────────────────────────────────────

class RawCounter extends HTMLElement {
  constructor() {
    // super() es obligatorio cuando extiendes una clase nativa del navegador.
    // Inicializa HTMLElement (la clase padre) antes de que podamos usar "this".
    super();

    // Estado interno del componente.
    // Prefijo _ indica que son privados (convención, no enforced por JS).
    this._count = 0; // valor actual del contador
    this._step = 1;  // cuánto suma/resta cada click

    // Crea el Shadow DOM en modo "open".
    // "open"  → JS externo puede acceder via element.shadowRoot (necesario en tests)
    // "closed" → nadie fuera puede acceder (no lo usaremos en este curso)
    // Después de esta llamada, this.shadowRoot está disponible.
    this.attachShadow({ mode: "open" });
  }

  // ─── Lifecycle: observedAttributes ───────────────────────────────────────
  // Lista de atributos HTML que queremos "observar".
  // Sin esto, attributeChangedCallback NUNCA se llama.
  // Importante: debe ser static (pertenece a la clase, no a cada instancia).
  static get observedAttributes() {
    return ["step"];
  }

  // ─── Lifecycle: attributeChangedCallback ─────────────────────────────────
  // El navegador llama a este método automáticamente cuando un atributo
  // de la lista observedAttributes cambia en el HTML.
  //
  // Parámetros:
  //   name     → nombre del atributo que cambió (ej: "step")
  //   oldValue → valor anterior (null si es la primera vez)
  //   newValue → nuevo valor — SIEMPRE llega como string, aunque sea un número
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "step") {
      // Number() convierte el string "2" al número 2.
      // Sin esta conversión, "1" + "2" = "12" (concatenación) en vez de 3.
      this._step = Number(newValue);
    }
  }

  // ─── Lifecycle: connectedCallback ────────────────────────────────────────
  // El navegador llama a este método cuando el elemento se inserta en el DOM
  // (es decir, cuando aparece en la página).
  // Es el momento correcto para: pintar el HTML inicial y añadir event listeners.
  //
  // ⚠️  NO uses el constructor para esto — el Shadow DOM existe pero el
  //     elemento aún no está conectado a la página.
  connectedCallback() {
    // innerHTML del shadowRoot — todo lo que metemos aquí va dentro de la
    // "caja sellada". El <style> aquí es encapsulado: no afecta al exterior
    // y el CSS externo no puede entrar.
    this.shadowRoot.innerHTML = `
      <style>
        button { font-size: 1.2rem; margin: 0 4px; cursor: pointer; }
        span   { font-size: 1.5rem; display: inline-block; min-width: 2rem; text-align: center; }
      </style>

      <button id="dec">-</button>
      <span id="count">${this._count}</span>
      <button id="inc">+</button>
    `;

    // Buscamos los botones DENTRO del shadowRoot (no en el documento global).
    // element.getElementById() buscaría fuera — siempre usar this.shadowRoot.
    this.shadowRoot
      .getElementById("inc")
      .addEventListener("click", () => this._increment());

    this.shadowRoot
      .getElementById("dec")
      .addEventListener("click", () => this._decrement());
  }

  // ─── Método privado: _increment ──────────────────────────────────────────
  _increment() {
    this._count += this._step; // actualiza el estado interno
    this._updateView();        // refleja el cambio en el DOM

    // Notifica al exterior que el contador cambió.
    // CustomEvent permite pasar datos en "detail".
    // bubbles: true  → el evento sube por el árbol DOM
    // composed: true → el evento cruza el Shadow DOM boundary
    //                  (sin esto, el padre nunca lo recibiría)
    this.dispatchEvent(
      new CustomEvent("counter-changed", {
        detail: { value: this._count },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ─── Método privado: _decrement ──────────────────────────────────────────
  _decrement() {
    this._count -= this._step;
    this._updateView();
    this.dispatchEvent(
      new CustomEvent("counter-changed", {
        detail: { value: this._count },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ─── Método privado: _updateView ─────────────────────────────────────────
  // Actualiza SOLO el <span> del contador en el DOM.
  //
  // ⚠️  Por qué no hacemos this.shadowRoot.innerHTML = `...` de nuevo:
  //     Eso destruiría y recrearía todos los elementos — incluidos los botones
  //     con sus addEventListener. Perderíamos los event listeners.
  //     Actualizar solo el textContent es quirúrgico y eficiente.
  _updateView() {
    this.shadowRoot.getElementById("count").textContent = this._count;
  }
}

// ─── Registro del Custom Element ─────────────────────────────────────────────
// Sin esta línea el navegador no sabe qué clase usar cuando ve <raw-counter>.
// Regla: el nombre DEBE contener al menos un guión (-).
customElements.define("raw-counter", RawCounter);
