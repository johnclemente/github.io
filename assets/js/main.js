/*===== MENU SHOW / HIDE =====*/
document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("nav-toggle");
  const navMenu   = document.getElementById("nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("show");
    });
  }

  /*‑‑ close menu after clicking a link (mobile UX) ‑‑*/
  document.querySelectorAll(".nav__link").forEach(link =>
    link.addEventListener("click", () => {
      if (window.innerWidth < 768) navMenu.classList.remove("show");
    })
  );
});



/*==== UPDATE WORD ====*/

//grab content once page is loaded
let currentWordIndex = 0;
let currentLetterIndex = 0;
let typingInterval;

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

function typeLetter() {
  const wordSpan = document.querySelector(".home__title-color:last-child");
  if (wordSpan) {
    const currentWord = words[currentWordIndex];
    wordSpan.textContent += currentWord[currentLetterIndex];
    currentLetterIndex++;

    if (currentLetterIndex < currentWord.length) {
      typingInterval = setTimeout(typeLetter, 50); // Adjust typing speed here
    } else {
      setTimeout(updateWord, 1000); // Adjust delay between words here
    }
  }
}

function updateWord() {
  const wordSpan = document.querySelector(".home__title-color:last-child");
  if (wordSpan) {
    wordSpan.textContent = "";
    currentWordIndex = (currentWordIndex + 1) % words.length;
    currentLetterIndex = 0;
    typeLetter();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateWord();
});


/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll("section[id]");

function scrollActive() {
  const scrollY = window.pageYOffset;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 50;
    const sectionId = current.getAttribute("id");

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document
        .querySelector(".nav__menu a[href*=" + sectionId + "]")
        .classList.add("active");
    } else {
      document
        .querySelector(".nav__menu a[href*=" + sectionId + "]")
        .classList.remove("active");
    }
  });
}
window.addEventListener("scroll", scrollActive);

/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
  origin: "top",
  distance: "60px",
  duration: 2000,
  delay: 200,
  //     reset: true
});


const x = "eW91cl9j"
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

function activatePartyMode() {
  const hueValues = [260, 355, 224, 340];
  let index = 0;

  setInterval(() => {
    document.documentElement.style.setProperty('--hue-color', hueValues[index]);
    index = (index + 1) % hueValues.length;
  }, 1000);
}

window.attempt = attempt;
window.activatePartyMode = activatePartyMode;

