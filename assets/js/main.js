import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAlZPkdgsIAXGpx6NYMciYS3MGeD9uAC0",
  authDomain: "johns-portfolio--1702339781998.firebaseapp.com",
  projectId: "johns-portfolio--1702339781998",
  storageBucket: "johns-portfolio--1702339781998.appspot.com",
  messagingSenderId: "560668929507",
  appId: "1:560668929507:web:54f3e35fde733e732784d6",
  measurementId: "G-G43ZGCLD21",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Use getDatabase to initialize

// Handle form submission
document
  .getElementById("contactForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Get form values
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    // Validate input
    if (!name || !email || !message) {
      alert("All fields are required!");
      return;
    }

    // Create a new entry in Firebase
    const newContactRef = push(ref(database, "contacts")); // Use push to generate a new reference
    set(newContactRef, {
      name: name,
      email: email,
      message: message,
      timestamp: new Date().toISOString(),
    })
      .then(function () {
        alert("Your message has been sent successfully!");
        document.getElementById("contactForm").reset(); // Reset the form
      })
      .catch(function (error) {
        console.error("Error saving to database: ", error);
        alert(
          "There was an error sending your message. Please try again later."
        );
      });
  });

/*===== MENU SHOW =====*/
const showMenu = (toggleId, navId) => {
  const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId);

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("show");
    });
  }
};
showMenu("nav-toggle", "nav-menu");

/*==== UPDATE WORD ====*/

//grab content once page is loaded
let currentWordIndex = 0;
let currentLetterIndex = 0;
let typingInterval;

const words = [
  "challenges",
  "opportunities",
  "knowledge",
  "experiences",
  "teamwork",
  "innovation",
  "automation",
  "security",
  "performance",
  "solutions",
  "ownership",
  "scalability",
  "optimization",
  "reliability",
  "growth",
  "collaboration",
  "mastery",
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

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll(".nav__link");

function linkAction() {
  const navMenu = document.getElementById("nav-menu");
  // When we click on each nav__link, we remove the show-menu class
  navMenu.classList.remove("show");
}
navLink.forEach((n) => n.addEventListener("click", linkAction));

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
