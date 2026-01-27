'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Grid, Skeleton } from "@mui/material";
import { API_BASE_URL } from '@/lib/config';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Booking Details Skeleton Component
  const BookingDetailsSkeleton = () => (
    <>
      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Trip Details Skeleton */}
          <div className="packages-detail-card">
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
            <div className="packages-trip-details-content">
              <div className="packages-trip-image">
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
              </div>
              <div className="packages-trip-info">
                <Skeleton variant="text" width="70%" height={36} sx={{ mb: 1.5, bgcolor: '#e2e8f0' }} animation="wave" />
                <div className="packages-trip-options" style={{ marginBottom: '1rem' }}>
                  <Skeleton variant="text" width={120} height={24} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                  <Skeleton variant="text" width={100} height={24} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                  <Skeleton variant="text" width={140} height={24} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                </div>
                <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
              </div>
            </div>
          </div>

          {/* Group Details Skeleton */}
          <div className="packages-detail-card">
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
            <div style={{ marginTop: '1rem' }}>
              <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: '0.5rem', mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
              <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} animation="wave" />
            </div>
          </div>

          {/* Payment Information Skeleton */}
          <div className="packages-detail-card">
            <Skeleton variant="text" width="35%" height={32} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Skeleton variant="text" width="60%" height={24} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
              <Skeleton variant="text" width="50%" height={24} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
              <Skeleton variant="text" width="70%" height={24} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
              <Skeleton variant="text" width="40%" height={24} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
            </div>
          </div>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <div className="packages-sticky-sidebar">
            {/* Timeline Skeleton */}
            <div className="packages-booking-card">
              <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[1, 2, 3].map((item) => (
                  <div key={item} style={{ display: 'flex', gap: '1rem' }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                    <div style={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5, bgcolor: '#e2e8f0' }} animation="wave" />
                      <Skeleton variant="text" width="80%" height={16} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Details Skeleton */}
            <div className="packages-booking-card">
              <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <Skeleton variant="text" width="100%" height={24} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                <Skeleton variant="text" width="80%" height={24} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                <Skeleton variant="text" width="90%" height={24} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                <Skeleton variant="text" width="60%" height={32} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
              </div>
              <div className="packages-booking-actions">
                <Skeleton variant="rectangular" width="100%" height={44} sx={{ borderRadius: '0.5rem', mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                <Skeleton variant="rectangular" width="100%" height={44} sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} animation="wave" />
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    </>
  );

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/booking/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.status && result.data) {
        setBooking(result.data);
        if (result.data.status === 'completed' && !result.data.hasFeedback) {
          setShowFeedback(true);
        }
      } else {
        setBooking(null);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="packages-page">
        <div className="profile-page-header">
          <div className="profile-page-header-container">
            <Skeleton variant="text" width="40%" height={48} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
            <Skeleton variant="text" width="60%" height={24} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
          </div>
        </div>
        <section className="packages-details-section">
          <div className="packages-details-container">
            <BookingDetailsSkeleton />
          </div>
        </section>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="packages-page-loading">
        <p>Booking not found</p>
        <button onClick={() => router.push('/my-bookings')}>Back to My Bookings</button>
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
      
      {/* Booking Details Header Section */}
      <div className="profile-page-header">
        <div className="profile-page-header-container">
          <h1 className="profile-page-title">Booking Details</h1>
          <p className="profile-page-subtitle">View and manage your booking information</p>
        </div>
      </div>

      <section className="packages-details-section">
        <div className="packages-details-container">
          <Grid container spacing={4}>
            {/* Left Column */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Trip Details */}
              <div className="packages-detail-card">
                <h2 className="packages-section-title">Trip Details</h2>
                <div className="packages-trip-details-content">
                  <div className="packages-trip-image">
                    <img src={booking.image} alt={booking.packageName} />
                  </div>
                  <div className="packages-trip-info">
                    <h3 className="packages-trip-name">{booking.packageName}</h3>
                    <div className="packages-trip-options">
                      <span className="packages-trip-option">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                        </svg>
                        {booking.isCaptainBooking && (booking.destination === 'Unknown' || booking.destination === 'N/A') ? 'Custom' : booking.destination}
                      </span>
                      <span className="packages-trip-option">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" fill="currentColor"/>
                        </svg>
                        {booking.isCaptainBooking && (booking.duration === 'N/A' || !booking.duration) ? 'Custom' : booking.duration}
                      </span>
                      <span className="packages-trip-option">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="currentColor"/>
                        </svg>
                        {new Date(booking.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="packages-trip-price-per-person">
                      <span className="packages-trip-price-label">Price per person:</span>
                      <span className="packages-trip-price-value">₹{Math.round(booking.totalAmount / booking.guests).toLocaleString()}</span>
                    </div>
                    {booking.contactDetails && (
                      <div className="packages-trip-contact-info">
                        <span className="packages-trip-contact-label">Contact:</span>
                        <span className="packages-trip-contact-value">{booking.contactDetails.name} | {booking.contactDetails.phone} | {booking.contactDetails.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Group Details */}
              <div className="packages-detail-card">
                <h2 className="packages-section-title">Group Details</h2>
                <div className="packages-group-details">
                  <div className="packages-groups-count">
                    Total Groups: <strong>{booking.groups?.length || 0}</strong>
                  </div>
                  {booking.groups && booking.groups.map((group, groupIndex) => (
                    <div key={group.groupId} className="packages-group-item">
                      <div className="packages-group-header">
                        <span className="packages-group-label">Group {groupIndex + 1}</span>
                        <span className="packages-group-members-count">{group.members.length} {group.members.length === 1 ? 'Member' : 'Members'}</span>
                      </div>
                      <div className="packages-group-members">
                        {group.members.map((member, memberIndex) => (
                          <div key={memberIndex} className="packages-member-item">
                            <span className="packages-member-name">{member.name}</span>
                            <span className="packages-member-age">
                              {member.age === null || member.age === undefined || member.age === 0 ? 'N/A' : `${member.age} years`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div className="packages-detail-card">
                <h2 className="packages-section-title">Payment Information</h2>
                <div className="packages-payment-info">
                  <div className="packages-payment-row">
                    <span className="packages-payment-label">Payment Method:</span>
                    <span className="packages-payment-value">Online Payment (Razorpay)</span>
                  </div>
                  <div className="packages-payment-row">
                    <span className="packages-payment-label">Payment Status:</span>
                    <span className={`packages-payment-status packages-payment-status-${booking.paymentStatus === 'completed' ? 'paid' : 'pending'}`}>
                      {booking.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="packages-payment-row">
                    <span className="packages-payment-label">Booking Date:</span>
                    <span className="packages-payment-value">
                      {new Date(booking.bookingDate || booking.createdAt || booking.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}, {new Date(booking.bookingDate || booking.createdAt || booking.tripDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                    </span>
                  </div>
                  <div className="packages-payment-row">
                    <span className="packages-payment-label">Booking ID:</span>
                    <span className="packages-payment-value">{booking.bookingId}</span>
                  </div>
                </div>
              </div>

              {/* Feedback Section for Completed Trips */}
              {booking.status === 'completed' && showFeedback && (
                <div className="packages-detail-card">
                  <div className="packages-feedback-prompt">
                    <h2 className="packages-feedback-prompt-title">How was your Experience?</h2>
                    <button
                      className="packages-feedback-prompt-link"
                      onClick={() => router.push(`/my-bookings/${booking.id}/feedback`)}
                    >
                      Write a Review for our Service
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </Grid>

            {/* Right Column */}
            <Grid size={{ xs: 12, md: 4 }}>
              <div className="packages-sticky-sidebar">
                {/* Order Timeline */}
                <div className="packages-booking-card">
                  <h2 className="packages-booking-title">Trip Timeline</h2>
                  <div className="packages-timeline">
                    <div className={`packages-timeline-item ${booking.status === 'confirmed' || booking.status === 'completed' ? 'completed' : ''}`}>
                      <div className="packages-timeline-icon">
                        {booking.status === 'confirmed' || booking.status === 'completed' ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#059669"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#9ca3af"/>
                          </svg>
                        )}
                      </div>
                      <div className="packages-timeline-content">
                        <div className="packages-timeline-title">Booking Confirmed</div>
                        <div className="packages-timeline-date">
                          {new Date(booking.bookingDate || booking.createdAt || booking.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}, {new Date(booking.bookingDate || booking.createdAt || booking.tripDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                        </div>
                      </div>
                    </div>
                    <div className={`packages-timeline-item ${booking.status === 'completed' ? 'completed' : ''}`}>
                      <div className="packages-timeline-icon">
                        {booking.status === 'completed' ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#059669"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#9ca3af"/>
                          </svg>
                        )}
                      </div>
                      <div className="packages-timeline-content">
                        <div className="packages-timeline-title">Trip Started</div>
                        <div className="packages-timeline-date">
                          {booking.status === 'completed' 
                            ? new Date(booking.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'Waiting for trip to start'}
                        </div>
                      </div>
                    </div>
                    <div className={`packages-timeline-item ${booking.status === 'completed' ? 'completed' : ''}`}>
                      <div className="packages-timeline-icon">
                        {booking.status === 'completed' ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#059669"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#9ca3af"/>
                          </svg>
                        )}
                      </div>
                      <div className="packages-timeline-content">
                        <div className="packages-timeline-title">Trip Completed</div>
                        <div className="packages-timeline-date">
                          {booking.status === 'completed' 
                            ? new Date(booking.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'Waiting for trip completion'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Details */}
                <div className="packages-booking-card">
                  <h2 className="packages-booking-title">Price Details</h2>
                  <div className="packages-price-details">
                    <div className="packages-price-detail-row">
                      <span className="packages-price-detail-label">{booking.packageName} (Guests: {booking.guests})</span>
                      <span className="packages-price-detail-value">₹{booking.baseAmount?.toLocaleString() || booking.totalAmount.toLocaleString()}</span>
                    </div>
                    {booking.discount > 0 && (
                      <div className="packages-price-detail-row packages-price-detail-discount">
                        <span className="packages-price-detail-label">Discount</span>
                        <span className="packages-price-detail-value">-₹{booking.discount.toLocaleString()}</span>
                      </div>
                    )}
                    {booking.couponCode && (
                      <div className="packages-price-detail-row packages-price-detail-coupon">
                        <span className="packages-price-detail-label">Coupon Code ({booking.couponCode})</span>
                        <span className="packages-price-detail-value">Applied</span>
                      </div>
                    )}
                    {booking.promoCode && (
                      <div className="packages-price-detail-row packages-price-detail-promo">
                        <span className="packages-price-detail-label">Promo Code ({booking.promoCode})</span>
                        <span className="packages-price-detail-value">Applied</span>
                      </div>
                    )}
                    <div className="packages-price-detail-row packages-price-detail-total">
                      <span className="packages-price-detail-label">Total</span>
                      <span className="packages-price-detail-value">₹{booking.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="packages-booking-actions">
                    {booking.status === 'confirmed' && (
                      <button 
                        className="packages-cancel-order-btn"
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this booking?')) {
                            showToast('Booking cancellation request submitted', 'success');
                          }
                        }}
                      >
                        Cancel Booking
                      </button>
                    )}
                    <button 
                      className="packages-continue-shopping-btn"
                      onClick={() => {
                        if (booking.isCaptainBooking && booking.captainId) {
                          router.push(`/trippy-mates/${booking.captainId}`);
                        } else {
                          router.push('/packages');
                        }
                      }}
                    >
                      {booking.isCaptainBooking ? 'View Captain' : 'View Packages'}
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

