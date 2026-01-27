'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Grid, Skeleton } from "@mui/material";
import { API_BASE_URL } from '@/lib/config';

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Feedback Page Skeleton Component
  const FeedbackSkeleton = () => (
    <form className="packages-feedback-form-new">
      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Booking Info Skeleton */}
          <div className="packages-detail-card">
            <div className="packages-feedback-booking-info">
              <div className="packages-feedback-booking-image">
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
              </div>
              <div className="packages-feedback-booking-details">
                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                <Skeleton variant="text" width="70%" height={20} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
              </div>
            </div>
          </div>

          {/* Rating Sections Skeleton */}
          <div className="packages-detail-card">
            <div className="packages-feedback-ratings-grid">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="packages-feedback-rating-item">
                  <div className="packages-feedback-rating-header">
                    <Skeleton variant="text" width={120} height={24} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Skeleton key={star} variant="circular" width={32} height={32} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Written Review Skeleton */}
          <div className="packages-detail-card">
            <Skeleton variant="text" width="40%" height={28} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
            <Skeleton variant="text" width="30%" height={20} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
            <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} animation="wave" />
          </div>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <div className="packages-booking-card">
            <Skeleton variant="text" width="50%" height={28} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
            <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: '0.5rem', mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
            <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} animation="wave" />
          </div>
        </Grid>
      </Grid>
    </form>
  );

  useEffect(() => {
    if (bookingId) {
      fetchBookingAndFeedback();
    }
  }, [bookingId]);

  const fetchBookingAndFeedback = async () => {
    try {
      setLoading(true);
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
        setBooking(null);
      }
    } catch (error) {
      console.error('Error fetching booking/feedback:', error);
      setBooking(null);
    } finally {
      setLoading(false);
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
            <FeedbackSkeleton />
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

