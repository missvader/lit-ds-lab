// ─────────────────────────────────────────────────────────────────────────────
// user-service.js — Service Layer
//
// Propósito: encapsular todas las llamadas a la API REST en funciones puras.
//
// ¿Por qué un service layer separado del componente?
//   1. Testeable de forma independiente — sin montar ningún componente
//   2. Reutilizable — cualquier componente puede importarlo
//   3. Mockeable en tests — basta con reemplazar window.fetch
//   4. Agnóstico de UI — no sabe nada de LitElement ni del DOM
//
// Patrón elegido: funciones puras exportadas (sin clase, sin estado)
//   → mínima complejidad, máxima claridad
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "https://jsonplaceholder.typicode.com";

// ⚠️  response.ok vs try/catch:
//   fetch() solo lanza excepción en errores de red (sin conexión, timeout).
//   Un status 404 o 500 NO lanza — devuelve una Response con ok=false.
//   Por eso hay que comprobar response.ok explícitamente y lanzar manualmente.
export const getUsers = async () => {
  const response = await fetch(`${BASE_URL}/users`);
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
};

export const getUserById = async (id) => {
  const response = await fetch(`${BASE_URL}/users/${id}`);
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
};
