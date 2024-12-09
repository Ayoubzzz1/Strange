import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/firebase-config';
import toast, { Toaster } from 'react-hot-toast';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    // Create a promise for the login process
    const loginPromise = async () => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if email is verified before navigating
        if (user.emailVerified) {
          // Navigate to home page on successful login
          navigate('/home');
        } else {
          // If email is not verified, navigate to verification page
          navigate('/verif');
        }

        return user;
      } catch (error) {
        // Handle login errors
        console.error('Error during login:', error.message);
        
        // Set specific error messages based on error type
        switch (error.code) {
          case 'auth/user-not-found':
            throw new Error('No user found with this email.');
          case 'auth/wrong-password':
            throw new Error('Incorrect password.');
          case 'auth/invalid-email':
            throw new Error('Invalid email address.');
          default:
            throw new Error('Login failed. Please try again.');
        }
      }
    };

    // Use toast promise for login
    toast.promise(loginPromise(), {
      loading: 'Logging in...',
      success: 'Login successful!',
      error: (err) => err.message
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#1a0632' }}>
      {/* Add Toaster for toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#4CAF50',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#F44336',
              color: 'white',
            },
          },
        }}
      />

      <div className="card p-4" style={{ width: '400px', borderRadius: '10px', backgroundColor: '#1a0632' }}>
        <h3 className="text-center mb-4" style={{ color: '#ff5733' }}>Login</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label" style={{ color: 'white' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ backgroundColor: '#2c0d56', color: 'white' }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label" style={{ color: 'white' }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ backgroundColor: '#2c0d56', color: 'white' }}
            />
          </div>
          <button 
            type="submit" 
            className="btn" 
            style={{ 
              backgroundColor: '#ff5733', 
              color: 'white', 
              width: '100%' 
            }}
          >
            Login
          </button>
        </form>

        {/* Optional: Add a link to registration */}
        <div className="text-center mt-3">
          <p style={{ color: 'white' }}>
            Don't have an account? {' '}
            <a 
              href="/register" 
              style={{ 
                color: '#ff5733', 
                textDecoration: 'none' 
              }}
            >
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;