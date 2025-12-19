'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Grid } from "@mui/material";

import { API_BASE_URL } from '@/lib/config';

// Static package data
const staticPackageData = {
  _id: '1',
  title: 'Manali Adventure Escape',
  duration: '3N/4D',
  source: 'Delhi',
  destination: 'Manali',
  category: 'Adventure',
  overview: 'Experience the breathtaking beauty of Manali with this amazing adventure package. Trek through scenic trails, enjoy camping under the stars, and explore the best of Himalayan culture.',
  price: {
    adult: 8999,
    child: 6999
  }
};

export default function BookNowPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id;

  const [packageDetails, setPackageDetails] = useState(staticPackageData);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [guestDetails, setGuestDetails] = useState([
    { name: '', age: '', gender: 'Male', address: '', aadharCard: '', aadharCardFile: null }
  ]);
  const [contactDetails, setContactDetails] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [promoCode, setPromoCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [couponError, setCouponError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [promoId, setPromoId] = useState(null);
  const [couponId, setCouponId] = useState(null);

  useEffect(() => {
    fetchPackageDetails();
    
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Generate available dates (next 30 days)
    const dates = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    setAvailableDates(dates);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [packageId]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/user/getPackagebyId`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: packageId }),
      });

      const data = await response.json();
      if (data.status && data.data) {
        setPackageDetails(data.data);
      } else {
        console.error('Failed to fetch package:', data.message);
        setPackageDetails(staticPackageData);
      }
    } catch (error) {
      console.error('Error fetching package:', error);
      setPackageDetails(staticPackageData);
    } finally {
      setLoading(false);
    }
  };

  const addGuest = () => {
    setGuestDetails([...guestDetails, { name: '', age: '', gender: 'Male', address: '', aadharCard: '', aadharCardFile: null }]);
  };

  const removeGuest = (index) => {
    if (guestDetails.length > 1) {
      setGuestDetails(guestDetails.filter((_, i) => i !== index));
    }
  };

  const updateGuest = (index, field, value) => {
    const updated = [...guestDetails];
    updated[index][field] = value;
    setGuestDetails(updated);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleAadharFileChange = (index, file) => {
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        showToast('Please upload a valid image (JPEG, PNG) or PDF file', 'error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size should be less than 5MB', 'error');
        return;
      }

      const updated = [...guestDetails];
      updated[index].aadharCardFile = file;
      setGuestDetails(updated);
    }
  };

  const verifyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    try {
      const baseAmount = calculateBaseAmount();
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
        setPromoId(data.data.promoId || null);
        setPromoApplied(true);
        setPromoError('');
        showToast('Promo code applied successfully!', 'success');
      } else {
        setPromoError(data.message || 'Invalid promo code');
        setPromoDiscount(0);
        setPromoId(null);
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

    try {
      const baseAmount = calculateBaseAmount();
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
        setCouponId(data.data.couponId || null);
        setCouponApplied(true);
        setCouponError('');
        showToast('Coupon code applied successfully!', 'success');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setCouponDiscount(0);
        setCouponId(null);
        setCouponApplied(false);
      }
    } catch (error) {
      console.error('Error verifying coupon code:', error);
      setCouponError('Error verifying coupon code');
      setCouponDiscount(0);
      setCouponApplied(false);
    }
  };

  const calculateBaseAmount = () => {
    if (!packageDetails?.price) return 0;
    const adultPrice = packageDetails.price.adult || packageDetails.price || 0;
    const childPrice = packageDetails.price.child || 0;
    
    return guestDetails.reduce((total, guest) => {
      const age = parseInt(guest.age) || 0;
      if (age > 18) return total + adultPrice;
      if (age >= 5) return total + childPrice;
      // Age < 5: Free (no infant pricing)
      return total;
    }, 0);
  };

  const calculateFinalAmount = () => {
    const baseAmount = calculateBaseAmount();
    const totalDiscount = promoDiscount + couponDiscount;
    return Math.max(0, baseAmount - totalDiscount);
  };

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
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(null);
        }, 10000);
      }
    });
  };

  const handlePayNow = async () => {
    // Validate slot selection
    if (!selectedDate) {
      showToast('Please select a date', 'error');
      return;
    }

    // Validate contact details
    if (!contactDetails.name.trim() || !contactDetails.phone.trim() || !contactDetails.address.trim()) {
      showToast('Please fill all contact details', 'error');
      return;
    }

    // Validate guest details
    const isValid = guestDetails.every(guest => 
      guest.name.trim() && guest.age && guest.address.trim() && guest.aadharCard.trim() && guest.aadharCardFile
    );

    if (!isValid) {
      showToast('Please fill all guest details including Aadhar card number and upload Aadhar card document', 'error');
      return;
    }

    try {
      setProcessingPayment(true);
      
      // Get user token
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to proceed with booking', 'error');
        router.push('/auth/login');
        return;
      }

      // Get user ID from token or Redux
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData._id || userData.id;

      if (!userId) {
        showToast('User information not found. Please login again.', 'error');
        router.push('/auth/login');
        return;
      }

      // Prepare guest details for backend
      const formattedGuestDetails = guestDetails.map(guest => ({
        guestName: guest.name.trim(),
        guestAge: parseInt(guest.age) || 0,
        guestGender: guest.gender,
        guestAddress: guest.address.trim(),
        tripDate: new Date(selectedDate)
      }));

      // Calculate amounts
      const baseAmount = calculateBaseAmount();
      const finalAmount = calculateFinalAmount();

      // Create Razorpay order
      const orderResponse = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId: packageId,
          userId: userId,
          guestDetails: formattedGuestDetails,
          tripdate: selectedDate,
          couponCode: couponApplied ? couponCode : null,
          promoCode: promoApplied ? promoCode : null
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.status) {
        showToast(orderData.message || 'Failed to create payment order', 'error');
        setProcessingPayment(false);
        return;
      }

      // Initialize Razorpay
      const Razorpay = await waitForRazorpay();
      if (!Razorpay) {
        showToast('Payment gateway not available. Please refresh the page.', 'error');
        setProcessingPayment(false);
        return;
      }

      const options = {
        key: orderData.data.keyId,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        order_id: orderData.data.orderId,
        name: packageDetails.title || 'Trip Booking',
        description: `Booking for ${packageDetails.title || 'Package'}`,
        prefill: {
          name: contactDetails.name,
          contact: contactDetails.phone,
          email: userData.email || ''
        },
        theme: {
          color: '#1D4ED8'
        },
        handler: async function (response) {
          try {
            // Verify payment and create booking
            const verifyResponse = await fetch(`${API_BASE_URL}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                packageId: packageId,
                userId: userId,
                guestDetails: formattedGuestDetails,
                tripdate: selectedDate,
                couponCode: couponApplied ? couponCode : null,
                promoCode: promoApplied ? promoCode : null,
                contactName: contactDetails.name,
                contactPhone: contactDetails.phone,
                contactAddress: contactDetails.address
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.status) {
              showToast('Booking confirmed successfully!', 'success');
              // Redirect to booking details page
              setTimeout(() => {
                router.push(`/my-bookings/${verifyData.data._id}`);
              }, 1500);
            } else {
              showToast(verifyData.message || 'Payment verification failed', 'error');
              setProcessingPayment(false);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            showToast('Error verifying payment. Please contact support.', 'error');
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            showToast('Payment cancelled', 'error');
          }
        }
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        showToast(`Payment failed: ${response.error.description || 'Unknown error'}`, 'error');
        setProcessingPayment(false);
      });

      razorpayInstance.open();
    } catch (error) {
      console.error('Payment error:', error);
      showToast('Error processing payment. Please try again.', 'error');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="packages-page-loading">
        <div className="packages-loading-spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (!packageDetails) {
    return (
      <div className="packages-page-loading">
        <p>Package not found</p>
        <button onClick={() => router.push(`/packages/${packageId}`)}>Back to Package</button>
      </div>
    );
  }

  return (
    <div className="packages-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`packages-toast packages-toast-${toast.type}`}>
          <div className="packages-toast-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {toast.type === 'success' ? (
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
              ) : (
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
              )}
            </svg>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="packages-hero-section">
        <div className="packages-hero-container">
          <div className="packages-hero-content">
            <h1 className="packages-hero-title">Book Now</h1>
            {packageDetails?.title && (
              <h2 className="packages-hero-subtitle" style={{ fontSize: '1.75rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>
                {packageDetails.title}
              </h2>
            )}
            {packageDetails?.overview && (
              <p className="packages-hero-description" style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)', marginTop: '0.5rem', maxWidth: '800px', lineHeight: '1.6' }}>
                {packageDetails.overview}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="packages-details-section">
        <div className="packages-details-container">
          <Grid container spacing={4}>
            {/* Left Column - Slot Selection & Guest Details */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Slot Selection */}
              <div className="packages-detail-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 className="packages-section-title" style={{ margin: 0 }}>Select a Slot</h2>
                  
                  {/* Per Person Pricing - Compact Design */}
                  {packageDetails?.price && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.75rem',
                      alignItems: 'center'
                    }}>
                      {packageDetails.price.adult !== undefined && packageDetails.price.adult > 0 && (
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#1D4ED8',
                          borderRadius: '6px',
                          border: '1px solid #1D4ED8'
                        }}>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>Adult:</span>
                          <span style={{ fontSize: '0.875rem', color: '#ffffff', fontWeight: '700' }}>₹{packageDetails.price.adult.toLocaleString()}</span>
                        </div>
                      )}
                      {packageDetails.price.child !== undefined && packageDetails.price.child > 0 && (
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#1D4ED8',
                          borderRadius: '6px',
                          border: '1px solid #1D4ED8'
                        }}>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>Child:</span>
                          <span style={{ fontSize: '0.875rem', color: '#ffffff', fontWeight: '700' }}>₹{packageDetails.price.child.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Date Selection */}
                <div className="packages-date-selection">
                  <h3 className="packages-slot-subtitle">
                    Select Date - {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="packages-dates-grid">
                    {availableDates.map((date, index) => {
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                      const dayNumber = date.getDate();
                      const isSelected = selectedDate && new Date(selectedDate).toDateString() === date.toDateString();
                      return (
                        <button
                          key={index}
                          className={`packages-date-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedDate(date.toISOString())}
                        >
                          <span className="packages-date-day">{dayName}</span>
                          <span className="packages-date-number">{dayNumber}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Contact Details - Only show after slot selection */}
              {selectedDate && (
                <div className="packages-detail-card">
                  <h2 className="packages-section-title">Contact Details</h2>
                  <div className="packages-guest-details-form">
                    <div className="packages-guest-form-card">
                      <div className="packages-guest-form-grid">
                        <div className="packages-form-group">
                          <label>Full Name *</label>
                          <input
                            type="text"
                            placeholder="Enter your full name"
                            value={contactDetails.name}
                            onChange={(e) => setContactDetails({...contactDetails, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="packages-form-group">
                          <label>Phone Number *</label>
                          <input
                            type="tel"
                            placeholder="Enter your phone number"
                            value={contactDetails.phone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setContactDetails({...contactDetails, phone: value});
                            }}
                            maxLength="10"
                            required
                          />
                        </div>
                        <div className="packages-form-group packages-form-group-full">
                          <label>Address *</label>
                          <textarea
                            placeholder="Enter your complete address"
                            value={contactDetails.address}
                            onChange={(e) => setContactDetails({...contactDetails, address: e.target.value})}
                            rows={3}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Guest Details - Only show after slot selection */}
              {selectedDate && (
                <div className="packages-detail-card">
                  <h2 className="packages-section-title">Guest Details</h2>
                <div className="packages-guest-details-form">
                  {guestDetails.map((guest, index) => (
                    <div key={index} className="packages-guest-form-card">
                      <div className="packages-guest-form-header">
                        <h3>Guest {index + 1}</h3>
                        {guestDetails.length > 1 && (
                          <button
                            type="button"
                            className="packages-remove-guest-btn"
                            onClick={() => removeGuest(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="packages-guest-form-grid">
                        <div className="packages-form-group">
                          <label>Full Name *</label>
                          <input
                            type="text"
                            placeholder="Enter full name"
                            value={guest.name}
                            onChange={(e) => updateGuest(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="packages-form-group">
                          <label>Age *</label>
                          <input
                            type="number"
                            placeholder="Enter age"
                            min="1"
                            max="120"
                            value={guest.age}
                            onChange={(e) => updateGuest(index, 'age', e.target.value)}
                            required
                          />
                        </div>
                        <div className="packages-form-group">
                          <label>Gender *</label>
                          <select
                            value={guest.gender}
                            onChange={(e) => updateGuest(index, 'gender', e.target.value)}
                            required
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="packages-form-group packages-form-group-full">
                          <label>Address *</label>
                          <textarea
                            placeholder="Enter complete address"
                            value={guest.address}
                            onChange={(e) => updateGuest(index, 'address', e.target.value)}
                            rows={3}
                            required
                          />
                        </div>
                        <div className="packages-form-group packages-form-group-full">
                          <label>Aadhar Card Number *</label>
                          <input
                            type="text"
                            placeholder="Enter 12-digit Aadhar card number"
                            value={guest.aadharCard}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                              updateGuest(index, 'aadharCard', value);
                            }}
                            maxLength="12"
                            pattern="[0-9]{12}"
                            required
                          />
                          <small className="packages-form-hint">Enter 12-digit Aadhar card number</small>
                        </div>
                        <div className="packages-form-group packages-form-group-full">
                          <label>Upload Aadhar Card *</label>
                          <div className="packages-file-upload-wrapper">
                            <input
                              type="file"
                              id={`aadhar-upload-${index}`}
                              className="packages-file-input"
                              accept="image/jpeg,image/jpg,image/png,application/pdf"
                              onChange={(e) => handleAadharFileChange(index, e.target.files[0])}
                              required
                            />
                            <label htmlFor={`aadhar-upload-${index}`} className="packages-file-upload-label">
                              {guest.aadharCardFile ? (
                                <span className="packages-file-upload-name">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                                  </svg>
                                  {guest.aadharCardFile.name}
                                </span>
                              ) : (
                                <span className="packages-file-upload-placeholder">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" fill="currentColor"/>
                                  </svg>
                                  Click to upload Aadhar card (JPEG, PNG, PDF - Max 5MB)
                                </span>
                              )}
                            </label>
                            {guest.aadharCardFile && (
                              <button
                                type="button"
                                className="packages-file-remove-btn"
                                onClick={() => {
                                  const updated = [...guestDetails];
                                  updated[index].aadharCardFile = null;
                                  setGuestDetails(updated);
                                  // Reset file input
                                  const fileInput = document.getElementById(`aadhar-upload-${index}`);
                                  if (fileInput) fileInput.value = '';
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <small className="packages-form-hint">Upload Aadhar card image or PDF (Max 5MB)</small>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="packages-add-guest-btn"
                    onClick={addGuest}
                  >
                    + Add Another Guest
                  </button>
                </div>
              </div>
              )}

              {/* Show message if slot not selected */}
              {!selectedDate && (
                <div className="packages-slot-message">
                  <p>Please select a date to continue with guest details.</p>
                </div>
              )}
            </Grid>

            {/* Right Column - Booking Summary */}
            <Grid size={{ xs: 12, md: 4 }}>
              <div className="packages-sticky-sidebar">
                <div className="packages-booking-card">
                  <h2 className="packages-booking-title">Booking Summary</h2>
                  
                  {/* Selected Slot Info */}
                  {selectedDate && (
                    <div className="packages-booking-slot-info">
                      <div className="packages-booking-slot-row">
                        <span className="packages-booking-slot-label">Date:</span>
                        <span className="packages-booking-slot-value">
                          {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="packages-price-section">
                    <div className="packages-price-row">
                      <span className="packages-price-label">Sub Total:</span>
                      <span className="packages-price-value">₹{calculateBaseAmount().toLocaleString()}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="packages-price-row packages-price-discount">
                        <span className="packages-price-label">Promo Discount:</span>
                        <span className="packages-price-value">-₹{promoDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="packages-price-row packages-price-discount">
                        <span className="packages-price-label">Coupon Discount:</span>
                        <span className="packages-price-value">-₹{couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Promo Code */}
                  <div className="packages-promo-section">
                    <label className="packages-promo-label">Promo Code</label>
                    <div className="packages-promo-input-group">
                      <input
                        type="text"
                        className="packages-promo-input"
                        placeholder="Enter promo code"
                        value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value);
                            if (promoApplied) {
                              setPromoApplied(false);
                              setPromoDiscount(0);
                              setPromoId(null);
                            }
                            setPromoError('');
                          }}
                        disabled={promoApplied}
                      />
                      {!promoApplied ? (
                        <button 
                          type="button"
                          className="packages-promo-btn"
                          onClick={verifyPromoCode}
                        >
                          Apply
                        </button>
                      ) : (
                        <button 
                          type="button"
                          className="packages-promo-btn packages-promo-btn-remove"
                        onClick={() => {
                          setPromoCode('');
                          setPromoApplied(false);
                          setPromoDiscount(0);
                          setPromoId(null);
                          setPromoError('');
                        }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {promoError && <p className="packages-promo-error">{promoError}</p>}
                    {promoApplied && promoDiscount > 0 && (
                      <p className="packages-promo-success">Promo code applied! Discount: ₹{promoDiscount.toLocaleString()}</p>
                    )}
                  </div>

                  {/* Coupon Code */}
                  <div className="packages-coupon-section">
                    <label className="packages-coupon-label">Coupon Code</label>
                    <div className="packages-coupon-input-group">
                      <input
                        type="text"
                        className="packages-coupon-input"
                        placeholder="Enter coupon code"
                        value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            if (couponApplied) {
                              setCouponApplied(false);
                              setCouponDiscount(0);
                              setCouponId(null);
                            }
                            setCouponError('');
                          }}
                        disabled={couponApplied}
                      />
                      {!couponApplied ? (
                        <button 
                          type="button"
                          className="packages-coupon-btn"
                          onClick={verifyCouponCode}
                        >
                          Apply
                        </button>
                      ) : (
                        <button 
                          type="button"
                          className="packages-coupon-btn packages-coupon-btn-remove"
                        onClick={() => {
                          setCouponCode('');
                          setCouponApplied(false);
                          setCouponDiscount(0);
                          setCouponId(null);
                          setCouponError('');
                        }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {couponError && <p className="packages-coupon-error">{couponError}</p>}
                    {couponApplied && couponDiscount > 0 && (
                      <p className="packages-coupon-success">Coupon code applied! Discount: ₹{couponDiscount.toLocaleString()}</p>
                    )}
                  </div>

                  {/* Total Amount */}
                  <div className="packages-price-section" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                    <div className="packages-price-row packages-price-total">
                      <span className="packages-price-label">Total Amount:</span>
                      <span className="packages-price-value">₹{calculateFinalAmount().toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="packages-booking-action-buttons" style={{ marginTop: '1.5rem' }}>
                    <button 
                      className="packages-cancel-btn"
                      onClick={() => router.push(`/packages/${packageId}`)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="packages-pay-now-btn"
                      onClick={handlePayNow}
                      disabled={processingPayment || !selectedDate}
                    >
                      {processingPayment ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                </div>
              </div>
            </Grid>
          </Grid>
        </div>
      </section>
    </div>
  );
}

