/*
 * Shared Neon Data API client for anonymous inserts.
 * The Data API requires a JWT even for the anonymous role, so we fetch a
 * short-lived anonymous token from Neon Auth and cache it for the session.
 */
import { DATA_API_URL, isConfigured } from "./config.js";

const AUTH_URL = DATA_API_URL.replace(".apirest.", ".neonauth.").replace(
  /\/rest\/v1$/,
  "/auth"
);

const TOKEN_KEY = "neon_anon_token";

async function getAnonToken() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || "null");
    if (cached && cached.exp * 1000 > Date.now() + 60_000) return cached.token;
  } catch {
    /* corrupted cache — refetch */
  }

  const res = await fetch(`${AUTH_URL}/token/anonymous`);
  if (!res.ok) throw new Error(`anon token: HTTP ${res.status}`);
  const { token } = await res.json();

  const { exp } = JSON.parse(atob(token.split(".")[1]));
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ token, exp }));
  return token;
}

export async function insertRow(table, data, { keepalive = false } = {}) {
  const token = await getAnonToken();
  const res = await fetch(`${DATA_API_URL}/${table}`, {
    method: "POST",
    keepalive,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`insert ${table}: HTTP ${res.status}`);
}

export { isConfigured };
