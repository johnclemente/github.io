/*
 * The page's own behaviour: the theme switch, the reduced-motion override,
 * the [mono] switch for the logos, the sidebar following the scroll, and the
 * hidden flag. The art itself is ascii.rest's <ascii-art> element, loaded in
 * the head; this file only talks to it through its attributes.
 */

const root = document.documentElement;
const art = () => document.querySelectorAll("ascii-art");

/*===== THEME: [dark] / [light] =====*/
const themeButton = document.getElementById("theme");
const bars = document.querySelectorAll('meta[name="theme-color"]');

function savedTheme() {
  try {
    const s = localStorage.getItem("theme");
    return s === "light" || s === "dark" ? s : null;
  } catch {
    return null;
  }
}

function showTheme(theme) {
  const next = theme === "dark" ? "light" : "dark";
  root.dataset.theme = theme;
  themeButton.firstElementChild.textContent = `[${next}]`;
  themeButton.setAttribute("aria-label", `Switch to ${next} theme`);
  bars.forEach((meta) => meta.setAttribute("content", theme === "dark" ? "#131518" : "#f5f6f7"));
}

if (themeButton) {
  showTheme(root.dataset.theme === "dark" ? "dark" : "light");
  themeButton.hidden = false;
  themeButton.addEventListener("click", () => {
    const theme = root.dataset.theme === "dark" ? "light" : "dark";
    showTheme(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* private mode */
    }
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!savedTheme()) showTheme(e.matches ? "dark" : "light");
  });
}

/*===== MOTION: pieces hold still for prefers-reduced-motion unless asked =====*/
const motionButton = document.getElementById("motion");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let motion = false;
try {
  motion = localStorage.getItem("motion") === "play";
} catch {
  /* private mode */
}

/* Each piece's own options stay as written in the HTML; `motion` is layered on top. */
function applyMotion() {
  art().forEach((el) => {
    if (el.dataset.options === undefined) el.dataset.options = el.getAttribute("options") || "{}";
    const base = JSON.parse(el.dataset.options);
    el.setAttribute("options", JSON.stringify(motion ? { ...base, motion: true } : base));
  });
}

function showMotion() {
  motionButton.hidden = !reduced.matches;
  motionButton.firstElementChild.textContent = motion ? "[hold still]" : "[play anyway]";
  motionButton.setAttribute(
    "aria-label",
    motion
      ? "Hold the pieces still, as your system asks"
      : "Your system asks for reduced motion, so the pieces hold still. Play them anyway"
  );
}

if (motionButton) {
  if (motion) applyMotion();
  showMotion();
  reduced.addEventListener("change", showMotion);
  motionButton.addEventListener("click", () => {
    motion = !motion;
    try {
      localStorage.setItem("motion", motion ? "play" : "still");
    } catch {
      /* private mode */
    }
    showMotion();
    applyMotion();
  });
}

/*===== INK: the logos in colour or one ink =====*/
const inkButton = document.getElementById("ink");
let mono = false;
try {
  mono = localStorage.getItem("ink") === "mono";
} catch {
  /* private mode */
}

function applyInk() {
  document.querySelectorAll("ascii-art.logo").forEach((el) => el.toggleAttribute("mono", mono));
  inkButton.firstElementChild.textContent = mono ? "[colour]" : "[mono]";
  inkButton.setAttribute("aria-label", mono ? "Show the logos in colour" : "Show the logos in one ink");
}

if (inkButton) {
  applyInk();
  inkButton.hidden = false;
  inkButton.addEventListener("click", () => {
    mono = !mono;
    try {
      localStorage.setItem("ink", mono ? "mono" : "colour");
    } catch {
      /* private mode */
    }
    applyInk();
  });
}

/*===== SIDEBAR: the section on screen is marked current =====*/
const sections = [...document.querySelectorAll("main section[id]")];
const sideLinks = new Map(
  sections.map((s) => [s.id, document.querySelector(`.side h3 a[href="#${s.id}"]`)]).filter(([, a]) => a)
);

if (sideLinks.size && "IntersectionObserver" in window) {
  const seen = new Map();
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
      const current = sections.find((s) => seen.get(s.id));
      sideLinks.forEach((a, id) => {
        if (current && id === current.id) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-20% 0px -60% 0px" }
  );
  sections.forEach((s) => spy.observe(s));
}

/*===== HIDDEN GEM =====*/
console.log(
  "%cCurious? There's a flag hiding in this site. Submit with attempt(\"...\")",
  "color:#5f6873;font-family:ui-monospace,monospace"
);

const x = "amF3bnt3aGF0X3lv";
const y = "dV9kb190b2RheV9t";
const z = "YXR0ZXJzfQ==";

const sol = atob(x) + atob(y) + atob(z);

function attempt(inp) {
  if (inp === sol) {
    alert("You did it!");
    activatePartyMode();
  } else {
    alert("Incorrect! Try again.");
  }
}

/*===== PARTY MODE: the hero bursts into fireworks and the ink cycles =====*/
function activatePartyMode() {
  if (root.classList.contains("party")) return;
  root.classList.add("party");
  const hero = document.querySelector("#hero ascii-art");
  if (hero && hero.dataset.party) {
    hero.setAttribute("piece", hero.dataset.party);
    hero.setAttribute("label", "fireworks");
    hero.style.setProperty("--cols", "64");
    hero.style.setProperty("--rows", "24");
  }
}

window.attempt = attempt;
window.activatePartyMode = activatePartyMode;
