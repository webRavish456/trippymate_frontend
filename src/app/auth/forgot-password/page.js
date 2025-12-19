'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { API_BASE_URL } from '@/lib/config';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validation
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.status) {
        setSuccess(true);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Forgot Password</h1>
            {!success && (
              <p className="forgot-password-subtitle">
                Enter your email address and we'll send you a link to reset your password
              </p>
            )}
          </div>

          {error && (
            <div className="login-error-message">
              {error}
            </div>
          )}

          {success ? (
            <div className="forgot-password-success">
              <h3 className="forgot-password-success-title">Email Sent!</h3>
              <p className="forgot-password-success-text">
                We've sent a password reset link to your email address. Please check your inbox.
              </p>
              <Link href="/auth/login" className="forgot-password-back-link">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    if (fieldErrors.email) {
                      setFieldErrors({ ...fieldErrors, email: '' });
                    }
                  }}
                  className={fieldErrors.email ? 'error' : ''}
                />
                {fieldErrors.email && (
                  <span className="error-text">{fieldErrors.email}</span>
                )}
              </div>

              <button type="submit" className="login-signin-btn" disabled={loading}>
                {loading ? (
                  <div className="login-btn-loading">
                    <svg className="login-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="login-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="login-spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <div className="login-footer">
            <span>Remember your password?</span>
            <Link href="/auth/login" className="login-create-link">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
