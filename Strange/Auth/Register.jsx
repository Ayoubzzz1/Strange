import React, { useState } from 'react';
import { auth, db } from '../src/firebase-config';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({
      ...prev,
      phone: value,
    }));
  };

  const validateForm = () => {
    // Password validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    // Username validation
    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;

    // Validate form before submission
    if (!validateForm()) return;

    // Create a promise for the registration process
    const registrationPromise = async () => {
      try {
        setIsSubmitting(true);

        // Register user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;

        // Send email verification
        await sendEmailVerification(user);

        // Save user details to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          createdAt: new Date(),
        });

        // Navigate to verification page
        navigate('/verif');

        return user;
      } catch (error) {
        // Handle specific Firebase authentication errors
        switch (error.code) {
          case 'auth/email-already-in-use':
            throw new Error('Email is already registered');
          case 'auth/weak-password':
            throw new Error('Password is too weak. Please choose a stronger password');
          default:
            throw new Error(error.message || 'Registration failed. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    // Use toast promise for registration
    toast.promise(registrationPromise(), {
      loading: 'Registering...',
      success: 'Registration successful! Please verify your email.',
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

      <div className="card shadow-sm p-4" style={{ width: '400px', borderRadius: '10px', backgroundColor: '#ff5733' }}>
        <h2 className="text-center mb-9" style={{ color: '#1a0632' }}>Register</h2>

        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="mb-3">
            <label htmlFor="username" className="form-label" style={{ color: 'white' }}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              required
              style={{ backgroundColor: '#ffffff', color: 'black' }}
              minLength={3}
              maxLength={50}
            />
          </div>

          {/* Email Input */}
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
              onChange={handleInputChange}
              required
              style={{ backgroundColor: '#ffffff', color: 'black' }}
            />
          </div>

          {/* Phone Input */}
          <div className="mb-3">
            <label htmlFor="phone" className="form-label" style={{ color: 'white' }}>
              Phone
            </label>
            <PhoneInput
              country={'us'}
              value={formData.phone}
              onChange={handlePhoneChange}
              inputStyle={{
                width: '100%',
                height: '40px',
              }}
              style={{ backgroundColor: '#ffffff', color: 'black' }}
            />
          </div>

          {/* Password Input */}
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
              onChange={handleInputChange}
              required
              style={{ backgroundColor: '#ffffff', color: 'black' }}
              minLength={6}
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label" style={{ color: 'white' }}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              style={{ backgroundColor: '#ffffff', color: 'black' }}
              minLength={6}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn" 
            style={{ 
              backgroundColor: '#1a0632', 
              color: 'white', 
              width: '100%' 
            }}
            disabled={isSubmitting}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;

