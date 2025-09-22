import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";

// A simple SVG icon for the email envelope
const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: "#2c3e50" }}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

export const ConfirmEmail = () => {
  const location = useLocation();
  // Attempt to get the email from the navigation state, or fallback to a placeholder
  const email = location.state?.email || "your email address";

  const [isSending, setIsSending] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleResendEmail = async () => {
    setIsSending(true);
    setFeedbackMessage("");
    try {
      // --- Your API call to resend the email would go here ---
      // For demonstration, we'll simulate a network request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // On success:
      setFeedbackMessage(`A new confirmation link has been sent to ${email}.`);
    } catch (error) {
      // On failure:
      setFeedbackMessage("Failed to resend email. Please try again later.");
      console.error("Resend email failed:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <EmailIcon />
        <h1 style={styles.title}>Confirm Your Email</h1>
        <p style={styles.text}>We've sent a confirmation link to:</p>
        <p style={styles.emailText}>{email}</p>
        <p style={styles.text}>
          Please check your inbox (and spam folder!) and click the link to
          complete your registration.
        </p>
        <div style={styles.resendContainer}>
          <p style={styles.text}>Didn't receive the email?</p>
          <button
            onClick={handleResendEmail}
            disabled={isSending}
            style={
              isSending
                ? { ...styles.button, ...styles.buttonDisabled }
                : styles.button
            }
          >
            {isSending ? "Sending..." : "Resend Confirmation Link"}
          </button>
        </div>
        {feedbackMessage && (
          <p style={styles.feedbackText}>{feedbackMessage}</p>
        )}
        <Link to="/login" style={styles.link}>
          Back to Login
        </Link>
      </div>
    </div>
  );
};

// --- CSS-in-JS Styles ---
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f7f6",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "450px",
    width: "90%",
  },
  title: {
    fontSize: "28px",
    color: "#2c3e50",
    marginBottom: "15px",
  },
  text: {
    color: "#555",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "10px 0",
  },
  emailText: {
    color: "#3498db",
    fontWeight: "bold",
    fontSize: "18px",
    margin: "5px 0 20px 0",
  },
  resendContainer: {
    marginTop: "30px",
    borderTop: "1px solid #eee",
    paddingTop: "20px",
  },
  button: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonDisabled: {
    backgroundColor: "#a9d6f5",
    cursor: "not-allowed",
  },
  feedbackText: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#27ae60", // Green for success, could be changed to red for error
  },
  link: {
    display: "inline-block",
    marginTop: "25px",
    color: "#7f8c8d",
    textDecoration: "none",
    fontSize: "14px",
  },
};
