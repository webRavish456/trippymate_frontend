'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Grid } from "@mui/material";
import { API_BASE_URL } from '@/lib/config';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id;

  const [booking, setBooking] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Static booking data
  const staticBookings = {
    '1': {
      id: '1',
      packageName: 'Manali Adventure Escape',
      destination: 'Manali',
      tripDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '3N/4D',
      guests: 2,
      totalAmount: 17998,
      baseAmount: 19998,
      discount: 2000,
      couponCode: 'SUMMER20',
      promoCode: 'TRIPPY2024',
      bookingId: 'BK001234',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      groups: [
        {
          groupId: 'G1',
          members: [
            { name: 'John Doe', age: 28 },
            { name: 'Jane Doe', age: 26 }
          ]
        }
      ],
      contactDetails: {
        name: 'John Doe',
        phone: '+91 9122389911',
        address: '123 Main St, City, State 123456'
      },
      guestDetails: [
        { name: 'John Doe', age: 28, gender: 'Male', address: '123 Main St, City' },
        { name: 'Jane Doe', age: 26, gender: 'Female', address: '123 Main St, City' }
      ],
      packageDetails: {
        overview: 'Experience the breathtaking beauty of Manali with this amazing adventure package.',
        highlights: [
          'Trekking through scenic mountain trails',
          'Camping under the stars',
          'Visit to ancient temples',
          'Adventure activities'
        ],
        inclusions: [
          'Accommodation in 3-star hotels',
          'All meals as per itinerary',
          'Transportation',
          'Trekking guide'
        ]
      }
    },
    '2': {
      id: '2',
      packageName: 'Goa Beach Paradise',
      destination: 'Goa',
      tripDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '4N/5D',
      guests: 3,
      totalAmount: 26997,
      baseAmount: 29997,
      discount: 3000,
      couponCode: 'BEACH15',
      promoCode: null,
      bookingId: 'BK001235',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      groups: [
        {
          groupId: 'G1',
          members: [
            { name: 'John Doe', age: 28 },
            { name: 'Jane Doe', age: 26 },
            { name: 'Bob Smith', age: 30 }
          ]
        }
      ],
      contactDetails: {
        name: 'John Doe',
        phone: '+91 9122389911',
        address: '123 Main St, City, State 123456'
      },
      guestDetails: [
        { name: 'John Doe', age: 28, gender: 'Male', address: '123 Main St, City, State 123456', aadharCard: '9122389911' },
        { name: 'Jane Doe', age: 26, gender: 'Female', address: '123 Main St, City, State 123456', aadharCard: '9122389912' },
        { name: 'Bob Smith', age: 30, gender: 'Male', address: '123 Main St, City, State 123456', aadharCard: '9122389913' }
      ],
      packageDetails: {
        overview: 'Relax and unwind on the beautiful beaches of Goa.',
        highlights: [
          'Beach activities',
          'Water sports',
          'Nightlife',
          'Local cuisine'
        ],
        inclusions: [
          'Beachfront resort',
          'Breakfast included',
          'Airport transfers',
          'Beach activities'
        ]
      }
    },
    '3': {
      id: '3',
      packageName: 'Kerala Backwaters',
      destination: 'Kerala',
      tripDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '5N/6D',
      guests: 2,
      totalAmount: 24998,
      baseAmount: 24998,
      discount: 0,
      couponCode: null,
      promoCode: null,
      bookingId: 'BK001200',
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1580619305218-8423a3d6d3f3?w=800&h=600&fit=crop',
      groups: [
        {
          groupId: 'G1',
          members: [
            { name: 'John Doe', age: 28 },
            { name: 'Jane Doe', age: 26 }
          ]
        }
      ],
      contactDetails: {
        name: 'John Doe',
        phone: '+91 9122389911',
        address: '123 Main St, City, State 123456'
      },
      guestDetails: [
        { name: 'John Doe', age: 28, gender: 'Male', address: '123 Main St, City' },
        { name: 'Jane Doe', age: 26, gender: 'Female', address: '123 Main St, City' }
      ],
      packageDetails: {
        overview: 'Experience the serene backwaters of Kerala.',
        highlights: [
          'Houseboat cruise',
          'Spice plantation visit',
          'Ayurvedic spa',
          'Traditional cuisine'
        ],
        inclusions: [
          'Houseboat accommodation',
          'All meals',
          'Local guide',
          'Spa session'
        ]
      },
      hasFeedback: false
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
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
        // Fallback to static data if available
        if (staticBookings[bookingId]) {
          setBooking(staticBookings[bookingId]);
        }
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      // Fallback to static data if available
      if (staticBookings[bookingId]) {
        setBooking(staticBookings[bookingId]);
      }
    }
  };

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
                        {booking.destination}
                      </span>
                      <span className="packages-trip-option">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" fill="currentColor"/>
                        </svg>
                        {booking.duration}
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
                            <span className="packages-member-age">{member.age} years</span>
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
                    <span className={`packages-payment-status packages-payment-status-${booking.status === 'completed' ? 'paid' : 'pending'}`}>
                      {booking.status === 'completed' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="packages-payment-row">
                    <span className="packages-payment-label">Booking Date:</span>
                    <span className="packages-payment-value">
                      {new Date(booking.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}, {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
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
                          {new Date(booking.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}, {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
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
                      onClick={() => router.push('/packages')}
                    >
                      View Packages
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

