'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { API_BASE_URL } from '@/lib/config';

export default function SetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState('');

  useEffect(() => {
    // Get contact info from sessionStorage
    const savedContact = sessionStorage.getItem('signupContact');
    const savedContactType = sessionStorage.getItem('signupContactType');
    const isOtpVerified = sessionStorage.getItem('isOtpVerified');
    
    if (!savedContact || !savedContactType || isOtpVerified !== 'true') {
      router.push('/auth/signup');
      return;
    }

    setContact(savedContact);
    setContactType(savedContactType);
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Create user account
      const signupData = {
        password: formData.password
      };

      if (contactType === 'email') {
        signupData.email = contact;
      } else {
        signupData.phone = contact;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact,
          contactType,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.status) {
        // Clear sessionStorage
        sessionStorage.removeItem('signupContact');
        sessionStorage.removeItem('signupContactType');
        sessionStorage.removeItem('isOtpVerified');
        
        // Redirect to login page
        router.push('/auth/login?signupSuccess=true');
      } else {
        setErrors({ submit: data.message || 'Failed to create account' });
      }
    } catch (error) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const maskedContact = contactType === 'email' 
    ? contact.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : contact.replace(/(\d{2})(\d+)(\d{2})/, '$1******$3');

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Set Password</h1>
            <p className="auth-subtitle">
              Create a password for {maskedContact}
            </p>
          </div>

          {errors.submit && (
            <div className="auth-error-message">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label htmlFor="password">New Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password (min 6 characters)"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="auth-form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link href="/auth/login" className="auth-link">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

