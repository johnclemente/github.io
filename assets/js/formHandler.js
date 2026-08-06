/*
 * Contact form → Neon contact_messages (insert-only anonymous role).
 * Validation limits mirror the table's CHECK constraints.
 */
import { DATA_API_URL, isConfigured } from "./config.js";

const FALLBACK_EMAIL = "johnclemente32@gmail.com";
const RATE_LIMIT_MS = 5000;

const form = document.getElementById("contactForm");
const status = document.getElementById("contact-status");
const submitBtn = document.getElementById("contact-submit");

let lastSubmit = 0;

function setStatus(message, kind) {
  status.textContent = "";
  status.className = "contact__status" + (kind ? ` is-${kind}` : "");
  if (typeof message === "string") {
    status.textContent = message;
  } else {
    status.append(...message);
  }
}

function mailtoFallback(name, message) {
  const link = document.createElement("a");
  link.href = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(
    "Portfolio contact from " + name
  )}&body=${encodeURIComponent(message)}`;
  link.textContent = "email me directly";
  return ["Something went wrong sending your message — please ", link, " instead."];
}

function validate(name, email, message) {
  if (!name || name.length > 100) return "Please enter your name (up to 100 characters).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return "Please enter a valid email address.";
  if (!message) return "Please enter a message.";
  if (message.length > 5000) return "Message is too long (5000 characters max).";
  return null;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    /* Honeypot: bots fill the hidden field; pretend success and do nothing. */
    if (form.website.value) {
      form.reset();
      setStatus("Thanks! Your message has been sent.", "success");
      return;
    }

    const error = validate(name, email, message);
    if (error) {
      setStatus(error, "error");
      return;
    }

    const now = Date.now();
    if (now - lastSubmit < RATE_LIMIT_MS) {
      setStatus("Please wait a few seconds before sending again.", "error");
      return;
    }

    if (!isConfigured) {
      setStatus(mailtoFallback(name, message), "error");
      return;
    }

    submitBtn.disabled = true;
    setStatus("Sending…");

    try {
      const res = await fetch(`${DATA_API_URL}/contact_messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      lastSubmit = now;
      form.reset();
      setStatus("Thanks! Your message has been sent.", "success");
    } catch {
      setStatus(mailtoFallback(name, message), "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
}
