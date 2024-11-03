import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Turns out this stuff isn't private...who knew?
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

let isSubmitting = false; // Flag to track submission status
const submissionCooldown = 30000; // Cooldown period in milliseconds (e.g., 5 seconds)

function rateLimitSubmission() {
  if (isSubmitting) {
    alert(`Please wait ${submissionCooldown / 1000} seconds before submitting again.`);
    return false; // Prevent submission
  }

  isSubmitting = true; // Set flag to true when submitting

  // Disable the submit button
  const submitButton = document.querySelector(".contact__button"); // Use class selector for your button
  submitButton.disabled = true;

  // Start the countdown timer
  startCountdown();

  // Re-enable the button after the cooldown
  setTimeout(() => {
    isSubmitting = false;
    submitButton.disabled = false;
  }, submissionCooldown);

  return true; // Allow submission
}

function startCountdown() {
  let timeLeft = submissionCooldown / 1000; // Convert to seconds
  const countdownDisplay = document.createElement("div"); // Create a countdown display element
  countdownDisplay.id = "countdownDisplay"; // Set the ID for styling or future reference
  countdownDisplay.className = "countdown__display"; // Optional class for styling
  document.querySelector(".contact__form").appendChild(countdownDisplay); // Add to the form

  const interval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(interval);
      countdownDisplay.textContent = ""; // Clear countdown when done
      countdownDisplay.remove(); // Remove the countdown display
    } else {
      countdownDisplay.textContent = `Please wait ${timeLeft} seconds`;
      timeLeft--;
    }
  }, 1000);
}

// Handle form submission
document.getElementById("contactForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the traditional form submission

  // Check if the rate limit allows submission
  if (!rateLimitSubmission()) {
    return; // Exit if submission is not allowed
  }

  // Get form values
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  // Validate input
  if (!name || !email || !message) {
    alert("All fields are required!");
    return;
  }

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

  // After successful submission, reset the form
  document.getElementById("contactForm").reset(); // Reset the form
  alert("Your message has been sent successfully!"); // Notify the user
});



