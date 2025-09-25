import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Register.css';

// Define props interface for Register component
interface RegisterProps {
  onLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
        
        // Send to backend for authentication/registration
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
          alert(errorData.message || 'Google authentication failed');
        }
      } catch (error) {
        console.error('Error during Google login:', error);
        alert('Failed to authenticate with Google');
      }
    },
    onError: (error) => {
      console.error('Google login failed:', error);
      alert('Google login failed. Please try again.');
    },
  });

  // Handle Google login button click
  const handleGoogleLogin = () => {
    googleLogin();
  };

  // Validate form inputs
  const validateForm = () => {
    let isValid = true;

    if (!firstName.trim()) {
      toast.error('First name is required');
      isValid = false;
    }

    if (!lastName.trim()) {
      toast.error('Last name is required');
      isValid = false;
    }

    if (!email.trim()) {
      toast.error('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email');
      isValid = false;
    }

    if (!password) {
      toast.error('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      isValid = false;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Registration successful!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Registration failed!');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <ToastContainer />

      <div className="register-logo">
        <h1 className="logo-text">Student Deadline& Tasks Tracker</h1>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
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

        <div className="form-group">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
          />
        </div>

        <button type="submit" className="confirm-button">Confirm</button>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="google-button"
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

        <div className="login-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;