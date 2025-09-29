import { useEffect, useState } from "react";
import apiService from "../../../service/apiService";

const Me = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Assuming apiService.getUserProfile() is an authenticated call
        const response = await apiService.getUserProfile();
        // Use response.data? to defensively set the profile
        setUserProfile(response.data || null);
        console.log(response.data);
      } catch (err) {
        // Log the full error object for debugging
        console.error("Error fetching user profile:", err);
        // Display a user-friendly message
        setError(
          err.response?.data?.message ||
            "Could not retrieve user profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    // The dependency array is empty, running once on mount
  }, []);

  // --- Render Guards (API Error Handling) ---
  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center", fontSize: "1.2em" }}>
        Loading profile...
      </div>
    );
  }

  if (error) {
    // This catches your data fetching/network errors
    return (
      <div
        style={{
          color: "red",
          padding: "20px",
          textAlign: "center",
          border: "1px solid red",
          backgroundColor: "#ffe8e8",
        }}
      >
        {error}
      </div>
    );
  }

  if (!userProfile) {
    // Catches the case where the API call succeeds but returns no profile data
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        No user profile found. Please log in again.
      </div>
    );
  }

  // --- Main Render (Defensive Rendering) ---

  // Use optional chaining (?.) and nullish coalescing (??)
  // to safely access properties, replacing null/undefined values with a default string
  const fullName = userProfile.fullname ?? "N/A";
  const username = userProfile.username ?? "N/A";
  const email = userProfile.email ?? "N/A";
  const role = userProfile.role ?? "User";
  const isVerified = userProfile.isEmailVerified ? "Yes" : "No";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundColor: "#f4f7f6b2",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          textAlign: "left",
          maxWidth: "500px",
          width: "90%",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            color: "#2c3e50",
            marginBottom: "25px",
            textAlign: "center",
          }}
        >
          My Profile
        </h1>

        {/* Safely rendered details using the prepared variables */}
        <ProfileDetail label="Full Name" value={fullName} />
        <ProfileDetail label="Username" value={username} />
        <ProfileDetail label="Email" value={email} />
        <ProfileDetail label="Role" value={role} />
        <ProfileDetail label="Email Verified" value={isVerified} />
      </div>
    </div>
  );
};

// Simple reusable component for cleaner JSX
const ProfileDetail = ({ label, value }) => (
  <div
    style={{
      fontSize: "18px",
      color: "#34495e",
      marginBottom: "15px",
      borderBottom: "1px solid #eee",
      paddingBottom: "10px",
    }}
  >
    <strong>{label}:</strong> {value}
  </div>
);

export default Me;
