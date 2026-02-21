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

import { LitElement, html } from "lit";

// Importar los componentes los registra automáticamente en el customElements registry.
// El index.html solo necesita un <script> apuntando a este archivo.
// Ningún componente necesita su propio <script> en el HTML.
import "./components/ds-button.js";
import "./components/ds-card.js";
import "./components/ds-alert.js";

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

      <section>
        <h2>Usuarios</h2>
        <!-- ds-user-list vendrá en el Bloque 5 — por ahora simulamos con un botón -->
        <ds-button @click=${this._onUserSelected}>
          Seleccionar usuario de prueba
        </ds-button>
      </section>

      <section>
        <h2>Usuario seleccionado</h2>
        ${this._selectedUser
          ? html`
              <ds-card>
                <span slot="header">${this._selectedUser.name}</span>
                ${this._selectedUser.email}
              </ds-card>
            `
          : html`<p>Ningún usuario seleccionado</p>`}
      </section>
    `;
  }

  // ─── Handler: _onUserSelected ─────────────────────────────────────────────
  // Actualiza el estado interno con el usuario seleccionado.
  // En el Bloque 5 este método recibirá e.detail.user desde ds-user-list.
  // Por ahora usamos un usuario hardcodeado para probar la comunicación.
  _onUserSelected() {
    this._selectedUser = {
      name: "John Doe",
      email: "john@example.com",
    };
  }
}

customElements.define("app-shell", AppShell);
