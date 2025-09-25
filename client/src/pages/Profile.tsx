import React, { useState, useEffect } from "react";
import { toast , ToastContainer } from "react-toastify"; // Import toast library
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import "./Profile.css";

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [courses, setCourses] = useState<{ name: string; code: string }[]>([]);
  const [initialUserInfo, setInitialUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    courses: [],
  });
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false); // State for delete confirmation overlay
  

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("Fetching user profile...");
        const response = await fetch("http://localhost:5000/api/users/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Response status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched user profile:", data);

          setFirstName(data.firstName);
          setLastName(data.lastName);
          setEmail(data.email);
          setCourses(data.courses || []);
          setInitialUserInfo({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            courses: data.courses || [],
          });
        } else {
          console.error("Failed to fetch user profile. Status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error("First Name cannot be empty."); // Show error toast
      return;
    }
    if (!lastName.trim()) {
      toast.error("Last Name cannot be empty."); // Show error toast
      return;
    }

    try {
      console.log("Updating user profile...");
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      });

      console.log("Response status:", response.status);
      if (response.ok) {
        const updatedUser = await response.json();
        console.log("Updated user profile:", updatedUser);
        toast.success("Profile updated successfully!"); // Show success toast
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile. Please try again."); // Show error toast
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error("An error occurred while updating your profile."); // Show error toast
    }
  };

  const handleDeleteAccount = async () => {
    try {
      console.log("Deleting user account...");
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Response status:", response.status);
      if (response.ok) {
        toast.success("Your account has been deleted successfully.");
        localStorage.removeItem("token");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        toast.error("Failed to delete account. Please try again.");
        console.error("Failed to delete account. Status:", response.status);
      }
    } catch (error) {
      console.error("Error deleting user account:", error);
      toast.error("An error occurred while deleting your account. Please try again.");
    }
  };

  const handleCancel = () => {
    setFirstName(initialUserInfo.firstName);
    setLastName(initialUserInfo.lastName);
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <ToastContainer />
      <h1>Profile</h1>
      <div className="profile-info">
        {!isEditing ? (
          <>
            <p><strong>First Name:</strong> {firstName}</p>
            <p><strong>Last Name:</strong> {lastName}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Enrolled Courses:</strong></p>
            <ul>
              {courses.map((course, index) => (
                <li key={index}>
                  <strong>{course.name}</strong> ({course.code})
                </li>
              ))}
            </ul>
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
            <button className="delete-button" onClick={() => setShowDeleteOverlay(true)}>
              Delete Account
            </button>
          </>
        ) : (
          <form className="profile-form" onSubmit={handleSave}>
            <label>
              First Name:
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label>
              Last Name:
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
            <button type="submit">Save Changes</button>
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Delete Confirmation Overlay */}
      {showDeleteOverlay && (
        <div className="overlay">
          <div className="overlay-content">
            <h3>Are you sure you want to delete your account? This action cannot be undone.</h3>
            <div className="overlay-buttons">
              <button className="confirm-button-delete" onClick={handleDeleteAccount}>Yes</button>
              <button className="cancel-button-delete" onClick={() => setShowDeleteOverlay(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;