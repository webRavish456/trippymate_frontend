'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Grid } from '@mui/material';

import { API_BASE_URL } from '@/lib/config';

export default function CaptainProfilePage() {
  const params = useParams();
  const router = useRouter();
  const captainId = params.id;
  
  const [captain, setCaptain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    specialRequirements: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchCaptainDetails();
  }, [captainId]);

  const fetchCaptainDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/user/captain/${captainId}`);
      const data = await response.json();
      
      if (data.status && data.data) {
        setCaptain(data.data);
        
        // Fetch availability
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 30);
        
        const availResponse = await fetch(
          `${API_BASE_URL}/api/user/captain/${captainId}/availability?startDate=${today.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
        );
        const availData = await availResponse.json();
        
        if (availData.status && availData.data) {
          setUnavailableDates(availData.data.unavailableDates || []);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch captain details');
      }
    } catch (err) {
      console.error('Error fetching captain details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!captain) return;

    try {
      setBookingLoading(true);
      
      const startDate = new Date(bookingForm.startDate);
      const endDate = new Date(bookingForm.endDate);
      const numberOfDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // Store booking data in sessionStorage and navigate to payment
      const bookingData = {
        captainId: captain.id,
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
        destination: bookingForm.destination,
        customerName: bookingForm.customerName,
        customerEmail: bookingForm.customerEmail,
        customerPhone: bookingForm.customerPhone,
        numberOfDays: numberOfDays,
        specialRequirements: bookingForm.specialRequirements,
        price: captain.price * numberOfDays
      };
      
      sessionStorage.setItem('captainBookingData', JSON.stringify(bookingData));
      router.push(`/trippy-mates/${captainId}/payment`);
    } catch (error) {
      console.error('Error preparing booking:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="trippy-mates-page">
        <div className="text-center py-20">
          <p className="text-gray-600">Loading captain details...</p>
        </div>
      </div>
    );
  }

  if (error || !captain) {
    return (
      <div className="trippy-mates-page">
        <div className="text-center py-20">
          <p className="text-red-600">Error: {error || 'Captain not found'}</p>
          <button 
            onClick={() => router.push('/trippy-mates')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Captains
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trippy-mates-page">
      {/* Hero Section with Captain Image */}
      <section className="trippy-mates-captain-profile-hero">
        <div 
          className="trippy-mates-captain-profile-hero-bg"
          style={{backgroundImage: `url(${captain.backgroundImage})`}}
        >
          <div className="trippy-mates-captain-profile-hero-overlay"></div>
        </div>
        <div className="trippy-mates-container">
          <button 
            onClick={() => router.push('/trippy-mates')}
            className="trippy-mates-back-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <div className="trippy-mates-captain-profile-header">
            <div className="trippy-mates-captain-profile-image-large">
              <img src={captain.image} alt={captain.name} />
              {captain.verified && (
                <div className="trippy-mates-verified-check-large">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="trippy-mates-captain-profile-info">
              <div className="trippy-mates-captain-profile-badge-rating">
                {captain.badge && (
                  <span className={`trippy-mates-badge trippy-mates-badge-${captain.badgeColor}`}>
                    {captain.badge}
                  </span>
                )}
                <div className="trippy-mates-captain-rating-large">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>{captain.rating}</span>
                </div>
              </div>
              <h1 className="trippy-mates-captain-profile-name">{captain.name}</h1>
              <div className="trippy-mates-captain-profile-location">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
                <span>{captain.location}</span>
              </div>
              <div className="trippy-mates-captain-profile-languages">
                <strong>Languages:</strong> {captain.languages?.join(', ') || 'N/A'}
              </div>
              <div className="trippy-mates-captain-profile-price-large">
                Starting at <span className="trippy-mates-price-amount">₹{captain.price}/day</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="trippy-mates-captain-profile-details">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <div className="trippy-mates-captain-profile-content">
                <div className="trippy-mates-profile-section">
                  <h2 className="trippy-mates-profile-section-title">About</h2>
                  <p className="trippy-mates-profile-section-text">
                    {captain.bio || captain.description || 'Experienced local guide with deep knowledge of the region. Passionate about sharing authentic experiences and hidden gems with travelers.'}
                  </p>
                </div>

                <div className="trippy-mates-profile-section">
                  <h2 className="trippy-mates-profile-section-title">Expertise</h2>
                  <div className="trippy-mates-expertise-tags-large">
                    {captain.expertise?.map((exp, idx) => (
                      <span key={idx} className="trippy-mates-expertise-tag-large">{exp}</span>
                    ))}
                  </div>
                </div>

                {captain.specializations && captain.specializations.length > 0 && (
                  <div className="trippy-mates-profile-section">
                    <h2 className="trippy-mates-profile-section-title">Specializations</h2>
                    <ul className="trippy-mates-specializations-list">
                      {captain.specializations.map((spec, idx) => (
                        <li key={idx}>{spec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {unavailableDates.length > 0 && (
                  <div className="trippy-mates-profile-section">
                    <h2 className="trippy-mates-profile-section-title">Unavailable Dates</h2>
                    <div className="trippy-mates-unavailable-dates">
                      {unavailableDates.map((date, idx) => (
                        <span key={idx} className="trippy-mates-unavailable-date-badge">
                          {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Grid>

            <Grid item xs={12} md={4}>
              <div className="trippy-mates-captain-booking-card">
                <h3 className="trippy-mates-booking-card-title">Book This Captain</h3>
                <div className="trippy-mates-booking-card-price">
                  <span className="trippy-mates-price-label">Starting at</span>
                  <span className="trippy-mates-price-value">₹{captain.price}/day</span>
                </div>
                <button 
                  className="trippy-mates-booking-card-btn"
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Now
                </button>
              </div>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="trippy-mates-booking-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="trippy-mates-booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="trippy-mates-booking-modal-header">
              <h2>Book Captain - {captain.name}</h2>
              <button className="trippy-mates-booking-modal-close" onClick={() => setShowBookingModal(false)}>
                ×
              </button>
            </div>
            <form className="trippy-mates-booking-form" onSubmit={handleBookingSubmit}>
              <div className="trippy-mates-booking-form-group">
                <label>Destination / Where to go <span className="required">*</span></label>
                <input
                  type="text"
                  value={bookingForm.destination}
                  onChange={(e) => setBookingForm({ ...bookingForm, destination: e.target.value })}
                  placeholder="e.g., Goa, Manali, Shimla"
                  required
                />
              </div>
              
              <div className="trippy-mates-booking-form-row">
                <div className="trippy-mates-booking-form-group">
                  <label>Start Date <span className="required">*</span></label>
                  <input
                    type="date"
                    value={bookingForm.startDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="trippy-mates-booking-form-group">
                  <label>End Date <span className="required">*</span></label>
                  <input
                    type="date"
                    value={bookingForm.endDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                    min={bookingForm.startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="trippy-mates-booking-form-group">
                <label>Number of Days</label>
                <input
                  type="number"
                  value={bookingForm.startDate && bookingForm.endDate 
                    ? Math.ceil((new Date(bookingForm.endDate) - new Date(bookingForm.startDate)) / (1000 * 60 * 60 * 24)) + 1
                    : ''}
                  readOnly
                  placeholder="Auto-calculated"
                />
              </div>

              <div className="trippy-mates-booking-form-group">
                <label>Your Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={bookingForm.customerName}
                  onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="trippy-mates-booking-form-row">
                <div className="trippy-mates-booking-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={bookingForm.customerEmail}
                    onChange={(e) => setBookingForm({ ...bookingForm, customerEmail: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="trippy-mates-booking-form-group">
                  <label>Phone <span className="required">*</span></label>
                  <input
                    type="tel"
                    value={bookingForm.customerPhone}
                    onChange={(e) => setBookingForm({ ...bookingForm, customerPhone: e.target.value })}
                    placeholder="+91 1234567890"
                    required
                  />
                </div>
              </div>

              <div className="trippy-mates-booking-form-group">
                <label>Special Requirements</label>
                <textarea
                  value={bookingForm.specialRequirements}
                  onChange={(e) => setBookingForm({ ...bookingForm, specialRequirements: e.target.value })}
                  placeholder="Any special requirements or preferences..."
                  rows={3}
                />
              </div>

              <div className="trippy-mates-booking-form-actions">
                <button type="button" className="trippy-mates-booking-cancel-btn" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="trippy-mates-booking-submit-btn" disabled={bookingLoading}>
                  {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

