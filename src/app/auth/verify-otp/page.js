'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { API_BASE_URL } from '@/lib/config';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get contact info from sessionStorage
    const savedContact = sessionStorage.getItem('signupContact');
    const savedContactType = sessionStorage.getItem('signupContactType');
    
    if (!savedContact) {
      router.push('/auth/signup');
      return;
    }

    setContact(savedContact);
    setContactType(savedContactType || 'email');

    // Focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [router]);

  useEffect(() => {
    // Resend cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear error
    if (errors.otp) {
      setErrors({ ...errors, otp: '' });
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter complete 6-digit OTP' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact,
          otp: otpString
        }),
      });

      const data = await response.json();

      if (data.status) {
        // OTP verified, redirect to password setup
        sessionStorage.setItem('isOtpVerified', 'true');
        router.push('/auth/set-password');
      } else {
        setErrors({ otp: data.message || 'Invalid OTP. Please try again.' });
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact }),
      });

      const data = await response.json();

      if (data.status) {
        setResendCooldown(60); // 60 seconds cooldown
        setErrors({ resend: 'OTP sent successfully!' });
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setErrors({ resend: data.message || 'Failed to resend OTP' });
      }
    } catch (error) {
      setErrors({ resend: 'Failed to resend OTP. Please try again.' });
    } finally {
      setResendLoading(false);
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
            <h1 className="auth-title">Verify OTP</h1>
            <p className="auth-subtitle">
              We've sent a 6-digit OTP to {maskedContact}
            </p>
          </div>

          {errors.submit && (
            <div className="auth-error-message">
              {errors.submit}
            </div>
          )}

          {errors.resend && (
            <div className={errors.resend.includes('successfully') ? 'auth-success-message' : 'auth-error-message'}>
              {errors.resend}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label>Enter 6-Digit OTP</label>
              <div className="otp-input-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`otp-input ${errors.otp ? 'error' : ''}`}
                  />
                ))}
              </div>
              {errors.otp && <span className="error-text">{errors.otp}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="auth-resend-section">
            <p>Didn't receive OTP?</p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading || resendCooldown > 0}
              className="auth-resend-btn"
            >
              {resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : resendLoading
                ? 'Sending...'
                : 'Resend OTP'}
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Wrong {contactType === 'email' ? 'email' : 'phone number'}?{' '}
              <Link href="/auth/signup" className="auth-link">
                Go back
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

