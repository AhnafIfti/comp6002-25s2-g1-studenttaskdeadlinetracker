import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { toast, ToastContainer } from 'react-toastify'; // Import toast notifications
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const navigate = useNavigate();

  // Use Google login hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Google login successful:', tokenResponse);

      try {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const userInfo = await userInfoResponse.json();
        console.log('User info:', userInfo);

        // Send to backend for authentication
        const backendResponse = await fetch('http://localhost:5000/api/users/google-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userInfo.email,
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
            googleId: userInfo.sub,
          }),
        });

        if (backendResponse.ok) {
          const data = await backendResponse.json();
          localStorage.setItem('token', data.token);
          onLogin();
        } else {
          const errorData = await backendResponse.json();
          console.error('Backend error:', errorData); // Log the error data for debugging
        }
      } catch (error) {
        console.error('Error during Google login:', error);
      }
    },
    onError: (error) => {
      console.error('Google login failed:', error);
    },
  });

  /**
   * Validates the form input fields and returns whether the form is valid
   * Checks:
   * - Email is present and in valid format
   * - Password is present when email form is shown
   */
  const validateForm = () => {
    let isValid = true;

    // Validate email field
    if (!email.trim()) {
      toast.error("Email cannot be empty."); // Show error toast
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email."); // Show error toast
      isValid = false;
    }

    // Validate password field (only when email form is shown)
    if (showEmailForm) {
      if (!password.trim()) {
        toast.error("Password cannot be empty."); // Show error toast
        isValid = false;
      } else if (password.length < 6) {
        toast.error("Password must be at least 6 characters long."); // Show error toast
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form on submit
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      console.log('Sending login request to:', 'http://localhost:5000/api/users/login');

      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log('Response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        onLogin();
        toast.success("Logged in successfully!"); // Show success toast
        navigate('/dashboard');
      } else {
        toast.error(data.message || "Login failed."); // Show error toast
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error("An error occurred during login. Please try again."); // Show error toast
    }
  };

  // Updated Google login handler to use the Google OAuth hook
  const handleGoogleLogin = () => {
    console.log('Google login button clicked');
    googleLogin();
  };

  const handleEmailLoginClick = () => {
    setShowEmailForm(true);
  };

  return (
    <div className="login-container">
      <ToastContainer/>
      <h1 className="login-header">Log In</h1>

      {!showEmailForm ? (
        <div className="login-options">
          <button
            className="google-login-button"
            onClick={handleGoogleLogin}
          >
            <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            Continue with Google
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            className="email-login-button"
            onClick={handleEmailLoginClick}
          >
            Log in with email
          </button>
        </div>
      ) : (
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>

          <button type="submit" className="login-submit-button">
            Log in
          </button>

          <div className="back-link">
            <Link to="#" onClick={() => setShowEmailForm(false)} className="back-link-text">
              Back to login options
            </Link>
          </div>
        </form>
      )}

      <div className="signup-link">
        Don't have an account? <Link to="/register">Sign up</Link> {/* Ensure the route matches the App.tsx configuration */}
      </div>
    </div>
  );
};

export default Login;