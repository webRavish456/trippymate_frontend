'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id;
  const [paymentId, setPaymentId] = useState('');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setPaymentId(urlParams.get('payment_id') || '');
      setOrderId(urlParams.get('order_id') || '');
    }
  }, []);

  useEffect(() => {
    // Add CSS animation if not already added
    if (typeof document !== 'undefined' && !document.getElementById('checkmark-scale-animation')) {
      const style = document.createElement('style');
      style.id = 'checkmark-scale-animation';
      style.textContent = `
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .checkmark-animated {
          animation: scaleIn 0.5s ease-out;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="packages-page">
      <section className="packages-hero-section packages-success-section">
        <div className="packages-hero-container">
          <div className="packages-hero-content">
            <div className="packages-booking-success">
              <div className="packages-success-icon">
                <div className="packages-lottie-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <CheckCircle 
                    size={120} 
                    color="#10b981" 
                    strokeWidth={2}
                    className="checkmark-animated"
                  />
                </div>
              </div>
              <h1 className="packages-success-title">Booking Successful!</h1>
              <p className="packages-success-message">
                Your booking has been confirmed. We've sent a confirmation email with all the details.
              </p>
              {paymentId && (
                <div className="packages-success-details">
                  <div className="packages-success-detail-item">
                    <span className="packages-success-detail-label">Payment ID:</span>
                    <span className="packages-success-detail-value">{paymentId}</span>
                  </div>
                  {orderId && (
                    <div className="packages-success-detail-item">
                      <span className="packages-success-detail-label">Order ID:</span>
                      <span className="packages-success-detail-value">{orderId}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="packages-success-buttons">
                <button 
                  className="packages-my-booking-btn"
                  onClick={() => router.push('/my-bookings')}
                >
                  My Bookings
                </button>
                <button 
                  className="packages-continue-btn"
                  onClick={() => router.push('/packages')}
                >
                  Explore More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

