'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Grid, Skeleton } from '@mui/material';

import { API_BASE_URL } from '@/lib/config';
import { checkDestinationWithinRadius } from '@/lib/captainDestinationRadius';

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
  const [selectedUnavailableDates, setSelectedUnavailableDates] = useState([]);
  const [dateErrors, setDateErrors] = useState({ startDate: '', endDate: '' });
  const [destinationRadiusError, setDestinationRadiusError] = useState('');

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

  // Check if a date is unavailable
  const isDateUnavailable = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    // Check against all unavailable dates
    return unavailableDates.some(unavDate => {
      const unav = new Date(unavDate);
      unav.setHours(0, 0, 0, 0);
      return date.getTime() === unav.getTime();
    });
  };

  // Check captain availability for selected dates
  // Note: This function is used for validation, but we always keep showing all unavailable dates
  const checkCaptainAvailability = async (startDate, endDate) => {
    if (!captainId || !startDate || !endDate) {
      return [];
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/captain/${captainId}/availability?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      
      if (data.status && data.data) {
        // Return the dates but don't update selectedUnavailableDates here
        // We'll keep showing all unavailable dates
        return data.data.unavailableDates || [];
      } else {
        return [];
      }
    } catch (err) {
      console.error('Error checking captain availability:', err);
      return [];
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!captain) return;

    const captainLocation = captain.location || captain.address || '';
    if (captainLocation && bookingForm.destination.trim()) {
      setBookingLoading(true);
      try {
        const radiusResult = await checkDestinationWithinRadius(
          captainLocation,
          bookingForm.destination.trim(),
          150
        );
        if (!radiusResult.within) {
          setDestinationRadiusError(radiusResult.message);
          setBookingLoading(false);
          return;
        }
        setDestinationRadiusError('');
      } catch (err) {
        console.warn('Destination radius check failed:', err);
        setDestinationRadiusError('');
      }
      setBookingLoading(false);
    }

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
        {/* Banner Skeleton */}
        <section className="trippy-mates-captain-profile-banner">
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
        <section className="trippy-mates-captain-profile-details">
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              {/* Profile Data & About - md-8 */}
              <Grid size={{xs: 12, md: 8}}>
                <div className="trippy-mates-captain-profile-content-wrapper">
                  {/* Profile Card Skeleton */}
                  <div className="trippy-mates-captain-profile-card-main">
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{
                        borderRadius: '1rem',
                        bgcolor: '#ffffff',
                        mb: 2,
                      }}
                      animation="wave"
                    />
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '-80px', padding: '2rem' }}>
                      <Skeleton
                        variant="circular"
                        width={120}
                        height={120}
                        sx={{ bgcolor: '#e2e8f0' }}
                        animation="wave"
                      />
                      <div style={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                        <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                        <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                        <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                         <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} animation="wave" />
                         <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} animation="wave" />
                        <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} animation="wave" />
                         </div>
                        <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                      </div>
                    </div>
                  </div>

                  {/* About Section Skeleton */}
                  <div className="trippy-mates-captain-profile-content">
                    <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 3, bgcolor: '#e2e8f0' }} animation="wave" />
                    
                    <Skeleton variant="text" width="25%" height={32} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
                    
                  </div>
                </div>
              </Grid>

              {/* Booking Card Skeleton - md-4 */}
              <Grid size={{xs: 12, md: 4}}>
                <div className="trippy-mates-captain-booking-card">
                  <Skeleton variant="text" width="70%" height={32} sx={{ mb: 2, bgcolor: '#e2e8f0' }} animation="wave" />
                  <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                  <Skeleton variant="text" width="60%" height={40} sx={{ mb: 3, bgcolor: '#e2e8f0' }} animation="wave" />
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
      {/* Banner Section - Only Background */}
      <section className="trippy-mates-captain-profile-banner">
        <div 
          className="trippy-mates-captain-profile-banner-bg"
          style={{backgroundImage: `url(${captain.backgroundImage})`}}
        >
          <div className="trippy-mates-captain-profile-banner-overlay"></div>
        </div>
        <div className="trippy-mates-captain-profile-banner-content">
          <h1 className="trippy-mates-banner-title">MEET YOUR CAPTAIN</h1>
          <p className="trippy-mates-banner-subtitle">Local . Expert . Verified</p>
          <p className="trippy-mates-banner-description">
            Connect with experienced local guides who know their region inside out. Get authentic experiences, hidden gems, and personalized travel guidance from verified captains.
          </p>
        </div>
      </section>

    
      <section className="trippy-mates-captain-profile-details">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Profile Data & About - md-8 */}
            <Grid size={{xs: 12, md: 8}}>
              <div className="trippy-mates-captain-profile-content-wrapper">
                {/* Profile Card */}
                <div className="trippy-mates-captain-profile-card-main">
                  <div className="trippy-mates-captain-profile-header-card">
                    <div className="trippy-mates-captain-profile-avatar-card">
                      <img src={captain.image} alt={captain.name} />
                      {captain.verified && (
                        <div className="trippy-mates-verified-badge-card">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="trippy-mates-captain-profile-info-card">
                      <div className="trippy-mates-captain-badge-rating-card">
                        {captain.badge && (
                          <span className={`trippy-mates-badge-card trippy-mates-badge-${captain.badgeColor}`}>
                            {captain.badge}
                          </span>
                        )}
                        <div className="trippy-mates-captain-rating-card">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span>{captain.rating}</span>
                        </div>
                      </div>
                      <h1 className="trippy-mates-captain-name-card">{captain.name}</h1>
                      <div className="trippy-mates-captain-location-card">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                        </svg>
                        <span>{captain.location}</span>
                      </div>
                      <div className="trippy-mates-captain-languages-card">
                        <strong>Languages:</strong> {captain.languages?.join(', ') || 'N/A'}
                      </div>
                      <div className="trippy-mates-captain-price-card">
                        Starting at <span className="trippy-mates-price-card-highlight">₹{captain.price}/day</span>
                      </div>


                    {unavailableDates.length > 0 && (
                    <div className="trippy-mates-profile-section">
                      <h2 className="trippy-mates-profile-section-title">Reserved Dates</h2>
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


                  </div>
                  
                </div>

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

             

                </div>
              </div>
            </Grid>


            <Grid size={{xs: 12, md: 4}}>
              <div className="trippy-mates-captain-booking-card">
                <h3 className="trippy-mates-booking-card-title">Book This Captain</h3>
                <div className="trippy-mates-booking-card-price">
                  <span className="trippy-mates-price-label">Starting at</span>
                  <span className="trippy-mates-price-value">₹{captain.price}/day</span>
                </div>
                <button 
                  className="trippy-mates-booking-card-btn"
                  onClick={() => {
                    setShowBookingModal(true);
                    setSelectedUnavailableDates([]);
                    setDateErrors({ startDate: '', endDate: '' });
                    // Fetch all unavailable dates when modal opens
                    if (unavailableDates.length > 0) {
                      // Show all unavailable dates initially
                      setSelectedUnavailableDates(unavailableDates);
                    }
                  }}
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
              <button className="trippy-mates-booking-modal-close" onClick={() => {
                setShowBookingModal(false);
                setSelectedUnavailableDates([]);
                setDateErrors({ startDate: '', endDate: '' });
              }}>
                ×
              </button>
            </div>
            {/* Show unavailable dates below title */}
            {selectedUnavailableDates.length > 0 && (
              <div style={{
                backgroundColor: '#eff6ff',
                border: '2px solid #1d4ed8',
                borderRadius: '0.5rem',
                padding: '1rem',
                margin: '1rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#1d4ed8"/>
                  </svg>
                  <strong style={{ color: '#1d4ed8', fontSize: '0.875rem' }}>
                    Captain is not available on the following dates:
                  </strong>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem'
                }}>
                  {selectedUnavailableDates.map((date, idx) => (
                    <span 
                      key={idx}
                      style={{
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.8125rem',
                        fontWeight: '500',
                        border: '1px solid #93c5fd'
                      }}
                    >
                      {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <form className="trippy-mates-booking-form" onSubmit={handleBookingSubmit}>
              <div className="trippy-mates-booking-form-group">
                <label>Destination / Where to go <span className="required">*</span></label>
                <input
                  type="text"
                  value={bookingForm.destination}
                  onChange={(e) => {
                    setBookingForm({ ...bookingForm, destination: e.target.value });
                    if (destinationRadiusError) setDestinationRadiusError('');
                  }}
                  placeholder="e.g., Goa, Manali, Shimla"
                  className={destinationRadiusError ? 'trippy-mates-input-notice' : ''}
                  required
                />
                {destinationRadiusError && (
                  <span className="trippy-mates-form-notice">{destinationRadiusError}</span>
                )}
              </div>
              
              <div className="trippy-mates-booking-form-row">
                <div className="trippy-mates-booking-form-group">
                  <label>Start Date <span className="required">*</span></label>
                  <input
                    type="date"
                    value={bookingForm.startDate}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      
                      // Check if selected date is unavailable
                      if (selectedDate && isDateUnavailable(selectedDate)) {
                        setDateErrors(prev => ({ ...prev, startDate: 'This date is not available. Please select a different date.' }));
                        setBookingForm({ ...bookingForm, startDate: '' });
                        return;
                      }
                      
                      setDateErrors(prev => ({ ...prev, startDate: '' }));
                      setBookingForm({ ...bookingForm, startDate: selectedDate });
                      
                      // Always keep showing all unavailable dates - don't clear them
                      if (unavailableDates.length > 0) {
                        setSelectedUnavailableDates(unavailableDates);
                      }
                      
                      // Check availability when dates are selected (for validation only)
                      if (selectedDate && bookingForm.endDate) {
                        checkCaptainAvailability(selectedDate, bookingForm.endDate);
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    style={{
                      borderColor: dateErrors.startDate ? '#dc2626' : (bookingForm.startDate && isDateUnavailable(bookingForm.startDate) ? '#dc2626' : undefined),
                      borderWidth: dateErrors.startDate || (bookingForm.startDate && isDateUnavailable(bookingForm.startDate)) ? '2px' : undefined
                    }}
                  />
                  {dateErrors.startDate && (
                    <span style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {dateErrors.startDate}
                    </span>
                  )}
                 
                </div>
                <div className="trippy-mates-booking-form-group">
                  <label>End Date <span className="required">*</span></label>
                  <input
                    type="date"
                    value={bookingForm.endDate}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      
                      // Check if selected date is unavailable
                      if (selectedDate && isDateUnavailable(selectedDate)) {
                        setDateErrors(prev => ({ ...prev, endDate: 'This date is not available. Please select a different date.' }));
                        setBookingForm({ ...bookingForm, endDate: '' });
                        return;
                      }
                      
                      // Check if any date in the range is unavailable
                      if (bookingForm.startDate && selectedDate) {
                        const start = new Date(bookingForm.startDate);
                        const end = new Date(selectedDate);
                        const unavailableInRange = selectedUnavailableDates.filter(dateStr => {
                          const date = new Date(dateStr);
                          return date >= start && date <= end;
                        });
                        
                        if (unavailableInRange.length > 0) {
                          setDateErrors(prev => ({ 
                            ...prev, 
                            endDate: `Selected range includes ${unavailableInRange.length} unavailable date(s). Please choose a different range.` 
                          }));
                          setBookingForm({ ...bookingForm, endDate: '' });
                          return;
                        }
                      }
                      
                      setDateErrors(prev => ({ ...prev, endDate: '' }));
                      setBookingForm({ ...bookingForm, endDate: selectedDate });
                      
                      // Always keep showing all unavailable dates - don't clear them
                      if (unavailableDates.length > 0) {
                        setSelectedUnavailableDates(unavailableDates);
                      }
                      
                      // Check availability when dates are selected (for validation only)
                      if (bookingForm.startDate && selectedDate) {
                        checkCaptainAvailability(bookingForm.startDate, selectedDate);
                      }
                    }}
                    min={bookingForm.startDate || new Date().toISOString().split('T')[0]}
                    required
                    style={{
                      borderColor: dateErrors.endDate ? '#dc2626' : (bookingForm.endDate && isDateUnavailable(bookingForm.endDate) ? '#dc2626' : undefined),
                      borderWidth: dateErrors.endDate || (bookingForm.endDate && isDateUnavailable(bookingForm.endDate)) ? '2px' : undefined
                    }}
                  />
                  {dateErrors.endDate && (
                    <span style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {dateErrors.endDate}
                    </span>
                  )}
                 
                </div>
              </div>
              
              {/* Visual indicator for unavailable dates in selected range */}
              {bookingForm.startDate && bookingForm.endDate && selectedUnavailableDates.length > 0 && (
                (() => {
                  const start = new Date(bookingForm.startDate);
                  const end = new Date(bookingForm.endDate);
                  const unavailableInRange = selectedUnavailableDates.filter(dateStr => {
                    const date = new Date(dateStr);
                    return date >= start && date <= end;
                  });
                  
                  if (unavailableInRange.length > 0) {
                    return (
                      <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        marginTop: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#dc2626"/>
                          </svg>
                          <strong style={{ color: '#dc2626', fontSize: '0.8125rem' }}>
                            {unavailableInRange.length} unavailable date(s) in selected range:
                          </strong>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                          {unavailableInRange.map((date, idx) => (
                            <span 
                              key={idx}
                              style={{
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                border: '1px solid #fecaca'
                              }}
                            >
                              {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()
              )}

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
                  {bookingLoading ? 'Processing...' : 'Proceed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

