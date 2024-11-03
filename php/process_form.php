<?php
session_start();

error_log("process_form.php called");

// Restrict script to only handle POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die("Invalid access");
}

// Verify that the form submission is coming from your domain
if (!isset($_SERVER['HTTP_REFERER']) || strpos($_SERVER['HTTP_REFERER'], 'yourdomain.com') === false) {
    die("Invalid referrer");
}

// Validate CSRF token
if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    die("Invalid token");
}

// Honeypot validation (hp-email should be empty)
if (!empty($_POST['hp-email'])) {
    die("Spam detected!"); // Honeypot is filled, treat it as spam
}

// Time-based validation (form should not be submitted too quickly)
$submission_time = time();
$form_time = isset($_POST['form_time']) ? (int)$_POST['form_time'] : 0;
$time_difference = $submission_time - $form_time;

// Debugging output
echo "Form time: $form_time<br>";
echo "Submission time: $submission_time<br>";
echo "Time difference: $time_difference seconds<br>";

if ($time_difference < 10) {
    die("Spam detected! Form submitted too quickly.");
}

// Sanitize and validate the form inputs
$name = htmlspecialchars(trim($_POST['name']));
$email = filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL);
$message = htmlspecialchars(trim($_POST['message']));

// Ensure required fields are filled
if ($name && $email && $message) {
    // Send the email (or handle form data as needed)
    $to = "me@johnclemente.com"; // Replace with your email
    $subject = "New Contact Form Submission from $name";
    $headers = "From: " . $email;
    $body = "Name: $name\nEmail: $email\nMessage:\n$message";

    // You can use mail() function to send email
    if (mail($to, $subject, $body, $headers)) {
        echo "Form submitted successfully!";
    } else {
        echo "Error in sending email. Please try again later.";
    }
} else {
    echo "Please fill in all the required fields!";
}
?>
