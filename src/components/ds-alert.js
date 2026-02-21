// ─────────────────────────────────────────────────────────────────────────────
// DsAlert — LitElement component
//
// Propósito: mensaje de notificación del design system con autocierre,
// cierre manual y tipos visuales (success, error, warning).
//
// API pública:
//   @property type    → 'success' | 'error' | 'warning'  (default: 'success')
//   @property message → String con el texto del alert     (default: '')
//   @event    ds-close → emitido cuando el alert se cierra (manual o automático)
//
// Uso en HTML:
//   <ds-alert type="success" message="Guardado correctamente"></ds-alert>
//   <ds-alert type="error"   message="Ha ocurrido un error"></ds-alert>
//   <ds-alert type="warning" message="Ten cuidado"></ds-alert>
// ─────────────────────────────────────────────────────────────────────────────

import { LitElement, html, css } from "lit";

export class DsAlert extends LitElement {
  // ─── Propiedades reactivas ────────────────────────────────────────────────
  // type y message → públicos (@property): el consumidor los configura desde HTML
  //
  // _visible → privado (state: true): solo para uso interno del componente.
  //   state: true es equivalente a @state en la sintaxis de decoradores.
  //   No se refleja en el atributo HTML, no forma parte de la API pública.
  //   Controla si el alert se renderiza o no.
  static properties = {
    type:     { type: String },
    message:  { type: String },
    _visible: { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.type = "success";
    this.message = "";
    this._visible = true; // visible por defecto al crearse
  }

  // ─── Estilos encapsulados ─────────────────────────────────────────────────
  // Las clases .success, .error, .warning se aplican dinámicamente en el
  // template con interpolación de string: class="alert ${this.type}"
  static styles = css`
    :host {
      display: block;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.95rem;
    }

    .success { background: #d1fae5; color: #065f46; }
    .error   { background: #fee2e2; color: #991b1b; }
    .warning { background: #fef3c7; color: #92400e; }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      color: inherit; /* hereda el color del tipo de alert */
    }
  `;

  // ─── Lifecycle: firstUpdated ──────────────────────────────────────────────
  // Se llama UNA sola vez cuando el Shadow DOM existe por primera vez.
  // Es el momento correcto para arrancar el timer de autocierre.
  //
  // ⚠️  Por qué no en el constructor:
  //     En el constructor el Shadow DOM aún no existe y el componente
  //     no está conectado al DOM. firstUpdated garantiza que todo está listo.
  //
  // ⚠️  Por qué no en connectedCallback:
  //     connectedCallback puede llamarse múltiples veces si el elemento
  //     se mueve en el DOM. firstUpdated solo se llama una vez.
  firstUpdated() {
    setTimeout(() => this._close(), 5000);
  }

  // ─── Método privado: _close ───────────────────────────────────────────────
  // Oculta el alert cambiando _visible a false → Lit re-renderiza → render()
  // devuelve html``, el alert desaparece del DOM.
  //
  // Emite ds-close para notificar al padre que el alert se cerró,
  // tanto si fue por el timer como por el botón manual.
  _close() {
    this._visible = false;
    this.dispatchEvent(new CustomEvent("ds-close", {
      bubbles: true,
      composed: true,
    }));
  }

  // ─── Template ─────────────────────────────────────────────────────────────
  // Render condicional: si _visible es false, devuelve un template vacío.
  // Lit eliminará el contenido del Shadow DOM — el componente sigue existiendo
  // en el DOM pero no renderiza nada.
  //
  // icons[this.type] → objeto usado como mapa clave-valor para obtener
  // el ícono correspondiente al tipo sin necesidad de if/else.
  //
  // class="alert ${this.type}" → interpolación de string simple.
  // Aquí no usamos classMap porque la clase es siempre "alert" + el tipo,
  // sin condiciones complejas.
  render() {
    if (!this._visible) return html``;

    const icons = { success: "✓", error: "✕", warning: "⚠" };

    return html`
      <div class="alert ${this.type}">
        <span>${icons[this.type]} ${this.message}</span>
        <button class="close-btn" @click=${this._close}>✕</button>
      </div>
    `;
  }
}

customElements.define("ds-alert", DsAlert);
