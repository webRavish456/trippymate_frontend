'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function CaptainBookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const captainId = params.id;
  
  const [paymentId, setPaymentId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [bookingReference, setBookingReference] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setPaymentId(urlParams.get('payment_id') || '');
      setOrderId(urlParams.get('order_id') || '');
      
      // Get booking reference from sessionStorage
      const reference = sessionStorage.getItem('captainBookingReference');
      if (reference) {
        setBookingReference(reference);
      }
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

  // Clear session storage after showing success
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('captainBookingData');
      sessionStorage.removeItem('captainBookingReference');
    };
  }, []);

  return (
    <div className="trippy-mates-page">
      <section className="trippy-mates-success-section">
        <div className="trippy-mates-success-container">
          <div className="trippy-mates-success-content">
            <div className="trippy-mates-success-icon checkmark-animated">
              <CheckCircle size={80} color="#10b981" />
            </div>
            
            <h1 className="trippy-mates-success-title">Captain Booked Successfully!</h1>
            
            <p className="trippy-mates-success-message">
              Your booking has been confirmed. We've sent a confirmation email to your registered email address.
            </p>

            <div className="trippy-mates-success-details">
              {bookingReference && (
                <div className="trippy-mates-success-detail-item">
                  <strong>Booking Reference:</strong>
                  <span>{bookingReference}</span>
                </div>
              )}
              {orderId && (
                <div className="trippy-mates-success-detail-item">
                  <strong>Order ID:</strong>
                  <span>{orderId}</span>
                </div>
              )}
              {paymentId && (
                <div className="trippy-mates-success-detail-item">
                  <strong>Payment ID:</strong>
                  <span>{paymentId}</span>
                </div>
              )}
            </div>

            <div className="trippy-mates-success-actions">
              <button 
                className="trippy-mates-success-btn-primary"
                onClick={() => router.push('/my-bookings')}
              >
                View My Bookings
              </button>
              <button 
                className="trippy-mates-success-btn-secondary"
                onClick={() => router.push('/trippy-mates')}
              >
                Browse More Captains
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

