// ─────────────────────────────────────────────────────────────────────────────
// DsCard — LitElement component
//
// Propósito: contenedor de información del design system con soporte para
// slots (contenido proyectado desde fuera) y variante elevated (con sombra).
//
// API pública:
//   @property elevated → Boolean con reflect (default: false)
//   slot "header"      → contenido que aparece en la cabecera de la card
//   slot (default)     → contenido principal del cuerpo de la card
//
// Uso en HTML:
//   <ds-card>
//     <span slot="header">Título</span>
//     Contenido del cuerpo
//   </ds-card>
//
//   <ds-card elevated>
//     <span slot="header">Con sombra</span>
//     Esta card tiene elevación visual.
//   </ds-card>
// ─────────────────────────────────────────────────────────────────────────────

import { LitElement, html, css } from "lit";
import { classMap } from "lit/directives/class-map.js";

class DSCard extends LitElement {
  // ─── Propiedades reactivas ────────────────────────────────────────────────
  // reflect: true → sincroniza la propiedad JS con el atributo HTML.
  // Permite seleccionar el host con :host([elevated]) en CSS
  // y usar <ds-card elevated> directamente en el HTML.
  static properties = {
    elevated: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.elevated = false; // sin sombra por defecto
  }

  // ─── Estilos encapsulados ─────────────────────────────────────────────────
  // display: inline-block en :host → permite poner varias cards lado a lado.
  // display: block haría que cada card ocupara el ancho completo de la línea.
  //
  // .card.elevated → clase combinada: solo aplica cuando el div tiene AMBAS
  //                  clases "card" y "elevated" al mismo tiempo.
  //
  // ::slotted(*) no se usa aquí porque no necesitamos estilar el contenido
  // proyectado — el consumidor lo estila desde fuera.
  static styles = css`
    :host {
      display: inline-block;
      width: 280px;
    }

    .card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      min-height: 160px;
    }

    .card.elevated {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      border-color: transparent;
    }

    .card-header {
      font-size: 0.95rem;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
    }

    ::slotted(*) {
      font-size: 0.875rem;
      color: #64748b;
    }
  `;

  // ─── Template ─────────────────────────────────────────────────────────────
  // classMap({ card: true, elevated: this.elevated }) →
  //   si elevated=false → class="card"
  //   si elevated=true  → class="card elevated"
  //
  // <slot name="header"> → slot nombrado.
  //   Recibe el contenido que tenga slot="header" en el HTML del consumidor.
  //   Si el consumidor no pone nada, el div .card-header queda vacío.
  //
  // <slot> → slot por defecto.
  //   Recibe todo el contenido que NO tenga atributo slot="...".
  //   Es el cuerpo principal de la card.
  render() {
    return html`
      <div class=${classMap({ card: true, elevated: this.elevated })}>
        <div class="card-header">
          <slot name="header"></slot>
        </div>
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("ds-card", DSCard);
