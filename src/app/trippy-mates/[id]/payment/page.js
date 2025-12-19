'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Grid } from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

import { API_BASE_URL } from '@/lib/config';

export default function CaptainPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const captainId = params.id;
  
  const [bookingData, setBookingData] = useState(null);
  const [captain, setCaptain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    // Get booking data from sessionStorage
    const storedData = sessionStorage.getItem('captainBookingData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setBookingData(data);
      fetchCaptainDetails(data.captainId);
    } else {
      router.push('/trippy-mates');
    }
  }, [captainId, router]);

  const fetchCaptainDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/captain/${id}`);
      const data = await response.json();
      
      if (data.status && data.data) {
        setCaptain(data.data);
      }
    } catch (err) {
      console.error('Error fetching captain details:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    if (!bookingData) return;

    try {
      const baseAmount = bookingData.price || 0;
      const response = await fetch(`${API_BASE_URL}/api/admin/promo-code/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode.trim(),
          amount: baseAmount,
        }),
      });

      const data = await response.json();
      if (data.status && data.data) {
        setPromoDiscount(data.data.discount);
        setPromoApplied(true);
        setPromoError('');
      } else {
        setPromoError(data.message || 'Invalid promo code');
        setPromoDiscount(0);
        setPromoApplied(false);
      }
    } catch (error) {
      console.error('Error verifying promo code:', error);
      setPromoError('Error verifying promo code');
      setPromoDiscount(0);
      setPromoApplied(false);
    }
  };

  const verifyCouponCode = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (!bookingData) return;

    try {
      const baseAmount = bookingData.price || 0;
      const response = await fetch(`${API_BASE_URL}/api/admin/coupon/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          amount: baseAmount,
        }),
      });

      const data = await response.json();
      if (data.status && data.data) {
        setCouponDiscount(data.data.discount);
        setCouponApplied(true);
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setCouponDiscount(0);
        setCouponApplied(false);
      }
    } catch (error) {
      console.error('Error verifying coupon code:', error);
      setCouponError('Error verifying coupon code');
      setCouponDiscount(0);
      setCouponApplied(false);
    }
  };

  const calculateFinalAmount = () => {
    if (!bookingData) return 0;
    const baseAmount = bookingData.price || 0;
    const totalDiscount = promoDiscount + couponDiscount;
    return Math.max(0, baseAmount - totalDiscount);
  };

  const handlePayment = async () => {
    if (!bookingData || !captain) return;

    try {
      setProcessing(true);

      // Create booking first
      const startDate = new Date(bookingData.startDate);
      const endDate = new Date(bookingData.endDate);
      const numberOfDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      const bookingResponse = await fetch(`${API_BASE_URL}/api/user/captain/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          captainId: bookingData.captainId,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          destination: bookingData.destination,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone,
          numberOfDays: numberOfDays,
          specialRequirements: bookingData.specialRequirements,
          amount: calculateFinalAmount(),
          promoCode: promoApplied ? promoCode : null,
          couponCode: couponApplied ? couponCode : null
        })
      });

      const bookingResult = await bookingResponse.json();

      if (bookingResult.status) {
        // For demo: directly redirect to success page
        // In production, integrate with Razorpay here
        const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mockOrderId = bookingResult.data?.bookingReference || `order_${Date.now()}`;
        
        // Store booking reference
        sessionStorage.setItem('captainBookingReference', bookingResult.data?.bookingReference || '');
        
        // Redirect to success page
        router.push(`/trippy-mates/${captainId}/payment/success?payment_id=${mockPaymentId}&order_id=${mockOrderId}`);
      } else {
        alert(bookingResult.message || 'Failed to process booking');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('An error occurred. Please try again.');
      setProcessing(false);
    }
  };

  if (loading || !bookingData || !captain) {
    return (
      <div className="trippy-mates-page">
        <div className="text-center py-20">
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const finalAmount = calculateFinalAmount();
  const baseAmount = bookingData.price || 0;

  return (
    <div className="trippy-mates-page">
      <section className="trippy-mates-payment-section">
      
          <div className="trippy-mates-payment-container">
            <div className="trippy-mates-payment-header">
              <button 
                onClick={() => router.back()}
                className="trippy-mates-payment-back-icon"
              >
                <KeyboardBackspaceIcon />
              </button>
              <div>
                <h1 className="trippy-mates-payment-title">Complete Your Booking</h1>
                <p className="trippy-mates-payment-subtitle">Review your booking details and proceed to payment</p>
              </div>
            </div>

            <Grid container spacing={4}>
              <Grid size={{xs: 12, md: 8}}>
                {/* Captain Info Card */}
                <div className="trippy-mates-payment-captain-card">
                  <div className="trippy-mates-payment-captain-image">
                    <img src={captain.image} alt={captain.name} />
                    {captain.verified && (
                      <div className="trippy-mates-payment-verified-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="trippy-mates-payment-captain-info">
                    <h2 className="trippy-mates-payment-captain-name">{captain.name}</h2>
                    <div className="trippy-mates-payment-captain-location">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                      </svg>
                      <span>{captain.location}</span>
                    </div>
                    {captain.languages && captain.languages.length > 0 && (
                      <div className="trippy-mates-payment-captain-languages">
                        <strong>Languages:</strong> {captain.languages.join(', ')}
                      </div>
                    )}
                    <div className="trippy-mates-payment-captain-rating">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span>{captain.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Details Card */}
                <div className="trippy-mates-payment-details-card">
                  <h2 className="trippy-mates-payment-card-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-2M9 11V9a2 2 0 012-2h2a2 2 0 012 2v2M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Booking Details
                  </h2>
                  
                  <div className="trippy-mates-payment-info-grid">
                    <div className="trippy-mates-payment-info-item">
                      <div className="trippy-mates-payment-info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="trippy-mates-payment-info-content">
                        <strong>Destination</strong>
                        <span>{bookingData.destination}</span>
                      </div>
                    </div>

                    <div className="trippy-mates-payment-info-item">
                      <div className="trippy-mates-payment-info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="trippy-mates-payment-info-content">
                        <strong>Start Date</strong>
                        <span>{new Date(bookingData.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="trippy-mates-payment-info-item">
                      <div className="trippy-mates-payment-info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="trippy-mates-payment-info-content">
                        <strong>End Date</strong>
                        <span>{new Date(bookingData.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="trippy-mates-payment-info-item">
                      <div className="trippy-mates-payment-info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.24 2.34 2.03 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="trippy-mates-payment-info-content">
                        <strong>Number of Days</strong>
                        <span>{bookingData.numberOfDays} days</span>
                      </div>
                    </div>

                    <div className="trippy-mates-payment-info-item">
                      <div className="trippy-mates-payment-info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M16 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="trippy-mates-payment-info-content">
                        <strong>Customer Name</strong>
                        <span>{bookingData.customerName}</span>
                      </div>
                    </div>

                    <div className="trippy-mates-payment-info-item">
                      <div className="trippy-mates-payment-info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="trippy-mates-payment-info-content">
                        <strong>Email</strong>
                        <span>{bookingData.customerEmail || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="trippy-mates-payment-info-item">
                      <div className="trippy-mates-payment-info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="trippy-mates-payment-info-content">
                        <strong>Phone</strong>
                        <span>{bookingData.customerPhone}</span>
                      </div>
                    </div>

                    {bookingData.specialRequirements && (
                      <div className="trippy-mates-payment-info-item trippy-mates-payment-info-item-full">
                        <div className="trippy-mates-payment-info-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="trippy-mates-payment-info-content">
                          <strong>Special Requirements</strong>
                          <span>{bookingData.specialRequirements}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Grid>

              <Grid size={{xs: 12, md: 4}}>
                <div className="trippy-mates-payment-summary-card">
                  <h3 className="trippy-mates-payment-card-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.24 2.34 2.03 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
                    </svg>
                    Payment Summary
                  </h3>
                  
                  {/* Promo Code Section */}
                  <div className="trippy-mates-payment-summary-promo-section">
                    <h4 className="trippy-mates-payment-summary-promo-title">Promo Code</h4>
                    <div className="trippy-mates-payment-promo-input">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={promoApplied}
                        onKeyPress={(e) => e.key === 'Enter' && verifyPromoCode()}
                      />
                      <button 
                        onClick={verifyPromoCode}
                        disabled={promoApplied || !promoCode.trim()}
                        className="trippy-mates-payment-promo-btn"
                      >
                        {promoApplied ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                    {promoError && <p className="trippy-mates-payment-error">{promoError}</p>}
                    {promoApplied && (
                      <p className="trippy-mates-payment-success">Promo code applied!</p>
                    )}
                  </div>

                  {/* Coupon Code Section */}
                  <div className="trippy-mates-payment-summary-promo-section">
                    <h4 className="trippy-mates-payment-summary-promo-title">Coupon Code</h4>
                    <div className="trippy-mates-payment-promo-input">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={couponApplied}
                        onKeyPress={(e) => e.key === 'Enter' && verifyCouponCode()}
                      />
                      <button 
                        onClick={verifyCouponCode}
                        disabled={couponApplied || !couponCode.trim()}
                        className="trippy-mates-payment-promo-btn"
                      >
                        {couponApplied ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="trippy-mates-payment-error">{couponError}</p>}
                    {couponApplied && (
                      <p className="trippy-mates-payment-success">Coupon code applied!</p>
                    )}
                  </div>

                  <div className="trippy-mates-payment-summary-divider"></div>
                  
                  <div className="trippy-mates-payment-summary-content">
                    <div className="trippy-mates-payment-summary-row">
                      <span>Base Amount:</span>
                      <span>₹{baseAmount.toLocaleString('en-IN')}</span>
                    </div>
                    
                    {promoApplied && (
                      <div className="trippy-mates-payment-summary-row trippy-mates-payment-discount">
                        <span>Promo Discount:</span>
                        <span>-₹{promoDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {couponApplied && (
                      <div className="trippy-mates-payment-summary-row trippy-mates-payment-discount">
                        <span>Coupon Discount:</span>
                        <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    
                    <div className="trippy-mates-payment-summary-divider"></div>
                    
                    <div className="trippy-mates-payment-summary-row trippy-mates-payment-total">
                      <span>Total Amount:</span>
                      <span>₹{finalAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <button 
                      className="trippy-mates-payment-btn"
                      onClick={handlePayment}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <svg className="trippy-mates-payment-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="32">
                              <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                              <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                            </circle>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Pay ₹{finalAmount.toLocaleString('en-IN')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>

      </section>
    </div>
  );
}

