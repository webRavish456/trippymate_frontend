'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Grid, Skeleton } from '@mui/material';

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
  const [unavailableDatesError, setUnavailableDatesError] = useState(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const waitForRazorpay = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        const checkInterval = setInterval(() => {
          if (typeof window !== 'undefined' && window.Razorpay) {
            clearInterval(checkInterval);
            resolve(window.Razorpay);
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(null);
        }, 10000);
      }
    });
  };

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

      // Get userId from token if available
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to proceed with booking');
        router.push('/auth/login');
        setProcessing(false);
        return;
      }

      let userId = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id || payload.userId || payload._id;
      } catch (e) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userId = userData._id || userData.id;
      }

      if (!userId) {
        alert('User information not found. Please login again.');
        router.push('/auth/login');
        setProcessing(false);
        return;
      }

      const startDate = new Date(bookingData.startDate);
      const endDate = new Date(bookingData.endDate);
      const numberOfDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      const finalAmount = calculateFinalAmount();

      // Create Razorpay order
      const orderResponse = await fetch(`${API_BASE_URL}/api/payment/captain/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          captainId: bookingData.captainId,
          userId: userId,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          amount: finalAmount,
          couponCode: couponApplied ? couponCode : null,
          promoCode: promoApplied ? promoCode : null
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.status) {
        setUnavailableDatesError({
          message: orderData.message || 'Failed to create payment order',
          unavailableDates: []
        });
        setProcessing(false);
        return;
      }

      // Initialize Razorpay
      const Razorpay = await waitForRazorpay();
      if (!Razorpay) {
        alert('Payment gateway not available. Please refresh the page.');
        setProcessing(false);
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      const options = {
        key: orderData.data.keyId,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        order_id: orderData.data.orderId,
        name: 'Trippy Mates',
        description: `Booking for Captain ${captain.name}`,
        prefill: {
          name: bookingData.customerName,
          contact: bookingData.customerPhone,
          email: bookingData.customerEmail || userData.email || ''
        },
        theme: {
          color: '#1D4ED8'
        },
        handler: async function (response) {
          try {
            // Verify payment and create booking
            const verifyResponse = await fetch(`${API_BASE_URL}/api/payment/captain/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                captainId: bookingData.captainId,
                userId: userId,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                destination: bookingData.destination,
                customerName: bookingData.customerName,
                customerEmail: bookingData.customerEmail,
                customerPhone: bookingData.customerPhone,
                numberOfDays: numberOfDays,
                specialRequirements: bookingData.specialRequirements,
                amount: finalAmount,
                promoCode: promoApplied ? promoCode : null,
                couponCode: couponApplied ? couponCode : null
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.status) {
              // Store booking reference
              if (verifyData.data?.booking?.bookingReference) {
                sessionStorage.setItem('captainBookingReference', verifyData.data.booking.bookingReference);
              }
              
              // Redirect to success page
              router.push(`/trippy-mates/${captainId}/payment/success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`);
            } else {
              alert(verifyData.message || 'Payment verification failed');
              setProcessing(false);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Error verifying payment. Please contact support.');
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setProcessing(false);
      });

      razorpayInstance.open();
    } catch (error) {
      console.error('Error processing payment:', error);
      setUnavailableDatesError({
        message: 'An error occurred. Please try again.',
        unavailableDates: []
      });
      setProcessing(false);
    }
  };

  if (loading || !bookingData || !captain) {
    return (
      <div className="trippy-mates-page">
        {/* Banner Skeleton */}
        <section className="trippy-mates-payment-banner">
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: '#e2e8f0',
            }}
            animation="wave"
          />
        </section>

        {/* Content Skeleton */}
        <section className="trippy-mates-payment-section">
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              {/* Left Column Skeleton - md-8 */}
              <Grid size={{xs: 12, md: 8}}>
                {/* Captain Card Skeleton */}
                <div className="trippy-mates-payment-captain-card">
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Skeleton
                      variant="circular"
                      width={100}
                      height={100}
                      sx={{ bgcolor: '#e2e8f0' }}
                      animation="wave"
                    />
                    <div style={{ flex: 1 }}>
                      <Skeleton variant="text" width="50%" height={32} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                      <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                      <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                    </div>
                  </div>
                </div>

                {/* Booking Details Card Skeleton */}
                <div className="trippy-mates-payment-details-card">
                  <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {[...new Array(6)].map((_, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                        <div style={{ flex: 1 }}>
                          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5, bgcolor: '#e2e8f0' }} animation="wave" />
                          <Skeleton variant="text" width="80%" height={16} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Grid>

              {/* Right Column Skeleton - md-4 */}
              <Grid size={{xs: 12, md: 4}}>
                <div className="trippy-mates-payment-summary-card">
                  <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
                  
                  {/* Promo Code Skeleton */}
                  <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                  <div style={{ display: 'flex', gap: '0.5rem', mb: 2 }}>
                    <Skeleton variant="rectangular" width="70%" height={40} sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="rectangular" width="30%" height={40} sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} animation="wave" />
                  </div>

                  {/* Coupon Code Skeleton */}
                  <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                  <div style={{ display: 'flex', gap: '0.5rem', mb: 3 }}>
                    <Skeleton variant="rectangular" width="70%" height={40} sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="rectangular" width="30%" height={40} sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} animation="wave" />
                  </div>

                  {/* Price Summary Skeleton */}
                  <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                  <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                  <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
                  
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={48}
                    sx={{
                      borderRadius: '0.75rem',
                      bgcolor: '#e2e8f0',
                    }}
                    animation="wave"
                  />
                </div>
              </Grid>
            </Grid>
          </Container>
        </section>
      </div>
    );
  }

  const finalAmount = calculateFinalAmount();
  const baseAmount = bookingData.price || 0;

  return (
    <div className="trippy-mates-page">
      {/* Banner Section with Static Data */}
      <section className="trippy-mates-payment-banner">
        <div 
          className="trippy-mates-payment-banner-bg"
          style={{backgroundImage: `url(${captain.backgroundImage})`}}
        >
          <div className="trippy-mates-payment-banner-overlay"></div>
        </div>
        <div className="trippy-mates-payment-banner-content">
          <h1 className="trippy-mates-payment-banner-title">COMPLETE YOUR BOOKING</h1>
          <p className="trippy-mates-payment-banner-subtitle">Secure . Fast . Reliable</p>
          <p className="trippy-mates-payment-banner-description">
            Review your booking details and proceed to secure payment. Your journey with your local captain is just one step away.
          </p>
        </div>
      </section>

      <section className="trippy-mates-payment-section">
        <div className="trippy-mates-payment-container">
            {/* Unavailable Dates Error Message */}
            {unavailableDatesError && (
              <div className="trippy-mates-payment-error-banner" style={{
                backgroundColor: '#fef2f2',
                border: '2px solid #dc2626',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#dc2626"/>
                  </svg>
                  <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1.125rem', fontWeight: '600' }}>
                    {unavailableDatesError.message}
                  </h3>
                </div>
                {unavailableDatesError.unavailableDates && unavailableDatesError.unavailableDates.length > 0 && (
                  <div>
                    <p style={{ margin: '0.5rem 0', color: '#7f1d1d', fontWeight: '500' }}>
                      Unavailable Dates:
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '0.5rem',
                      marginTop: '0.5rem'
                    }}>
                      {unavailableDatesError.unavailableDates.map((date, idx) => (
                        <span 
                          key={idx}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            border: '1px solid #fecaca'
                          }}
                        >
                          {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    setUnavailableDatesError(null);
                    router.push(`/trippy-mates/${captainId}`);
                  }}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                    marginTop: '0.5rem'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                >
                  Go Back to Change Dates
                </button>
              </div>
            )}

            <Grid container spacing={4}>
              <Grid size={{xs: 12, md: 8}}>
                {/* Captain Info Card */}
                <div className="trippy-mates-payment-captain-card">
                  <div className="trippy-mates-payment-captain-image-wrapper">
                    <div className="trippy-mates-payment-captain-image">
                      <img src={captain.image} alt={captain.name} />
                    </div>
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
  <path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm12 7H5v10h14V9zM8 11h3v3H8v-3z" fill="currentColor"/>
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
                  <path d="M7 5h10v2H13.5c.9.6 1.5 1.6 1.7 3H17v2h-1.8c-.3 2.5-2.2 4-4.9 4H9.5l4.5 5H11l-5-5v-2h4.1c1.6 0 2.6-.8 2.9-2H7v-2h5.8c-.4-1.3-1.5-2-3.1-2H7V5z" fill="currentColor"/>
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

