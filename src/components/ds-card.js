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
  // display: block en :host → la card ocupa el ancho que le asigne su contenedor.
  // Cuando está dentro de un grid, el grid controla el ancho de cada celda.
  // El ancho fijo (width: 280px) se elimina para que el grid funcione correctamente.
  //
  // .card.elevated → clase combinada: solo aplica cuando el div tiene AMBAS
  //                  clases "card" y "elevated" al mismo tiempo.
  //
  // ::slotted(*) → estila el contenido proyectado desde fuera (light DOM).
  static styles = css`
    :host {
      display: block;
    }

    .card {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 18px 18px;
      background: #fff;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
      /* PRO: no fuerces altura fija en todos los contextos */
      min-height: 0;
    }

    .card.elevated {
      border-color: transparent;
      box-shadow:
        0 10px 30px rgba(15, 23, 42, 0.12),
        0 2px 6px rgba(15, 23, 42, 0.06);
    }

    .card-header {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
    }

    ::slotted(*) {
      font-size: 0.92rem;
      color: #475569;
      line-height: 1.35;
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
