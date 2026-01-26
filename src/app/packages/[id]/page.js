'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Grid } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { API_BASE_URL } from '@/lib/config';

// Static package data as fallback
const staticPackageData = {
  _id: '1',
  title: 'Manali Adventure Escape',
  duration: '3N/4D',
  source: 'Delhi',
  destination: 'Manali',
  category: 'Adventure',
  overview: 'Experience the breathtaking beauty of Manali with this amazing adventure package. Trek through scenic trails, enjoy camping under the stars, and explore the best of Himalayan culture.',
  images: [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop'
  ],
  highlights: [
    'Trekking through scenic mountain trails',
    'Camping under the stars',
    'Visit to ancient temples and monasteries',
    'Adventure activities like paragliding',
    'Local culture and cuisine experience'
  ],
  itinerary: [
    {
      day: 1,
      title: 'Arrival in Manali',
      description: 'Arrive at Manali and check into your hotel. Explore the local markets and enjoy a welcome dinner.',
      activities: ['Hotel Check-in', 'Local Market Visit', 'Welcome Dinner'],
      meals: 'Dinner',
      accommodation: '3-star Hotel'
    },
    {
      day: 2,
      title: 'Trekking Adventure',
      description: 'Early morning trek to Solang Valley. Enjoy adventure activities and breathtaking views.',
      activities: ['Trekking', 'Paragliding', 'Photography'],
      meals: 'Breakfast, Lunch',
      accommodation: 'Camp Site'
    },
    {
      day: 3,
      title: 'Temple Visit & Local Culture',
      description: 'Visit Hadimba Temple and explore local culture. Evening at leisure.',
      activities: ['Temple Visit', 'Cultural Tour', 'Shopping'],
      meals: 'Breakfast, Dinner',
      accommodation: '3-star Hotel'
    },
    {
      day: 4,
      title: 'Departure',
      description: 'Check out from hotel and depart with beautiful memories.',
      activities: ['Hotel Check-out', 'Departure'],
      meals: 'Breakfast',
      accommodation: 'N/A'
    }
  ],
  destinations: [
    {
      destinationName: 'Manali',
      destinationType: 'Hill Station',
      places: ['Solang Valley', 'Hadimba Temple', 'Rohtang Pass', 'Manu Temple']
    }
  ],
  inclusions: [
    'Accommodation in 3-star hotels',
    'All meals as per itinerary',
    'Transportation',
    'Trekking guide',
    'Adventure activities',
    'All entry fees'
  ],
  exclusions: [
    'Personal expenses',
    'Travel insurance',
    'Any additional activities',
    'Tips and gratuities'
  ],
  price: {
    adult: 8999,
    child: 6999
  },
  otherDetails: 'Terms and conditions apply. Cancellation policy: 50% refund if cancelled 7 days before travel date.'
};

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id;

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showEnquireModal, setShowEnquireModal] = useState(false);
  const [enquireForm, setEnquireForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  // User joined slots - will be fetched from API
  const [joinedSlots] = useState([]);

  useEffect(() => {
    if (packageId) {
      fetchPackageDetails();
    }
  }, [packageId]);

  useEffect(() => {
    if (selectedPackage && selectedPackage._id) {
      fetchSlots();
    }
  }, [selectedPackage]);

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
        setSelectedPackage(data.data);
      } else {
        console.error('Failed to fetch package:', data.message);
        setSelectedPackage(null);
      }
    } catch (error) {
      console.error('Error fetching package:', error);
      setSelectedPackage(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    if (!selectedPackage || !selectedPackage._id) return;
    
    try {
      setSlotsLoading(true);
      // Fetch slots for this package
      // Since getAllSlots is admin route, we'll try to get slots from package data if available
      // Or use available slots endpoint with future dates
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Try to fetch slots - we'll need packageId and destinationId
      // For now, let's try to get slots if package has destination info
      if (selectedPackage.destinationId || selectedPackage.destinations?.[0]?._id) {
        const destinationId = selectedPackage.destinationId || selectedPackage.destinations?.[0]?._id;
        
        // Get slots for next 60 days
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 60);
        
        // Try user endpoint first (might not work without all params, so we'll handle error)
        try {
          const slotsResponse = await fetch(
            `${API_BASE_URL}/api/user/slot/available?packageId=${selectedPackage._id}&destinationId=${destinationId}&tripDate=${today.toISOString().split('T')[0]}`,
            { headers }
          );
          
          if (slotsResponse.ok) {
            const slotsData = await slotsResponse.json();
            if (slotsData.status && slotsData.data) {
              setSlots(slotsData.data || []);
              setSlotsLoading(false);
              return;
            }
          }
        } catch (error) {
          console.log('Could not fetch slots from available endpoint:', error);
        }
      }
      
      // If no slots found, set empty array
      setSlots([]);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleJoinSlot = (slot, e) => {
    e.stopPropagation();
    // Show toast message directly
    showToast(`Join request sent successfully for ${slot.slotName}!`, 'success');
  };

  const handleSlotClick = (slot) => {
    router.push(`/packages/${packageId}/slot/${slot._id}`);
  };

  const handleEnquireNow = () => {
    setShowEnquireModal(true);
  };

  const handleEnquireSubmit = (e) => {
    e.preventDefault();
    // Handle enquiry submission
    showToast('Enquiry submitted successfully! We will contact you soon.', 'success');
    setShowEnquireModal(false);
    setEnquireForm({ name: '', email: '', phone: '', message: '' });
  };

  const handleBookNow = () => {
    router.push(`/packages/${packageId}/book`);
  };

  if (loading) {
    return (
      <div className="packages-page-loading">
        <div className="packages-loading-spinner"></div>
        <p>Loading package details...</p>
      </div>
    );
  }

  if (!selectedPackage) {
    return (
      <div className="packages-page-loading">
        <p>Package not found</p>
        <button onClick={() => router.push('/packages')}>Back to Packages</button>
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

      {/* Enquire Now Modal */}
      {showEnquireModal && (
        <div className="packages-modal-overlay" onClick={() => setShowEnquireModal(false)}>
          <div className="packages-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="packages-modal-header">
              <h3>Enquire About Package</h3>
              <button className="packages-modal-close" onClick={() => setShowEnquireModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <form className="packages-modal-body" onSubmit={handleEnquireSubmit}>
              <div className="packages-modal-form-group">
                <label>Name *</label>
                <input
                  type="text"
                  className="packages-modal-input"
                  placeholder="Enter your name"
                  value={enquireForm.name}
                  onChange={(e) => setEnquireForm({...enquireForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="packages-modal-form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className="packages-modal-input"
                  placeholder="Enter your email"
                  value={enquireForm.email}
                  onChange={(e) => setEnquireForm({...enquireForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="packages-modal-form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  className="packages-modal-input"
                  placeholder="Enter your phone number"
                  value={enquireForm.phone}
                  onChange={(e) => setEnquireForm({...enquireForm, phone: e.target.value})}
                  required
                />
              </div>
              <div className="packages-modal-form-group">
                <label>Message</label>
                <textarea
                  className="packages-modal-textarea"
                  placeholder="Enter your message or questions..."
                  value={enquireForm.message}
                  onChange={(e) => setEnquireForm({...enquireForm, message: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="packages-modal-footer">
                <button 
                  type="button"
                  className="packages-modal-cancel-btn" 
                  onClick={() => setShowEnquireModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="packages-modal-submit-btn"
                >
                  Submit Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section - Travel Blog Style */}
      <section>
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: (!slotsLoading && slots.length > 0) ? '0' : '0'
        }}>
          {/* Background Image */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${selectedPackage.images && selectedPackage.images[0] ? selectedPackage.images[0] : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }} />
          
          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(29, 78, 216, 0.4) 0%, rgba(30, 64, 175, 0.3) 50%, rgba(124, 58, 237, 0.2) 100%)',
            zIndex: 1
          }} />
          
          {/* Decorative Bottom Border */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'white',
            clipPath: 'polygon(0 60%, 5% 50%, 10% 55%, 15% 45%, 20% 50%, 25% 40%, 30% 45%, 35% 35%, 40% 40%, 45% 30%, 50% 35%, 55% 25%, 60% 30%, 65% 20%, 70% 25%, 75% 15%, 80% 20%, 85% 10%, 90% 15%, 95% 5%, 100% 10%, 100% 100%, 0 100%)',
            zIndex: 2
          }} />
          
          <div style={{ 
            position: 'relative', 
            zIndex: 2, 
            maxWidth: '1200px',
            textAlign: 'center',
            padding: '0 2rem',
            width: '100%'
          }}>
            <h1 style={{ 
              fontSize: '4rem', 
              fontWeight: '800', 
              marginBottom: '2rem',
              textShadow: '0 4px 20px rgba(0,0,0,0.4)',
              letterSpacing: '-1px',
              lineHeight: '1.2',
              color: 'white'
            }}>
              {selectedPackage.title}
            </h1>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.125rem',
                color: 'white',
                fontWeight: '500',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.9 1.57h1.52c-.01-1.28-.87-2.3-2.54-2.75V4H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.23-1.64H8.04c0 1.23.95 2.19 2.48 2.52V16h2.21v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="white"/>
                </svg>
                {selectedPackage.duration}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.125rem',
                color: 'white',
                fontWeight: '500',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
                </svg>
                {selectedPackage.source} → {selectedPackage.destination}
              </div>
              {selectedPackage.category && (
                <span style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '50px',
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                  {selectedPackage.category}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Available Slots Section - Only show if slots are available */}
      {!slotsLoading && slots.length > 0 && (
        <section className="packages-slots-section">
          <div className="packages-slots-container">
            <h2 className="packages-section-title">Available Slots</h2>
            <div className="packages-slots-grid">
              {slots.map((slot) => {
                const isJoined = joinedSlots.includes(slot._id);
                return (
                <div 
                  key={slot._id} 
                  className="packages-slot-card packages-slot-card-clickable"
                  onClick={() => handleSlotClick(slot)}
                >
                  <div className="packages-slot-header">
                    <h3 className="packages-slot-name">{slot.slotName || 'Unnamed Slot'}</h3>
                    <div className="packages-slot-status-group">
                      {isJoined && (
                        <span className="packages-slot-status packages-slot-status-added">
                          Added
                        </span>
                      )}
                      <span className={`packages-slot-status packages-slot-status-${slot.status || 'available'}`}>
                        {slot.status === 'available' ? 'Available' : slot.status === 'full' ? 'Full' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  <div className="packages-slot-details">
                    <div className="packages-slot-detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="currentColor"/>
                      </svg>
                      <span>Trip Date: {slot.tripDate ? new Date(slot.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                    </div>
                    <div className="packages-slot-detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/>
                      </svg>
                      <span>Available: {slot.availableSlots || 0} / {slot.maxSlots || 0}</span>
                    </div>
                    {slot.destinationName && (
                      <div className="packages-slot-detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                        </svg>
                        <span>{slot.destinationName}</span>
                      </div>
                    )}
                  </div>
                  {slot.status === 'available' && !isJoined && (
                    <button 
                      className="packages-join-slot-btn"
                      onClick={(e) => handleJoinSlot(slot, e)}
                    >
                      Join Slot
                    </button>
                  )}
                  {isJoined && (
                    <button 
                      className="packages-view-slot-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSlotClick(slot);
                      }}
                    >
                      View Details
                    </button>
                  )}
                </div>
              );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Package Details */}
      <section className="packages-details-section">
        <div className="packages-details-container">
          <Grid container spacing={4}>
            {/* Left Column - Main Content */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Overview */}
              <div className="packages-detail-card">
                <h2 className="packages-section-title">Overview</h2>
                <p className="packages-overview-text">{selectedPackage.overview}</p>
              </div>

              {/* Highlights */}
              {selectedPackage.highlights && selectedPackage.highlights.length > 0 && (
                <div className="packages-detail-card">
                  <h2 className="packages-section-title">Highlights</h2>
                  <ul className="packages-highlights-list">
                    {selectedPackage.highlights.map((highlight, index) => (
                      <li key={index} className="packages-highlight-item">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Itinerary */}
              {selectedPackage.itinerary && selectedPackage.itinerary.length > 0 && (
                <div className="packages-detail-card">
                  <h2 className="packages-section-title">Itinerary</h2>
                  <div className="packages-itinerary-list">
                    {selectedPackage.itinerary.map((day, index) => (
                      <div key={index} className="packages-itinerary-day">
                        <div className="packages-itinerary-day-header">
                          <span className="packages-day-badge">Day {day.day}</span>
                          <div style={{ flex: 1 }}>
                            <h3 className="packages-day-title">{day.title}</h3>
                            {day.description && (
                              <p className="packages-day-description" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>{day.description}</p>
                            )}
                          </div>
                        </div>
                        {day.activities && day.activities.length > 0 && (
                          <div className="packages-day-activities">
                            <strong style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9375rem', color: '#374151' }}>Activities:</strong>
                            <div className="packages-activities-tags">
                              {day.activities.map((activity, actIndex) => (
                                <span key={actIndex} className="packages-activity-tag">{activity}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="packages-day-info">
                          {day.meals && (
                            <span className="packages-info-item">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" fill="currentColor"/>
                              </svg>
                              {day.meals}
                            </span>
                          )}
                          {day.accommodation && day.accommodation !== 'N/A' && (
                            <span className="packages-info-item">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 20v-6H4v6h6zm10 0v-6h-6v6h6zM10 4H4v6h6V4zm10 0h-6v6h6V4z" fill="currentColor"/>
                              </svg>
                              {day.accommodation}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Destinations */}
              {selectedPackage.destinations && selectedPackage.destinations.length > 0 && (
                <div className="packages-detail-card">
                  <h2 className="packages-section-title">Destinations Covered</h2>
                  <div className="packages-destinations-grid">
                    {selectedPackage.destinations.map((dest, index) => (
                      <div key={index} className="packages-destination-card">
                        <h3 className="packages-destination-name">{dest.destinationName}</h3>
                        <span className="packages-destination-type">{dest.destinationType}</span>
                        {dest.places && dest.places.length > 0 && (
                          <div className="packages-destination-places">
                            <strong>Places to Visit:</strong>
                            <ul>
                              {dest.places.map((place, placeIndex) => (
                                <li key={placeIndex}>{place}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions & Exclusions */}
              <div className="packages-detail-card">
                <Grid container spacing={6}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <h3 className="packages-subsection-title" style={{ marginBottom: '1.5rem' }}>Inclusions</h3>
                    <ul className="packages-inclusions-list">
                      {selectedPackage.inclusions && selectedPackage.inclusions.map((item, index) => (
                        <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <CheckCircleIcon 
                            sx={{ 
                              fontSize: '10px', 
                              color: '#10b981',
                              flexShrink: 0,
                              width: '10px',
                              height: '10px'
                            }} 
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <h3 className="packages-subsection-title" style={{ marginBottom: '1.5rem' }}>Exclusions</h3>
                    <ul className="packages-exclusions-list">
                      {selectedPackage.exclusions && selectedPackage.exclusions.map((item, index) => (
                        <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <CancelIcon 
                            sx={{ 
                              fontSize: '10px', 
                              color: '#ef4444',
                              flexShrink: 0,
                              width: '10px',
                              height: '10px'
                            }} 
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Grid>
                </Grid>
              </div>

              {/* Other Details */}
              {selectedPackage.otherDetails && (
                <div className="packages-detail-card">
                  <h2 className="packages-section-title">Terms & Conditions</h2>
                  <p className="packages-other-details">{selectedPackage.otherDetails}</p>
                </div>
              )}

              {/* Policies Section */}
              <div className="packages-detail-card">
                <h2 className="packages-section-title">Policies</h2>
                
                {/* Confirmation Policy */}
                <div className="packages-policy-item">
                  <h3 className="packages-policy-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                    </svg>
                    Confirmation Policy
                  </h3>
                  <div className="packages-policy-content">
                    {selectedPackage.confirmationPolicy ? (
                      <p>{selectedPackage.confirmationPolicy}</p>
                    ) : (
                      <ul className="packages-policy-list">
                        <li>Booking confirmation will be sent via email/SMS within 24 hours of payment receipt.</li>
                        <li>All bookings are subject to availability at the time of confirmation.</li>
                        <li>Confirmation voucher with travel details will be provided after full payment.</li>
                        <li>Please verify all details in the confirmation voucher before travel.</li>
                      </ul>
                    )}
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="packages-policy-item">
                  <h3 className="packages-policy-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                    </svg>
                    Cancellation Policy
                  </h3>
                  <div className="packages-policy-content">
                    {selectedPackage.cancellationPolicy ? (
                      <p>{selectedPackage.cancellationPolicy}</p>
                    ) : (
                      <ul className="packages-policy-list">
                        <li>Cancellation requests must be made in writing via email or through the booking portal.</li>
                        <li>If cancelled 30 days or more before travel date: 90% refund (10% processing fee).</li>
                        <li>If cancelled 15-29 days before travel date: 70% refund.</li>
                        <li>If cancelled 7-14 days before travel date: 50% refund.</li>
                        <li>If cancelled less than 7 days before travel date: No refund.</li>
                        <li>No-show or cancellation on travel date: No refund.</li>
                        <li>Refund processing may take 7-14 business days.</li>
                      </ul>
                    )}
                  </div>
                </div>

                {/* Refund Policy */}
                <div className="packages-policy-item">
                  <h3 className="packages-policy-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.9 1.57h1.52c-.01-1.28-.87-2.3-2.54-2.75V4H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.23-1.64H8.04c0 1.23.95 2.19 2.48 2.52V16h2.21v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
                    </svg>
                    Refund Policy
                  </h3>
                  <div className="packages-policy-content">
                    {selectedPackage.refundPolicy ? (
                      <p>{selectedPackage.refundPolicy}</p>
                    ) : (
                      <ul className="packages-policy-list">
                        <li>Refunds will be processed to the original payment method used for booking.</li>
                        <li>Refund amount will be calculated as per the cancellation policy.</li>
                        <li>Processing fee (if applicable) will be deducted from the refund amount.</li>
                        <li>Refund processing time: 7-14 business days from the date of cancellation approval.</li>
                        <li>Bank charges (if any) for refund processing will be borne by the customer.</li>
                        <li>Partial refunds may apply for partially utilized services.</li>
                        <li>No refund for services availed or vouchers used.</li>
                        <li>In case of force majeure or unforeseen circumstances, refunds will be processed as per company policy.</li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </Grid>

            {/* Right Column - Booking Summary */}
            <Grid size={{ xs: 12, md: 4 }}>
              <div className="packages-sticky-sidebar">
                <div className="packages-booking-card">
                  <h2 className="packages-booking-title">Booking Summary</h2>
                
                {/* Price Section */}
                <div className="packages-price-section">
                  {selectedPackage.price && (
                    <>
                      <div className="packages-price-row">
                        <span className="packages-price-label">Budget (Per Person):</span>
                        <span className="packages-price-value">₹{selectedPackage.price.adult?.toLocaleString() || '0'}</span>
                      </div>
                      {selectedPackage.price.child > 0 && (
                        <div className="packages-price-row">
                          <span className="packages-price-label">Child Price:</span>
                          <span className="packages-price-value">₹{selectedPackage.price.child.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="packages-booking-buttons">
                  <button className="packages-enquiry-btn" onClick={handleEnquireNow}>Enquire Now</button>
                  <button className="packages-book-btn" onClick={handleBookNow}>Book Now</button>
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

