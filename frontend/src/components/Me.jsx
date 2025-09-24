import { useEffect, useState } from "react";
import apiService from "../../service/apiService";

const Me = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await apiService.getUserProfile();
        setUserProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile");
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  if (!userProfile) {
    return <div>No user profile found.</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f7f6",
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
        <div>
          <strong>Full Name:</strong> {userProfile.fullname}
        </div>
        <div
          style={{
            fontSize: "18px",
            color: "#34495e",
            marginBottom: "15px",
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
          }}
        >
          <strong>Username:</strong> {userProfile.username}
        </div>
        <div
          style={{
            fontSize: "18px",
            color: "#34495e",
            marginBottom: "15px",
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
          }}
        >
          <strong>Email:</strong> {userProfile.email}
        </div>
        <div
          style={{
            fontSize: "18px",
            color: "#34495e",
            marginBottom: "15px",
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
          }}
        >
          <strong>Role:</strong> {userProfile.role}
        </div>
        <div
          style={{
            fontSize: "18px",
            color: "#34495e",
            marginBottom: "15px",
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
          }}
        >
          <strong>Email Verified:</strong>{" "}
          {userProfile.isEmailVerified ? "Yes" : "No"}
        </div>
        {/* Add more profile details as needed */}
      </div>
    </div>
  );
};

export default Me;
