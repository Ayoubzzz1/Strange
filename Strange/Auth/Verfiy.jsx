import React, { useState, useEffect } from 'react';
import { auth } from '../src/firebase-config';
import { onAuthStateChanged, reload, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function Verif() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkVerificationStatus = async (currentUser) => {
      if (currentUser) {
        try {
          // Reload user to get the most current verification status
          await reload(currentUser);
          
          // Check if email is verified
          if (currentUser.emailVerified) {
            navigate('/home');
            return;
          }
        } catch (error) {
          console.error('Error checking verification:', error);
        }
      } else {
        // If no user is logged in, redirect to login
        navigate('/login');
      }
    };

    // Setup auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Check verification status immediately
      if (currentUser) {
        checkVerificationStatus(currentUser);
      }
    });

    // Check verification status periodically
    const verificationCheckInterval = setInterval(() => {
      if (user) {
        checkVerificationStatus(user);
      }
    }, 5000); // Check every 5 seconds

    // Cleanup subscriptions
    return () => {
      unsubscribe();
      clearInterval(verificationCheckInterval);
    };
  }, [navigate, user]);

  const handleResendVerification = async () => {
    if (user) {
      // Create a promise for resending verification email
      const resendVerificationPromise = async () => {
        try {
          await sendEmailVerification(user);
          return 'Verification email resent! Please check your inbox.';
        } catch (error) {
          console.error('Error resending verification email:', error);
          throw new Error('Failed to resend verification email. Please try again.');
        }
      };

      // Use toast promise for resending verification
      toast.promise(resendVerificationPromise(), {
        loading: 'Sending verification email...',
        success: (message) => message,
        error: (err) => err.message
      });
    }
  };

  // If no user is logged in, show nothing
  if (!user) {
    return null;
  }

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

      <div 
        className="card shadow-sm p-4" 
        style={{ 
          width: '400px', 
          borderRadius: '10px', 
          backgroundColor: '#ff5733',
          textAlign: 'center'
        }}
      >
        <h2 style={{ color: '#1a0632', marginBottom: '20px' }}>Email Verification</h2>
        
        <p style={{ color: 'white', marginBottom: '20px' }}>
          Please verify your email address. A verification link has been sent to:
        </p>
        
        <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>
          {user.email}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={handleResendVerification}
            className="btn" 
            style={{ 
              backgroundColor: '#ffffff', 
              color: '#1a0632', 
              width: '100%' 
            }}
          >
            Resend Verification Email
          </button>
        </div>
      </div>
    </div>
  );
}

export default Verif;