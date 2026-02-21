// ─────────────────────────────────────────────────────────────────────────────
// DsButton — LitElement component
//
// Propósito: botón reutilizable del design system con variantes visuales,
// estado disabled y evento personalizado ds-click.
//
// API pública:
//   @property variant  → 'primary' | 'secondary' | 'danger'  (default: 'primary')
//   @property disabled → Boolean con reflect (default: false)
//   @event    ds-click → emitido al hacer click si no está disabled
//
// Uso en HTML:
//   <ds-button>Guardar</ds-button>
//   <ds-button variant="danger">Eliminar</ds-button>
//   <ds-button disabled>No disponible</ds-button>
//
// CSS custom properties (para personalizar desde fuera sin romper encapsulación):
//   --ds-button-bg           → color de fondo del botón primary
//   --ds-button-secondary-bg → color de fondo del botón secondary
//   --ds-button-danger-bg    → color de fondo del botón danger
// ─────────────────────────────────────────────────────────────────────────────

import { LitElement, html, css } from "lit";
import { classMap } from "lit/directives/class-map.js";

class DSButton extends LitElement {
  // ─── Propiedades reactivas ────────────────────────────────────────────────
  // static properties define la API pública del componente.
  // Cada propiedad declarada aquí:
  //   1. Dispara un re-render cuando cambia
  //   2. Se puede pasar como atributo HTML o property binding
  //
  // type: String/Boolean → cómo convertir el atributo HTML (string) al tipo JS
  // reflect: true        → sincroniza la propiedad JS con el atributo HTML
  //                        necesario para poder usar :host([disabled]) en CSS
  static properties = {
    variant:  { type: String },
    disabled: { type: Boolean, reflect: true },
  };

  constructor() {
    super(); // siempre primero — inicializa LitElement
    // Valores por defecto de las propiedades
    this.variant = "primary";
    this.disabled = false;
  }

  // ─── Estilos encapsulados ────────────────────────────────────────────────
  // static styles define el CSS del componente.
  // Este CSS vive dentro del Shadow DOM — no sale al exterior y
  // el CSS global de la página no puede sobreescribirlo.
  //
  // :host          → selecciona el propio elemento <ds-button>
  // :host([attr])  → selecciona el host cuando tiene ese atributo
  //                  funciona gracias a reflect: true en disabled
  //
  // var(--nombre, fallback) → CSS custom property con valor por defecto
  //   si el consumidor define --ds-button-bg en su CSS, lo usará
  //   si no, usará el color fallback (#3b82f6)
  static styles = css`
    :host {
      display: inline-block;
    }

    :host([disabled]) {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      color: white;
    }

    .primary   { background-color: var(--ds-button-bg, #3b82f6); }
    .secondary { background-color: var(--ds-button-secondary-bg, #6b7280); }
    .danger    { background-color: var(--ds-button-danger-bg, #ef4444); }
  `;

  // ─── Template ────────────────────────────────────────────────────────────
  // render() devuelve el HTML del componente usando tagged template literals.
  // Lit llama a render() automáticamente cada vez que una @property o @state cambia.
  // Solo actualiza las partes del DOM que realmente cambiaron (no re-pinta todo).
  //
  // Bindings de Lit usados aquí:
  //   ?disabled=${...} → boolean attribute: añade/quita el atributo según el valor
  //   class=${classMap} → aplica clases CSS condicionalmente según el objeto
  //   @click=${...}    → event listener con cleanup automático al destruir el componente
  //   <slot>           → punto de proyección de contenido: el texto entre las etiquetas
  //                      aparece aquí. <ds-button>Guardar</ds-button> → "Guardar" en el slot
  render() {
    return html`
      <button
        ?disabled=${this.disabled}
        class=${classMap({
          primary:   this.variant === "primary",
          secondary: this.variant === "secondary",
          danger:    this.variant === "danger",
        })}
        @click=${this._handleClick}
      >
        <slot></slot>
      </button>
    `;
  }

  // ─── Handler de evento ───────────────────────────────────────────────────
  // Guard: aunque ?disabled bloquea clicks del usuario en el <button> nativo,
  // alguien podría llamar a _handleClick programáticamente desde JS.
  // El guard lo protege en cualquier caso.
  //
  // CustomEvent 'ds-click':
  //   bubbles: true  → el evento sube por el árbol DOM
  //   composed: true → el evento cruza el Shadow DOM boundary
  //                    sin esto, el padre nunca lo recibiría
  _handleClick() {
    if (this.disabled) return;

    this.dispatchEvent(
      new CustomEvent("ds-click", {
        bubbles: true,
        composed: true,
      }),
    );
  }
}

// Registra el custom element — asocia la etiqueta HTML con la clase JS
customElements.define("ds-button", DSButton);
