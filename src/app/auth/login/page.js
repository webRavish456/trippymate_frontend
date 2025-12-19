'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '@/component/firebase';
import { setUser } from '@/store/actions/userActions';

import { API_BASE_URL } from '@/lib/config';

function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    identifier: '', // can be email or phone
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    // Check if user is already logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        router.push('/');
      }
    }

    // Show success message if redirected from signup
    if (searchParams.get('signupSuccess') === 'true') {
      // Success message can be shown here
      console.log('Account created successfully!');
    }

    // Check for Firebase redirect result (if using redirect method)
    checkRedirectResult();
  }, [router, searchParams]);

  const checkRedirectResult = async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        await handleFirebaseAuthSuccess(result.user);
      }
    } catch (error) {
      console.error('Redirect result error:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user types
    if (error) {
      setError(null);
    }
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validation
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
    } else {
      const isEmail = /\S+@\S+\.\S+/.test(formData.identifier);
      const isPhone = /^[0-9]{10}$/.test(formData.identifier.replace(/\D/g, ''));
      if (!isEmail && !isPhone) {
        newErrors.identifier = 'Please enter a valid email or phone number';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Determine if input is email or phone
      const isEmail = /\S+@\S+\.\S+/.test(formData.identifier);
      const loginData = {
        password: formData.password
      };

      if (isEmail) {
        loginData.email = formData.identifier.toLowerCase().trim();
      } else {
        loginData.phone = formData.identifier.replace(/\D/g, '');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.status) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.data.token);
        }
        // Store user in Redux
        dispatch(setUser(data.data.user));
        router.push('/');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseAuthSuccess = async (firebaseUser) => {
    try {
      // Send to backend for verification and user creation/login
      const authResponse = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || firebaseUser.email || 'User',
          profilePicture: firebaseUser.photoURL || ''
        }),
      });

      const data = await authResponse.json();

      if (data.status) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.data.token);
        }
        // Store user in Redux
        dispatch(setUser(data.data.user));
        router.push('/');
      } else {
        setError(data.message || 'Google login failed');
        setGoogleLoading(false);
      }
    } catch (error) {
      console.error('Firebase auth success error:', error);
      setError('Failed to complete login. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    
    try {
      // Use Firebase signInWithPopup for better UX
      const result = await signInWithPopup(auth, googleProvider);
      await handleFirebaseAuthSuccess(result.user);
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      // Handle specific errors
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        // Fallback to redirect if popup is blocked
        try {
          await signInWithRedirect(auth, googleProvider);
          // User will be redirected, so we don't need to set loading to false
          return;
        } catch (redirectError) {
          setError('Please allow popups or redirects for Google sign-in.');
        }
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(error.message || 'Google sign-in failed. Please try again.');
      }
      
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Sign In</h1>
          </div>

          {error && (
            <div className="login-error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label htmlFor="identifier">Email or Phone Number</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                className={fieldErrors.identifier ? 'error' : ''}
              />
              {fieldErrors.identifier && (
                <span className="error-text">{fieldErrors.identifier}</span>
              )}
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={fieldErrors.password || error ? 'error' : ''}
              />
              {fieldErrors.password && (
                <span className="error-text">{fieldErrors.password}</span>
              )}
            </div>

            <div className="login-forgot-password">
              <Link href="/auth/forgot-password" className="login-forgot-link">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-signin-btn"
            >
              {loading ? (
                <div className="login-btn-loading">
                  <svg className="login-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="login-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="login-spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <div className="login-social-buttons">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="login-google-btn"
            >
              {googleLoading ? (
                <div className="login-google-btn-content">
                  <svg className="login-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="login-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="login-spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in with Google...
                </div>
              ) : (
                <div className="login-google-btn-content">
                  <Image
                    src="/google-logo.png"
                    alt="Google"
                    width={20}
                    height={20}
                    className="login-google-icon"
                  />
                  Continue with Google
                </div>
              )}
            </button>
          </div>

          <div className="login-footer">
            <span>New User?</span>
            <Link href="/auth/signup" className="login-create-link">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1 className="login-title">Sign In</h1>
            </div>
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
