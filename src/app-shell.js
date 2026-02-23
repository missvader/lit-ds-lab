// ─────────────────────────────────────────────────────────────────────────────
// AppShell — Componente raíz / orquestador de la aplicación
//
// El concepto es siempre el mismo: un componente raíz que:
//   - Es el único que se pone en el index.html
//   - Importa y orquesta todos los demás componentes
//   - Gestiona el estado de alto nivel de la app
//   - Escucha eventos de los hijos y reacciona
//
// En proyectos enterprise con Lit verías nombres como: app-root, app-shell,
// {proyecto}-app. El nombre varía, el concepto es siempre el mismo.
//
// Patrón de comunicación usado aquí:
//   Child → Parent: hijo emite CustomEvent → padre escucha con @evento
//   Parent → Child: padre pasa datos al hijo vía property binding (.prop)
// ─────────────────────────────────────────────────────────────────────────────

import { LitElement, html, css } from "lit";

// Importar los componentes los registra automáticamente en el customElements registry.
// El index.html solo necesita un <script> apuntando a este archivo.
// Ningún componente necesita su propio <script> en el HTML.
import "./components/ds-button.js";
import "./components/ds-card.js";
import "./components/ds-alert.js";
import "./components/ds-user-list.js";

class AppShell extends LitElement {
  // ─── Estado interno ───────────────────────────────────────────────────────
  // _selectedUser es estado privado (state: true) — no forma parte de la API
  // pública de app-shell. Cuando cambia, Lit re-renderiza automáticamente
  // y <ds-card> recibe el nuevo usuario via property binding en el template.
  static properties = {
    _selectedUser: { type: Object, state: true },
  };

  constructor() {
    super();
    this._selectedUser = null; // ningún usuario seleccionado al inicio
  }
  static styles = css`
    :host {
      display: block;
      max-width: 1200px;
      margin: 0 auto;
      padding: 28px 24px;
    }

    @media (min-width: 768px) {
      :host {
        padding: 36px 32px;
      }
    }
    @media (min-width: 1280px) {
      :host {
        padding: 40px 40px;
      }
    }

    h1 {
      font-size: 1.8rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 18px;
    }

    h2 {
      font-size: 0.75rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 12px;
    }

    /* Layout pro: 1 columna en mobile, 2 en desktop */
    .layout {
      display: grid;
      gap: 28px;
    }

    @media (min-width: 1024px) {
      .layout {
        grid-template-columns: 1fr 420px; /* panel derecho fijo */
        align-items: start;
        gap: 32px;
      }
    }

    section {
      margin: 0; /* evita spacing “por defecto” que a veces se te cruza */
    }

    /* Panel derecho: que se sienta como “detalle” */
    .selected ds-card {
      width: 100%;
    }

    /* El texto de vacío mejor alineado con UI */
    p {
      color: #94a3b8;
      font-style: normal;
      font-size: 0.9rem;
      padding: 12px 0;
    }
  `;
  // ─── Template ─────────────────────────────────────────────────────────────
  // @click=${this._onUserSelected} → escucha el evento del hijo.
  // Aquí usamos @click nativo porque ds-button re-emite el click del botón
  // interno. En el Bloque 5 usaremos @ds-user-selected cuando tengamos
  // ds-user-list emitiendo su propio CustomEvent.
  //
  // Render condicional con ternario:
  //   _selectedUser !== null → muestra la card con los datos del usuario
  //   _selectedUser === null → muestra mensaje de "ningún usuario seleccionado"
  //
  // Property binding .user en <ds-card> → pasa el objeto completo al hijo.
  // El punto (.) indica property binding: asigna como propiedad JS, no atributo HTML.
  // Permite pasar objetos, arrays y cualquier tipo JS (los atributos solo soportan strings).
  render() {
    return html`
      <h1>DS App</h1>
      <div class="layout">
        <section class="list">
          <h2>Usuarios</h2>
          <ds-user-list
            @ds-user-selected=${this._onUserSelected}
          ></ds-user-list>
        </section>

        <section class="selected">
          <h2>Usuario seleccionado</h2>
          ${this._selectedUser
            ? html`
                <ds-card elevated>
                  <span slot="header">${this._selectedUser.name}</span>
                  ${this._selectedUser.email}
                </ds-card>
              `
            : html`<p>Ningún usuario seleccionado</p>`}
        </section>
      </div>
    `;
  }

  // ─── Handler: _onUserSelected ─────────────────────────────────────────────
  // Actualiza el estado interno con el usuario seleccionado.
  // En el Bloque 5 este método recibirá e.detail.user desde ds-user-list.
  // Por ahora usamos un usuario hardcodeado para probar la comunicación.
  _onUserSelected(e) {
    this._selectedUser = e.detail.user;
  }
}

customElements.define("app-shell", AppShell);
