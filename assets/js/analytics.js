/*
 * Privacy-friendly page-view tracking → Neon (insert-only anonymous role).
 * No cookies, no IP capture; timezone/language serve as a coarse geo proxy.
 * Skips localhost and visitors with Do Not Track / Global Privacy Control.
 */
import { insertRow, isConfigured } from "./neon.js";

const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
const optedOut =
  navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true;

function sessionId() {
  let id = sessionStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("session_id", id);
  }
  return id;
}

if (isConfigured && !isLocal && !optedOut) {
  insertRow(
    "page_views",
    {
      path: (location.pathname + location.hash).slice(0, 200),
      referrer: document.referrer.slice(0, 500) || null,
      user_agent: navigator.userAgent.slice(0, 400),
      viewport_w: window.innerWidth,
      viewport_h: window.innerHeight,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      session_id: sessionId(),
    },
    { keepalive: true }
  ).catch(() => {
    /* analytics must never break the page */
  });
}
