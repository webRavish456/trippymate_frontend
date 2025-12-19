'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Grid } from "@mui/material";
import { API_BASE_URL } from '@/lib/config';

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id;

  const [booking, setBooking] = useState(null);
  const [feedback, setFeedback] = useState({
    captainRating: 0,
    servicesRating: 0,
    accommodationRating: 0,
    overallExperience: 0,
    comment: '',
    photos: []
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Static booking data (same as booking details page)
  const staticBookings = {
    '1': {
      id: '1',
      packageName: 'Manali Adventure Escape',
      destination: 'Manali',
      tripDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '3N/4D',
      guests: 2,
      totalAmount: 17998,
      bookingId: 'BK001234',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
    },
    '2': {
      id: '2',
      packageName: 'Goa Beach Paradise',
      destination: 'Goa',
      tripDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '4N/5D',
      guests: 3,
      totalAmount: 26997,
      bookingId: 'BK001235',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop'
    },
    '3': {
      id: '3',
      packageName: 'Kerala Backwaters',
      destination: 'Kerala',
      tripDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '5N/6D',
      guests: 2,
      totalAmount: 24998,
      bookingId: 'BK001200',
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1580619305218-8423a3d6d3f3?w=800&h=600&fit=crop'
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBookingAndFeedback();
    }
  }, [bookingId]);

  const fetchBookingAndFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Fetch booking details
      const bookingResponse = await fetch(`${API_BASE_URL}/api/user/booking/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const bookingResult = await bookingResponse.json();

      if (bookingResult.status && bookingResult.data) {
        setBooking(bookingResult.data);

        // Fetch existing feedback if any
        const feedbackResponse = await fetch(`${API_BASE_URL}/api/user/booking/${bookingId}/feedback`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const feedbackResult = await feedbackResponse.json();

        if (feedbackResult.status && feedbackResult.data) {
          setFeedback({
            captainRating: feedbackResult.data.captainRating || 0,
            servicesRating: feedbackResult.data.servicesRating || 0,
            accommodationRating: feedbackResult.data.accommodationRating || 0,
            overallExperience: feedbackResult.data.overallExperience || 0,
            comment: feedbackResult.data.comment || '',
            photos: feedbackResult.data.photos || []
          });
        }
      } else {
        // Fallback to static data
        if (staticBookings[bookingId]) {
          setBooking(staticBookings[bookingId]);
        }
      }
    } catch (error) {
      console.error('Error fetching booking/feedback:', error);
      // Fallback to static data
      if (staticBookings[bookingId]) {
        setBooking(staticBookings[bookingId]);
      }
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => URL.createObjectURL(file));
    setFeedback({...feedback, photos: [...feedback.photos, ...newPhotos]});
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = feedback.photos.filter((_, i) => i !== index);
    setFeedback({...feedback, photos: newPhotos});
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!feedback.overallExperience || feedback.overallExperience < 1) {
      showToast('Please provide an overall experience rating', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to submit feedback', 'error');
        return;
      }

      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('captainRating', feedback.captainRating.toString());
      formData.append('servicesRating', feedback.servicesRating.toString());
      formData.append('accommodationRating', feedback.accommodationRating.toString());
      formData.append('overallExperience', feedback.overallExperience.toString());
      formData.append('comment', feedback.comment || '');

      // Add photos if any
      if (feedback.photos && feedback.photos.length > 0) {
        feedback.photos.forEach((photo) => {
          if (photo instanceof File) {
            formData.append('photos', photo);
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/user/booking/${bookingId}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.status) {
        showToast('Thank you for your feedback!', 'success');
        setTimeout(() => {
          router.push(`/my-bookings/${bookingId}`);
        }, 2000);
      } else {
        showToast(result.message || 'Failed to submit feedback. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('Failed to submit feedback. Please try again.', 'error');
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

      {/* Feedback Header Section */}
      <div className="profile-page-header">
        <div className="profile-page-header-container">
          <h1 className="profile-page-title">Share Your Feedback</h1>
          <p className="profile-page-subtitle">Help us improve by sharing your experience</p>
        </div>
      </div>

      <section className="packages-details-section">
        <div className="packages-details-container">
          <form className="packages-feedback-form-new" onSubmit={handleFeedbackSubmit}>
            <Grid container spacing={4}>
              {/* Left Column - md={8} */}
              <Grid size={{ xs: 12, md: 8 }}>
                {/* Booking Info */}
                <div className="packages-detail-card">
                  <div className="packages-feedback-booking-info">
                    <div className="packages-feedback-booking-image">
                      <img src={booking.image} alt={booking.packageName} />
                    </div>
                    <div className="packages-feedback-booking-details">
                      <div className="packages-feedback-booking-id">Booking ID: {booking.bookingId}</div>
                      <div className="packages-feedback-booking-name">{booking.packageName}</div>
                      <div className="packages-feedback-booking-date">
                        {new Date(booking.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} {new Date(booking.tripDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Sections */}
                <div className="packages-detail-card">
                  <div className="packages-feedback-ratings-grid">
                    <div className="packages-feedback-rating-item">
                      <div className="packages-feedback-rating-header">
                        <span className="packages-feedback-rating-label">Captain</span>
                        {feedback.captainRating > 0 && (
                          <button
                            type="button"
                            className="packages-feedback-rating-remove"
                            onClick={() => setFeedback({...feedback, captainRating: 0})}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="packages-feedback-stars-new">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`packages-feedback-star-new ${feedback.captainRating >= star ? 'filled' : ''}`}
                            onClick={() => setFeedback({...feedback, captainRating: star})}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill={feedback.captainRating >= star ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="packages-feedback-rating-item">
                      <div className="packages-feedback-rating-header">
                        <span className="packages-feedback-rating-label">Services</span>
                        {feedback.servicesRating > 0 && (
                          <button
                            type="button"
                            className="packages-feedback-rating-remove"
                            onClick={() => setFeedback({...feedback, servicesRating: 0})}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="packages-feedback-stars-new">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`packages-feedback-star-new ${feedback.servicesRating >= star ? 'filled' : ''}`}
                            onClick={() => setFeedback({...feedback, servicesRating: star})}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill={feedback.servicesRating >= star ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="packages-feedback-rating-item">
                      <div className="packages-feedback-rating-header">
                        <span className="packages-feedback-rating-label">Accommodation</span>
                        {feedback.accommodationRating > 0 && (
                          <button
                            type="button"
                            className="packages-feedback-rating-remove"
                            onClick={() => setFeedback({...feedback, accommodationRating: 0})}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="packages-feedback-stars-new">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`packages-feedback-star-new ${feedback.accommodationRating >= star ? 'filled' : ''}`}
                            onClick={() => setFeedback({...feedback, accommodationRating: star})}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill={feedback.accommodationRating >= star ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="packages-feedback-rating-item">
                      <div className="packages-feedback-rating-header">
                        <span className="packages-feedback-rating-label">Overall Experience</span>
                        {feedback.overallExperience > 0 && (
                          <button
                            type="button"
                            className="packages-feedback-rating-remove"
                            onClick={() => setFeedback({...feedback, overallExperience: 0})}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="packages-feedback-stars-new">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`packages-feedback-star-new ${feedback.overallExperience >= star ? 'filled' : ''}`}
                            onClick={() => setFeedback({...feedback, overallExperience: star})}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill={feedback.overallExperience >= star ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Written Review */}
                <div className="packages-detail-card">
                  <h3 className="packages-feedback-written-title">Add a Written Reviews</h3>
                  <p className="packages-feedback-written-subtitle">Write your Reviews</p>
                  <textarea
                    className="packages-feedback-textarea-new"
                    placeholder="Satisfied with the services .."
                    value={feedback.comment}
                    onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                    rows={5}
                  />
                </div>
              </Grid>

              {/* Right Column - md={4} */}
              <Grid size={{ xs: 12, md: 4 }}>
                {/* Photo Upload */}
                <div className="packages-booking-card">
                  <h3 className="packages-feedback-photo-title">Add a Photo</h3>
                  <p className="packages-feedback-photo-subtitle">Add photo of the services</p>
                  <div className="packages-feedback-photo-upload-area">
                    {feedback.photos.length > 0 && (
                      <div className="packages-feedback-photos-grid">
                        {feedback.photos.map((photo, index) => {
                          const photoUrl = photo instanceof File ? URL.createObjectURL(photo) : (photo.path || photo);
                          return (
                            <div key={index} className="packages-feedback-photo-item">
                              <img src={photoUrl} alt={`Upload ${index + 1}`} />
                              <button
                                type="button"
                                className="packages-feedback-photo-remove"
                                onClick={() => handleRemovePhoto(index)}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <label className="packages-feedback-photo-upload-btn">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                      />
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Upload Photos</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="packages-feedback-submit-section">
                    <button
                      type="submit"
                      className="packages-feedback-submit-btn-new"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </Grid>
            </Grid>
          </form>
        </div>
      </section>
    </div>
  );
}

