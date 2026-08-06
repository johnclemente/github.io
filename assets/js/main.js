/* Enables .reveal animations — without JS the content stays visible (see styles.css) */
document.documentElement.classList.add("js");

/*===== MENU SHOW / HIDE =====*/
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("show");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  /* close menu after clicking a link (mobile UX) */
  navMenu.querySelectorAll(".nav__link").forEach((link) =>
    link.addEventListener("click", () => {
      navMenu.classList.remove("show");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );
}

/*===== TYPEWRITER =====*/
const words = [
  "Python",
  "Why Leetcode?",
  "ML",
  "Quant Computing",
  "Vibe Coding",
  "Automation",
  "Optimization",
  "Data Structures",
  "Hiring",
  "Your Pipeline",
  "Security",
  "Performance",
  "AI",
  "The Singularity",
  "Mastery",
];

const wordSpan = document.querySelector(".home__typing-word");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let wordIndex = 0;
let letterIndex = 0;

function typeLetter() {
  const word = words[wordIndex];
  wordSpan.textContent += word[letterIndex];
  letterIndex++;

  if (letterIndex < word.length) {
    setTimeout(typeLetter, 50);
  } else {
    setTimeout(nextWord, 1400);
  }
}

function nextWord() {
  wordSpan.textContent = "";
  wordIndex = (wordIndex + 1) % words.length;
  letterIndex = 0;
  typeLetter();
}

if (wordSpan) {
  if (reducedMotion) {
    wordSpan.textContent = words[0];
  } else {
    typeLetter();
  }
}

/*===== SCROLL SECTIONS ACTIVE LINK =====*/
const sections = document.querySelectorAll("main section[id]");

function scrollActive() {
  const scrollY = window.pageYOffset;

  sections.forEach((section) => {
    const link = document.querySelector(`.nav__menu a[href="#${section.id}"]`);
    if (!link) return;

    const top = section.offsetTop - 80;
    const inView = scrollY > top && scrollY <= top + section.offsetHeight;
    link.classList.toggle("active", inView);
  });
}
window.addEventListener("scroll", scrollActive, { passive: true });

/*===== SCROLL REVEAL (IntersectionObserver) =====*/
const revealEls = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => observer.observe(el));
}

/*===== HIDDEN GEM =====*/
const x = "eW91cl9j";
const y = "b3JyZWN0";
const z = "X2ZsYWc=";

const sol = atob(x) + atob(y) + atob(z);

function attempt(inp) {
  if (inp === sol) {
    alert("You did it!");
    activatePartyMode();
  } else {
    alert("Incorrect! Try again.");
  }
}

/*===== PARTY MODE =====*/
let partyInterval = null;

function activatePartyMode() {
  if (partyInterval) return;

  const hueValues = [260, 355, 224, 340];
  let index = 0;

  partyInterval = setInterval(() => {
    document.documentElement.style.setProperty("--hue", hueValues[index]);
    index = (index + 1) % hueValues.length;
  }, 1000);
}

window.attempt = attempt;
window.activatePartyMode = activatePartyMode;
