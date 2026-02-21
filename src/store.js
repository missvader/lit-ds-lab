// ─────────────────────────────────────────────────────────────────────────────
// store.js — Estado compartido mínimo
//
// Propósito: permitir que componentes que NO son padre-hijo compartan datos
// sin necesidad de librerías externas ni patrones complejos.
//
// Patrón: módulo JavaScript con estado privado + funciones exportadas.
// Sin clases, sin decoradores, sin dependencias.
//
// API pública:
//   getState()        → devuelve el estado actual
//   setState(partial) → actualiza el estado y notifica a los suscriptores
//   subscribe(fn)     → registra una función que se llama cuando el estado cambia
//                       devuelve una función para cancelar la suscripción
//
// Uso típico en un componente LitElement:
//
//   connectedCallback() {
//     super.connectedCallback();
//     this._unsubscribe = subscribe(state => {
//       this._selectedUser = state.selectedUser;
//     });
//   }
//
//   disconnectedCallback() {
//     super.disconnectedCallback();
//     this._unsubscribe(); // limpieza — evita memory leaks
//   }
// ─────────────────────────────────────────────────────────────────────────────

// Estado privado del módulo — solo modificable a través de setState.
// El prefijo _ indica que es privado por convención (no enforced por JS).
let _state = {
  selectedUser: null,
};

// Set de funciones suscritas — se ejecutan todas cuando el estado cambia.
// Usamos Set en vez de Array para evitar duplicados si alguien suscribe la misma fn dos veces.
const _listeners = new Set();

// ─── getState ────────────────────────────────────────────────────────────────
// Devuelve el estado actual. Solo lectura — no modificar el objeto devuelto
// directamente, siempre usar setState para cambios.
export function getState() {
  return _state;
}

// ─── setState ────────────────────────────────────────────────────────────────
// Actualiza el estado de forma inmutable (crea un nuevo objeto) y notifica
// a todos los suscriptores con el nuevo estado.
//
// newState → objeto con solo las propiedades que cambian:
//   setState({ selectedUser: user }) → solo actualiza selectedUser
//
// { ..._state, ...newState } → spread operator:
//   copia todas las propiedades del estado actual y sobreescribe
//   solo las que vienen en newState. El resto queda igual.
export function setState(newState) {
  _state = { ..._state, ...newState };
  _listeners.forEach((fn) => fn(_state));
}

// ─── subscribe ───────────────────────────────────────────────────────────────
// Registra una función que se ejecuta cada vez que setState es llamado.
// Devuelve una función de "unsubscribe" para limpiar cuando el componente
// se destruye — importante para evitar memory leaks.
//
// Patrón de uso:
//   const unsubscribe = subscribe(state => console.log(state));
//   unsubscribe(); // cuando ya no necesitas escuchar cambios
export function subscribe(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn); // función de limpieza
}
