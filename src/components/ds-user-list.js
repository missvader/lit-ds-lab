// ─────────────────────────────────────────────────────────────────────────────
// DsUserList — LitElement component
//
// Propósito: lista de usuarios con fetch real, 4 estados, filtro local
// y emisión de evento al seleccionar un usuario.
//
// API pública:
//   @property limit          → número máximo de usuarios a mostrar (default: 10)
//   @event    ds-user-selected → emitido al hacer click en un usuario
//                               detail: { user: <objeto usuario> }
//
// Patrón aplicado: máquina de estados mínima
//   idle → loading → success
//                 ↘ error
// ─────────────────────────────────────────────────────────────────────────────

import { html, css, LitElement } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { getUsers } from "../services/user-service.js";

// Importar los sub-componentes usados en el template.
// Necesario para que funcionen en tests (donde app-shell no los importa).
// En el navegador también es buena práctica: el componente declara sus dependencias.
import "./ds-card.js";
import "./ds-alert.js";

class DsUserList extends LitElement {
  // ─── Propiedades reactivas ────────────────────────────────────────────────
  // limit    → @property (API pública): el consumidor puede configurarlo
  //            <ds-user-list limit="5"></ds-user-list>
  //
  // _status  → @state (privado): controla qué renderiza el componente
  //            Valores posibles: 'idle' | 'loading' | 'success' | 'error'
  //
  // _users   → @state (privado): todos los usuarios devueltos por la API
  //            El limit y el filtro se aplican en el getter _filteredUsers,
  //            no aquí — así _users siempre tiene el dataset completo.
  //
  // _error   → @state (privado): mensaje de error si el fetch falla
  // _filter  → @state (privado): texto del input de búsqueda
  static properties = {
    _users: { type: Array, state: true },
    limit: { type: Number },
    _status: { type: String, state: true },
    _error: { type: String, state: true },
    _filter: { type: String, state: true },
  };

  constructor() {
    super();
    this._users = [];
    this.limit = 10;
    this._status = "idle";
    this._error = null;
    this._filter = "";
  }

  static styles = css`
    :host {
      display: block;
    }
    .filter {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
    input {
      width: 100%;
      max-width: 420px;
      padding: 10px 12px;
      margin-bottom: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.95rem;
      color: #0f172a;
      outline: none;
      background: #fff;
    }

    input::placeholder {
      color: #94a3b8;
    }

    input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      align-items: stretch;
    }

    ds-card {
      cursor: pointer;
      width: 100%;
    }

    p {
      color: #64748b;
      font-size: 0.95rem;
      padding: 10px 0;
    }
  `;

  // ─── Lifecycle: firstUpdated ──────────────────────────────────────────────
  // Se llama UNA sola vez cuando el Shadow DOM ya existe por primera vez.
  // Es el lugar correcto para el fetch inicial.
  //
  // ⚠️  ¿Por qué no en el constructor?
  //     En el constructor el Shadow DOM no existe aún y el componente
  //     no está conectado al DOM real. El fetch funcionaría, pero cualquier
  //     intento de acceder al shadowRoot fallaría.
  //
  // ⚠️  ¿Por qué no en connectedCallback?
  //     connectedCallback puede llamarse varias veces si el elemento
  //     se mueve en el DOM. firstUpdated garantiza una sola ejecución.
  firstUpdated() {
    this._loadUsers();
  }

  // ─── Método privado: _loadUsers ───────────────────────────────────────────
  // Implementa la máquina de estados mínima para el ciclo de vida de un fetch:
  //
  //   1. Antes del fetch  → status = 'loading'  (Lit re-renderiza → muestra spinner)
  //   2. Fetch exitoso    → status = 'success'  (Lit re-renderiza → muestra lista)
  //   3. Fetch con error  → status = 'error'    (Lit re-renderiza → muestra error)
  //
  // Cada cambio de _status es independiente → Lit solo re-renderiza lo necesario.
  // El try/catch captura tanto errores de red como los lanzados por response.ok.
  async _loadUsers() {
    this._status = "loading";
    try {
      const users = await getUsers();
      this._users = users; // dataset completo — el limit se aplica en el getter
      this._status = "success";
    } catch (error) {
      this._error = error.message;
      this._status = "error";
    }
  }

  // ─── Getter computado: _filteredUsers ─────────────────────────────────────
  // Computed state: deriva un valor de otros estados sin almacenarlo.
  // Lit lo recalcula automáticamente en cada render porque depende de
  // _users, _filter y limit — todos reactivos.
  //
  // Ventaja de aplicar el limit aquí (y no en _loadUsers):
  //   → _users siempre tiene el dataset completo
  //   → Si limit cambia en runtime, el render refleja el nuevo valor sin refetch
  get _filteredUsers() {
    if (!this._filter) return this._users.slice(0, this.limit);
    return this._users
      .filter((user) =>
        user.name.toLowerCase().includes(this._filter.toLowerCase()),
      )
      .slice(0, this.limit);
  }

  // ─── Template ─────────────────────────────────────────────────────────────
  // Render condicional por estado — 4 casos explícitos:
  //   'idle'    → estado inicial antes de que firstUpdated dispare el fetch
  //   'loading' → fetch en curso
  //   'error'   → fetch fallido (red caída o status HTTP >= 400)
  //   (default) → 'success' — muestra la lista filtrada
  //
  // repeat(items, keyFn, templateFn):
  //   keyFn     → función que devuelve un identificador único por item (user.id)
  //               Permite a Lit reutilizar nodos DOM existentes en lugar de
  //               destruirlos y recrearlos cuando la lista cambia.
  //   templateFn → función que devuelve el template para cada item
  //
  // @input en el <input> → actualiza _filter en cada tecla pulsada.
  //   _filter es @state → Lit re-renderiza → _filteredUsers recalcula → lista actualizada.
  //   Todo sin ningún refetch a la API.
  render() {
    if (this._status === "idle") return html`<p>Pulsa para cargar</p>`;
    if (this._status === "loading") return html`<p>Loading users...</p>`;
    if (this._status === "error") {
      return html`
        <ds-alert
          type="error"
          .message=${"Error loading users: " + this._error}
        ></ds-alert>
        <ds-button @click=${this._loadUsers}>Retry</ds-button>
      `;
    }
    return html`
      <div class="filter">
        <input
          type="text"
          placeholder="Filter by name"
          @input=${(e) => (this._filter = e.target.value)}
        />
      </div>
      <div class="grid">
        ${repeat(
          this._filteredUsers,
          (user) => user.id,
          (user) => html`
            <ds-card @click=${() => this._selectUser(user)}>
              <span slot="header">${user.name}</span>
              ${user.email}
            </ds-card>
          `,
        )}
      </div>
    `;
  }

  // ─── Método privado: _selectUser ─────────────────────────────────────────
  // Patrón Child → Parent: el hijo emite un CustomEvent con el dato en detail.
  // El padre (app-shell) lo escucha con @ds-user-selected en su template.
  //
  // bubbles: true  → el evento sube por el árbol DOM (hijo → padre → abuelo)
  // composed: true → el evento cruza el Shadow DOM boundary.
  //                  Sin esto queda atrapado dentro del shadow root de este
  //                  componente y app-shell nunca lo recibe.
  //
  // Naming convention: {componente}-{acción} → 'ds-user-selected'
  // detail semántico: { user } en lugar de { data } o { value }
  _selectUser(user) {
    this.dispatchEvent(
      new CustomEvent("ds-user-selected", {
        detail: { user },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define("ds-user-list", DsUserList);
