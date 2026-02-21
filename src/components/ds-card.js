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
      width: 250px;
    }

    .card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      background-color: white;
    }

    .card.elevated {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      border-color: transparent;
    }

    .card-header {
      font-weight: bold;
      margin-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
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
