'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Container, Grid, Skeleton } from '@mui/material';
import 'swiper/css';
import 'swiper/css/navigation';

import { API_BASE_URL } from '@/lib/config';

export default function TrippyMatesPage() {
  const router = useRouter();
  const swiperRef = useRef(null);
  const [searchData, setSearchData] = useState({
    location: '',
    tripType: '',
    language: '',
    category: ''
  });
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState({});
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCaptain, setSelectedCaptain] = useState(null);
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
  const [captainBookings, setCaptainBookings] = useState([]);
  const [bookingConflict, setBookingConflict] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [selectedUnavailableDates, setSelectedUnavailableDates] = useState([]);

  // Fetch captains from API on mount
  useEffect(() => {
    fetchCaptains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCaptains = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchData.location) params.append('location', searchData.location);
      if (searchData.tripType) params.append('specialization', searchData.tripType);
      if (searchData.language) params.append('language', searchData.language);
      if (searchData.category) params.append('category', searchData.category);
      params.append('limit', '10');
      params.append('page', '1');

      const response = await fetch(`${API_BASE_URL}/api/user/captains?${params.toString()}`);
      const data = await response.json();
      
      if (data.status && data.data) {
        const captainsData = data.data.captains || [];
        setCaptains(captainsData);
        
        // Check availability for all captains
        const availabilityPromises = captainsData.map(async (captain) => {
          try {
            const today = new Date();
            const endDate = new Date();
            endDate.setDate(today.getDate() + 30); // Check next 30 days
            
            const availResponse = await fetch(
              `${API_BASE_URL}/api/user/captain/${captain.id}/availability?startDate=${today.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
            );
            const availData = await availResponse.json();
            
            if (availData.status && availData.data) {
              return { captainId: captain.id, dates: availData.data.unavailableDates || [] };
            }
            return { captainId: captain.id, dates: [] };
          } catch (err) {
            console.error(`Error checking availability for captain ${captain.id}:`, err);
            return { captainId: captain.id, dates: [] };
          }
        });
        
        const availabilityResults = await Promise.all(availabilityPromises);
        const availabilityMap = {};
        availabilityResults.forEach(result => {
          availabilityMap[result.captainId] = result.dates;
        });
        setUnavailableDates(availabilityMap);
      } else {
        throw new Error(data.message || 'Failed to fetch captains');
      }
    } catch (err) {
      console.error('Error fetching captains:', err);
      setError(err.message);
      // Fallback to empty array on error
      setCaptains([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch captain bookings when modal opens
  const fetchCaptainBookings = async (captainId) => {
    try {
      // Try to fetch existing bookings for the captain
      // If API doesn't exist, fallback to empty array
      const response = await fetch(`${API_BASE_URL}/api/user/captain/${captainId}/bookings`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status && data.data) {
          setCaptainBookings(data.data.bookings || []);
        } else {
          setCaptainBookings([]);
        }
      } else {
        // If endpoint doesn't exist, try alternative endpoint or set empty
        console.log('Bookings endpoint not available, using empty bookings');
        setCaptainBookings([]);
      }
    } catch (err) {
      console.error('Error fetching captain bookings:', err);
      // On error, set empty array so booking can still proceed
      setCaptainBookings([]);
    }
  };

  // Check if a date is unavailable
  const isDateUnavailable = (dateString) => {
    if (!dateString || !selectedCaptain) return false;
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    // Check against all unavailable dates for this captain
    const captainUnavailableDates = unavailableDates[selectedCaptain.id] || [];
    return captainUnavailableDates.some(unavDate => {
      const unav = new Date(unavDate);
      unav.setHours(0, 0, 0, 0);
      return date.getTime() === unav.getTime();
    });
  };

  // Check captain availability for selected dates
  // Note: This function is used for validation, but we always keep showing all unavailable dates
  const checkCaptainAvailability = async (captainId, startDate, endDate) => {
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

  // Check for booking conflicts
  const checkBookingConflict = (startDate, endDate, destination) => {
    if (!selectedCaptain || captainBookings.length === 0) return null;

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    
    // Check each existing booking
    for (const booking of captainBookings) {
      const existingStart = new Date(booking.startDate);
      const existingEnd = new Date(booking.endDate);
      
      // Check for direct date overlap
      if (
        (newStart >= existingStart && newStart <= existingEnd) ||
        (newEnd >= existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      ) {
        return {
          conflict: true,
          message: `Captain is already booked from ${existingStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} to ${existingEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} for ${booking.destination || 'another destination'}.`,
          existingBooking: booking
        };
      }
      
      // Check for travel time conflict (if different locations)
      // If captain finishes booking on 20 Dec in Goa, they can't start on 21 Dec in Assam
      // Need at least 1 day gap for travel between different locations
      if (booking.destination && destination && booking.destination.toLowerCase() !== destination.toLowerCase()) {
        const daysBetween = Math.ceil((newStart - existingEnd) / (1000 * 60 * 60 * 24));
        
        if (daysBetween <= 1 && daysBetween >= 0) {
          return {
            conflict: true,
            message: `Captain finishes booking in ${booking.destination} on ${existingEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. They need at least 1 day for travel. Cannot start booking in ${destination} on ${newStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
            existingBooking: booking
          };
        }
        
        // Also check reverse - if new booking ends and existing starts too soon
        const reverseDaysBetween = Math.ceil((existingStart - newEnd) / (1000 * 60 * 60 * 24));
        if (reverseDaysBetween <= 1 && reverseDaysBetween >= 0) {
          return {
            conflict: true,
            message: `Your booking ends on ${newEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} in ${destination}. Captain has another booking starting on ${existingStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} in ${booking.destination}. They need at least 1 day for travel.`,
            existingBooking: booking
          };
        }
      }
    }
    
    return null;
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    // Destination validation
    if (!bookingForm.destination.trim()) {
      errors.destination = 'Destination is required';
    } else if (bookingForm.destination.trim().length < 2) {
      errors.destination = 'Destination must be at least 2 characters';
    }

    // Start Date validation
    if (!bookingForm.startDate) {
      errors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(bookingForm.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }

    // End Date validation
    if (!bookingForm.endDate) {
      errors.endDate = 'End date is required';
    } else if (bookingForm.startDate) {
      const startDate = new Date(bookingForm.startDate);
      const endDate = new Date(bookingForm.endDate);
      if (endDate < startDate) {
        errors.endDate = 'End date must be after start date';
      }
    }

    // Customer Name validation
    if (!bookingForm.customerName.trim()) {
      errors.customerName = 'Name is required';
    } else if (bookingForm.customerName.trim().length < 2) {
      errors.customerName = 'Name must be at least 2 characters';
    }

    // Email validation (optional but validate format if provided)
    if (bookingForm.customerEmail && bookingForm.customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingForm.customerEmail)) {
        errors.customerEmail = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (!bookingForm.customerPhone.trim()) {
      errors.customerPhone = 'Phone number is required';
    } else {
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(bookingForm.customerPhone.replace(/\s/g, ''))) {
        errors.customerPhone = 'Please enter a valid phone number';
      } else if (bookingForm.customerPhone.replace(/\D/g, '').length < 10) {
        errors.customerPhone = 'Phone number must be at least 10 digits';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCaptain) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check for conflicts
    const conflict = checkBookingConflict(
      bookingForm.startDate,
      bookingForm.endDate,
      bookingForm.destination
    );

    if (conflict && conflict.conflict) {
      setBookingConflict(conflict);
      return;
    }

    setBookingConflict(null);

    try {
      setBookingLoading(true);
      
      const startDate = new Date(bookingForm.startDate);
      const endDate = new Date(bookingForm.endDate);
      const numberOfDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      // Store booking data in sessionStorage and navigate to payment
      const bookingData = {
        captainId: selectedCaptain.id,
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
        destination: bookingForm.destination,
        customerName: bookingForm.customerName,
        customerEmail: bookingForm.customerEmail,
        customerPhone: bookingForm.customerPhone,
        numberOfDays: numberOfDays,
        specialRequirements: bookingForm.specialRequirements,
        price: selectedCaptain.price * numberOfDays
      };
      
      sessionStorage.setItem('captainBookingData', JSON.stringify(bookingData));
      setShowBookingModal(false);
      setBookingForm({
        destination: '',
        startDate: '',
        endDate: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        specialRequirements: ''
      });
      setBookingConflict(null);
      setCaptainBookings([]);
      setFormErrors({});
      
      router.push(`/trippy-mates/${selectedCaptain.id}/payment`);
    } catch (error) {
      console.error('Error preparing booking:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Static data for travel stories
  const travelStories = [
    {
      id: 1,
      title: 'Goa Food Tour with Rohan',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
      rating: 4.9
    },
    {
      id: 2,
      title: 'Himalayan Trek with Priya',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop',
      rating: 4.8
    },
    {
      id: 3,
      title: 'Royal Rajasthan with Raj',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=400&h=300&fit=crop',
      rating: 4.9
    },
    {
      id: 4,
      title: 'Kerala Backwaters with Anjali',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      rating: 4.7
    },
    {
      id: 5,
      title: 'Varanasi Ganga Aarti with Deepak',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=300&fit=crop',
      rating: 4.9
    },
    {
      id: 6,
      title: 'Ladakh Adventure with Tenzin',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      rating: 4.8
    }
  ];

  const handleSearch = () => {
    // Fetch captains with search filters
    fetchCaptains();
    // Scroll to captains section
    const captainsSection = document.getElementById('captains-section');
    if (captainsSection) {
      captainsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchCaptains = () => {
    // Scroll to search bar
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
      searchBar.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHowItWorks = () => {
    const howItWorksSection = document.getElementById('how-it-works-section');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  return (
    <div className="trippy-mates-page">
 
      <section className="trippy-mates-hero">
        <div className="trippy-mates-hero-background">
          <div className="trippy-mates-hero-bg-image"></div>
          <div className="trippy-mates-hero-overlay"></div>
        </div>
        <div className="trippy-mates-hero-container">
          <div className="trippy-mates-hero-content">
            <h1 className="trippy-mates-hero-title">
              Travel With a <span className="trippy-mates-hero-highlight">Local Expert</span>
            </h1>
            <p className="trippy-mates-hero-subtitle">
              Hire verified Captains who guide you through culture, food, hidden gems and safe routes.
            </p>
            <div className="trippy-mates-hero-buttons">
              <button className="trippy-mates-btn-primary" onClick={handleSearchCaptains}>Search Captains</button>
              <button className="trippy-mates-btn-secondary" onClick={handleHowItWorks}>How It Works</button>
            </div>
          </div>
          <div className="trippy-mates-hero-image">
            <div className="trippy-mates-captain-image-wrapper">
              <img 
                src="/trippymates/trippymates_guide.png" 
                alt="Local Captain"
                className="trippy-mates-captain-img"
              />
            </div>
          </div>
        </div>

      
        <div className="trippy-mates-search-bar" id="search-bar">
          <div className="trippy-mates-search-container">
            <div className="trippy-mates-search-field-new">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="trippy-mates-search-icon">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#64748b"/>
              </svg>
              <input
                type="text"
                placeholder="Where do you need a guide?"
                value={searchData.location}
                onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                className="trippy-mates-search-input"
              />
            </div>
            <div className="trippy-mates-search-field-new">
              <select
                value={searchData.tripType}
                onChange={(e) => setSearchData({ ...searchData, tripType: e.target.value })}
                className="trippy-mates-search-select"
              >
                <option value="">Trip Type</option>
                <option value="adventure">Adventure</option>
                <option value="culture">Culture</option>
                <option value="food">Food</option>
                <option value="beach">Beach</option>
                <option value="heritage">Heritage</option>
                <option value="nature">Nature</option>
              </select>
            </div>
            <div className="trippy-mates-search-field-new">
              <select
                value={searchData.category}
                onChange={(e) => setSearchData({ ...searchData, category: e.target.value })}
                className="trippy-mates-search-select"
              >
                <option value="">Traveler Type</option>
                <option value="Solo Traveler">Solo Traveler</option>
                <option value="Family">Family</option>
                <option value="Couple">Couple</option>
                <option value="Group">Group</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <button className="trippy-mates-search-btn-new" onClick={handleSearch}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Search
            </button>
          </div>
        </div>
      </section>


      {/* How It Works Section - Captain-First Flow */}
      <section className="trippy-mates-how-it-works-section" id="how-it-works-section">
        <div className="trippy-mates-container">
          <div className="trippy-mates-how-it-works-header">
            <h2 className="trippy-mates-section-title">
              How It <span className="trippy-mates-title-highlight">Works</span>
            </h2>
            <p className="trippy-mates-section-subtitle">
              You don't book a tour. <span className="trippy-mates-subtitle-highlight">You book a local human.</span>
            </p>
            <p className="trippy-mates-how-it-works-tagline">
              Experience travel the way locals do — authentic, personalized, and unforgettable.
            </p>
          </div>
          <div className="trippy-mates-how-it-works-steps-grid">
            <div className="trippy-mates-how-it-works-step">
              <div className="trippy-mates-step-number-wrapper">
                <div className="trippy-mates-step-number">1</div>
              </div>
              <div className="trippy-mates-step-content">
                <h3 className="trippy-mates-step-title">Search</h3>
                <p className="trippy-mates-step-description">
                  Enter your destination, trip type, and preferred language to find verified local captains.
                </p>
              </div>
            </div>
            <div className="trippy-mates-step-arrow">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="trippy-mates-how-it-works-step">
              <div className="trippy-mates-step-number-wrapper">
                <div className="trippy-mates-step-number">2</div>
              </div>
              <div className="trippy-mates-step-content">
                <h3 className="trippy-mates-step-title">Select Captain</h3>
                <p className="trippy-mates-step-description">
                  Browse captain profiles, read reviews, and check their expertise areas. Choose your perfect match.
                </p>
              </div>
            </div>
            <div className="trippy-mates-step-arrow">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="trippy-mates-how-it-works-step">
              <div className="trippy-mates-step-number-wrapper">
                <div className="trippy-mates-step-number">3</div>
              </div>
              <div className="trippy-mates-step-content">
                <h3 className="trippy-mates-step-title">Book Securely</h3>
                <p className="trippy-mates-step-description">
                  Select your preferred captain and book them for your travel dates. Secure payment, instant confirmation.
                </p>
              </div>
            </div>
            <div className="trippy-mates-step-arrow">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="trippy-mates-how-it-works-step">
              <div className="trippy-mates-step-number-wrapper">
                <div className="trippy-mates-step-number">4</div>
              </div>
              <div className="trippy-mates-step-content">
                <h3 className="trippy-mates-step-title">Enjoy with Local</h3>
                <p className="trippy-mates-step-description">
                  Experience authentic local culture, food, and hidden gems. Create memories that last a lifetime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trippy-mates-captains-section" id="captains-section">
        <div className="trippy-mates-container">
          <h2 className="trippy-mates-section-title">
            Meet Your <span className="trippy-mates-title-highlight">Local Captains</span>
          </h2>
          <p className="trippy-mates-section-subtitle">
            Verified experts ready to make your journey unforgettable
          </p>
          {loading ? (
            <Grid container columnSpacing={4} rowSpacing={6}>
              {[...new Array(6)].map((_, idx) => (
                <Grid size={{xs: 12, sm: 6, md: 4}} key={idx} sx={{ display: 'flex' }}>
                  <div className="trippy-mates-captain-card" style={{ width: '100%' }}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={180}
                      sx={{
                        bgcolor: '#e2e8f0',
                        borderRadius: '1rem 1rem 0 0',
                      }}
                      animation="wave"
                    />
                    <div className="trippy-mates-captain-card-content" style={{ paddingTop: '3rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-60px', marginBottom: '1rem' }}>
                        <Skeleton
                          variant="circular"
                          width={120}
                          height={120}
                          sx={{ bgcolor: '#e2e8f0' }}
                          animation="wave"
                        />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Skeleton variant="text" width="60%" height={28} sx={{ mx: 'auto', mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                        <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto', mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                        <Skeleton variant="text" width="70%" height={20} sx={{ mx: 'auto', mb: 1.5, bgcolor: '#e2e8f0' }} animation="wave" />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '0.375rem', bgcolor: '#e2e8f0' }} animation="wave" />
                          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '0.375rem', bgcolor: '#e2e8f0' }} animation="wave" />
                        </div>
                        <Skeleton variant="text" width="50%" height={20} sx={{ mx: 'auto', mb: 1.5, bgcolor: '#e2e8f0' }} animation="wave" />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} animation="wave" />
                          <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} animation="wave" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error: {error}</p>
              <button 
                onClick={fetchCaptains}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : captains.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No captains found. Try adjusting your search filters.</p>
            </div>
          ) : (
           
              <Grid container columnSpacing={4} rowSpacing={6}>
                {captains.map((captain) => (
                <Grid size={{xs: 12, sm: 6, md: 4}} key={captain.id} sx={{ display: 'flex' }}>
                  <div className="trippy-mates-captain-card">
                <div 
                  className="trippy-mates-captain-card-background"
                  style={{backgroundImage: `url(${captain.backgroundImage})`}}
                >
                  <div className="trippy-mates-captain-card-overlay"></div>
                  <div className="trippy-mates-captain-badge-on-image">
                    <span className={`trippy-mates-badge trippy-mates-badge-${captain.badgeColor}`}>
                      {captain.badge}
                    </span>
                  </div>
                  <div className="trippy-mates-captain-rating-on-image">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>{captain.rating}</span>
                  </div>
                </div>
                <div className="trippy-mates-captain-card-content">
                  <div className="trippy-mates-captain-profile-wrapper">
                    <div className="trippy-mates-captain-image">
                      <img src={captain.image} alt={captain.name} />
                      {captain.verified && (
                        <div className="trippy-mates-verified-check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="trippy-mates-captain-info">
                    <div className="trippy-mates-captain-name-row">
                      <h3 className="trippy-mates-captain-name">{captain.name}</h3>
                    </div>
                    <div className="trippy-mates-captain-details">
                      <div className="trippy-mates-location-languages-row">
                        <div className="trippy-mates-captain-location">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                          </svg>
                          <span>{captain.location}</span>
                        </div>
                        <div className="trippy-mates-captain-languages">
                          <span className="trippy-mates-languages-value">{captain.languages.join(', ')}</span>
                        </div>
                      </div>
                      <div className="trippy-mates-captain-expertise">
                       
                        <div className="trippy-mates-expertise-tags">
                          {captain.expertise.map((exp, idx) => (
                            <span key={idx} className="trippy-mates-expertise-tag">{exp}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="trippy-mates-captain-price">
                      Starting at <span className="trippy-mates-price-amount">₹{captain.price}/day</span>
                    </div>
                    <div className="trippy-mates-captain-actions">
                      <button 
                        className="trippy-mates-hire-btn"
                        onClick={async () => {
                          setSelectedCaptain(captain);
                          setShowBookingModal(true);
                          setBookingConflict(null);
                          setFormErrors({});
                          // Show unavailable dates immediately when modal opens
                          const captainUnavailableDates = unavailableDates[captain.id] || [];
                          setSelectedUnavailableDates(captainUnavailableDates);
                          // Fetch captain bookings when modal opens
                          await fetchCaptainBookings(captain.id);
                        }}
                      >
                        Book Now
                      </button>
                      <button 
                        className="trippy-mates-view-btn"
                        onClick={() => {
                          router.push(`/trippy-mates/${captain.id}`);
                        }}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
                </div>
                </Grid>
                ))}
              </Grid>
         
          )}
        </div>
      </section>

    
      <section className="trippy-mates-trusted-section">
        <div className="trippy-mates-container">
          <h2 className="trippy-mates-section-title">
            Trusted <span className="trippy-mates-title-highlight">Verified Local</span>
          </h2>
          <p className="trippy-mates-section-subtitle">
            Our captains are verified, experienced, and committed to your safety
          </p>
          <div className="trippy-mates-trusted-grid">
            <div className="trippy-mates-trusted-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop)'}}>
              <div className="trippy-mates-trusted-overlay"></div>
              <div className="trippy-mates-trusted-content">
                <div className="trippy-mates-trusted-icon trippy-mates-icon-blue">
                  <img src="/trippymates/icon/icon-1.png" alt="Verified ID" width="24" height="24" />
                </div>
                <h3 className="trippy-mates-trusted-title">Verified ID</h3>
                <p className="trippy-mates-trusted-text">All captains verified with government ID.</p>
              </div>
            </div>
            <div className="trippy-mates-trusted-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop)'}}>
              <div className="trippy-mates-trusted-overlay"></div>
              <div className="trippy-mates-trusted-content">
                <div className="trippy-mates-trusted-icon trippy-mates-icon-green">
                  <img src="/trippymates/icon/icon-2.png" alt="Local Expertise" width="24" height="24" />
                </div>
                <h3 className="trippy-mates-trusted-title">Local Expertise</h3>
                <p className="trippy-mates-trusted-text">Captains born and raised in their regions.</p>
              </div>
            </div>
            <div className="trippy-mates-trusted-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop)'}}>
              <div className="trippy-mates-trusted-overlay"></div>
              <div className="trippy-mates-trusted-content">
                <div className="trippy-mates-trusted-icon trippy-mates-icon-red">
                  <img src="/trippymates/icon/icon-3.png" alt="Emergency Ready" width="24" height="24" />
                </div>
                <h3 className="trippy-mates-trusted-title">Emergency Ready</h3>
                <p className="trippy-mates-trusted-text">Captains trained in first aid with emergency contacts.</p>
              </div>
            </div>
            <div className="trippy-mates-trusted-card" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop)'}}>
              <div className="trippy-mates-trusted-overlay"></div>
              <div className="trippy-mates-trusted-content">
                <div className="trippy-mates-trusted-icon trippy-mates-icon-yellow">
                  <img src="/trippymates/icon/icon-4.png" alt="Traveller Recommended" width="24" height="24" />
                </div>
                <h3 className="trippy-mates-trusted-title">Traveller Recommended</h3>
                <p className="trippy-mates-trusted-text">Rated by thousands of happy travelers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Local Captains - USP Core Section */}
      <section className="trippy-mates-why-choose-section">
        <div className="trippy-mates-container">
          <div className="trippy-mates-why-choose-header">
            <h2 className="trippy-mates-section-title">
              Why Choose <span className="trippy-mates-title-highlight">Local Captains</span>
            </h2>
            <p className="trippy-mates-why-choose-tagline">
              Anyone can show places. <span className="trippy-mates-subtitle-highlight">Locals show stories.</span>
            </p>
            <p className="trippy-mates-section-subtitle">
              Experience travel beyond the guidebook — with real locals who call it home.
            </p>
          </div>
          <div className="trippy-mates-why-choose-grid">
            <div className="trippy-mates-why-choose-card" style={{'--bg-image': 'url(https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&h=300&fit=crop)'}}>
              <div className="trippy-mates-why-choose-card-overlay"></div>
              <div className="trippy-mates-why-choose-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#8b5cf6"/>
                </svg>
              </div>
              <h3 className="trippy-mates-why-choose-card-title">Hidden Gems & Local Access</h3>
              <p className="trippy-mates-why-choose-card-text">
                Places Google can't show you. Secret spots, local favorites, and authentic experiences only locals know about.
              </p>
            </div>
            <div className="trippy-mates-why-choose-card" style={{'--bg-image': 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop)'}}>
              <div className="trippy-mates-why-choose-card-overlay"></div>
              <div className="trippy-mates-why-choose-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f59e0b"/>
                </svg>
              </div>
              <h3 className="trippy-mates-why-choose-card-title">Custom Travel, Not Fixed Tours</h3>
              <p className="trippy-mates-why-choose-card-text">
                Trip designed around you, not a bus schedule. Flexible itineraries that match your pace and interests perfectly.
              </p>
            </div>
            <div className="trippy-mates-why-choose-card" style={{'--bg-image': 'url(https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=300&fit=crop)'}}>
              <div className="trippy-mates-why-choose-card-overlay"></div>
              <div className="trippy-mates-why-choose-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#ef4444"/>
                </svg>
              </div>
              <h3 className="trippy-mates-why-choose-card-title">Cost-Effective & Transparent</h3>
              <p className="trippy-mates-why-choose-card-text">
                No middlemen, pay the captain directly. Fair pricing with no hidden fees or commission markups.
              </p>
            </div>
            <div className="trippy-mates-why-choose-card" style={{'--bg-image': 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop)'}}>
              <div className="trippy-mates-why-choose-card-overlay"></div>
              <div className="trippy-mates-why-choose-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="#ec4899"/>
                </svg>
              </div>
              <h3 className="trippy-mates-why-choose-card-title">Personalized Storytelling</h3>
              <p className="trippy-mates-why-choose-card-text">
                Hear real stories, not rehearsed scripts. Every location comes alive with personal anecdotes and local history.
              </p>
            </div>
            <div className="trippy-mates-why-choose-card" style={{'--bg-image': 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop)'}}>
              <div className="trippy-mates-why-choose-card-overlay"></div>
              <div className="trippy-mates-why-choose-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#3b82f6"/>
                </svg>
              </div>
              <h3 className="trippy-mates-why-choose-card-title">Flexible Meetup & Timing</h3>
              <p className="trippy-mates-why-choose-card-text">
                Start when you want, meet where it's convenient. No rigid schedules or group waiting times.
              </p>
            </div>
            <div className="trippy-mates-why-choose-card" style={{'--bg-image': 'url(https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop)'}}>
              <div className="trippy-mates-why-choose-card-overlay"></div>
              <div className="trippy-mates-why-choose-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" fill="#f59e0b"/>
                </svg>
              </div>
              <h3 className="trippy-mates-why-choose-card-title">Authentic Food Experiences</h3>
              <p className="trippy-mates-why-choose-card-text">
                Eat where locals eat. Discover street food, family kitchens, and hidden restaurants tourists never find.
              </p>
            </div>
          </div>
        </div>
      </section>

   
      <section className="trippy-mates-stories-section">
        <div className="trippy-mates-container">
          <h2 className="trippy-mates-section-title">
            Real <span className="trippy-mates-title-highlight">Travel Stories</span>
          </h2>
          <p className="trippy-mates-section-subtitle">
            See what other travelers experienced with our guides
          </p>
          <div className="trippy-mates-stories-wrapper">
            <button 
              className="trippy-mates-stories-nav trippy-mates-stories-nav-left swiper-button-prev-stories" 
              aria-label="Previous"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              modules={[Navigation, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              navigation={{
                prevEl: '.swiper-button-prev-stories',
                nextEl: '.swiper-button-next-stories',
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="trippy-mates-stories-swiper"
            >
            {travelStories.map((story) => (
              <SwiperSlide key={story.id}>
                <div className="trippy-mates-story-card">
                  <div className="trippy-mates-story-image">
                    <img src={story.image} alt={story.title} />
                  </div>
                  <div className="trippy-mates-story-content">
                    <h3 className="trippy-mates-story-title">{story.title}</h3>
                    <div className="trippy-mates-story-rating">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span>Rated {story.rating}</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <button 
            className="trippy-mates-stories-nav trippy-mates-stories-nav-right swiper-button-next-stories" 
            aria-label="Next"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          </div>
        </div>
      </section>

 
      <section className="trippy-mates-cta-section">
        <div className="trippy-mates-cta-container">
          <div className="trippy-mates-cta-content">
            <h2 className="trippy-mates-cta-title">Ready for a safer, smarter way to travel?</h2>
            <p className="trippy-mates-cta-subtitle">
              Join thousands of travelers who chose local expertise over tourist traps.
            </p>
            <button className="trippy-mates-cta-btn">Hire Your Captain Now</button>
          </div>
          <div className="trippy-mates-cta-image">
            <img src="/trippymates/Union.png" alt="Union" />
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && selectedCaptain && (
        <div className="trippy-mates-booking-modal-overlay" onClick={() => {
          setShowBookingModal(false);
          setFormErrors({});
        }}>
          <div className="trippy-mates-booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="trippy-mates-booking-modal-header">
              <h2>Book Captain - {selectedCaptain.name}</h2>
              <button className="trippy-mates-booking-modal-close" onClick={() => {
                setShowBookingModal(false);
                setFormErrors({});
                setSelectedUnavailableDates([]);
              }}>
                ×
              </button>
            </div>
            
            <form className="trippy-mates-booking-form" onSubmit={handleBookingSubmit}>
              {/* Show existing bookings */}
              {captainBookings.length > 0 && (
                <div className="trippy-mates-booking-existing-bookings">
                  <h4 className="trippy-mates-booking-existing-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Existing Bookings
                  </h4>
                  <div className="trippy-mates-booking-existing-list">
                    {captainBookings.map((booking, idx) => (
                      <div key={idx} className="trippy-mates-booking-existing-item">
                        <div className="trippy-mates-booking-existing-destination">
                          <strong>{booking.destination || 'N/A'}</strong>
                        </div>
                        <div className="trippy-mates-booking-existing-dates">
                          {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show conflict error */}
              {bookingConflict && bookingConflict.conflict && (
                <div className="trippy-mates-booking-conflict-error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#dc2626"/>
                  </svg>
                  <p>{bookingConflict.message}</p>
                </div>
              )}

          {selectedUnavailableDates.length > 0 && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '2px solid #dc2626',
                borderRadius: '0.5rem',
                padding: '1rem',
                margin: '1rem 0rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#dc2626"/>
                  </svg>
                  <strong style={{ color: '#dc2626', fontSize: '0.875rem' }}>
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
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.8125rem',
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

              <div className="trippy-mates-booking-form-group">
                <label>Destination / Where to go <span className="required">*</span></label>
                <input
                  type="text"
                  value={bookingForm.destination}
                  onChange={(e) => {
                    setBookingForm({ ...bookingForm, destination: e.target.value });
                    setBookingConflict(null);
                
                    if (formErrors.destination) {
                      setFormErrors({ ...formErrors, destination: '' });
                    }
                    // Re-check conflict when destination changes
                    if (bookingForm.startDate && bookingForm.endDate) {
                      const conflict = checkBookingConflict(
                        bookingForm.startDate,
                        bookingForm.endDate,
                        e.target.value
                      );
                      setBookingConflict(conflict);
                    }
                  }}
                  placeholder="e.g., Goa, Manali, Shimla"
                  className={formErrors.destination ? 'trippy-mates-input-error' : ''}
                />
                {formErrors.destination && (
                  <span className="trippy-mates-form-error">{formErrors.destination}</span>
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
                        setFormErrors({ ...formErrors, startDate: 'This date is not available. Please select a different date.' });
                        setBookingForm({ ...bookingForm, startDate: '' });
                        return;
                      }
                      
                      setBookingForm({ ...bookingForm, startDate: selectedDate });
                      setBookingConflict(null);
                      // Clear error when user selects date
                      if (formErrors.startDate) {
                        setFormErrors({ ...formErrors, startDate: '' });
                      }
                      // Always keep showing all unavailable dates - don't clear them
                      const captainUnavailableDates = unavailableDates[selectedCaptain?.id] || [];
                      setSelectedUnavailableDates(captainUnavailableDates);
                      
                      // Check availability when dates are selected (for validation only)
                      if (selectedDate && bookingForm.endDate && selectedCaptain) {
                        // Check availability (for validation, but don't update selectedUnavailableDates)
                        checkCaptainAvailability(selectedCaptain.id, selectedDate, bookingForm.endDate);
                        // Re-check conflict when dates change
                        if (bookingForm.destination) {
                          const conflict = checkBookingConflict(
                            selectedDate,
                            bookingForm.endDate,
                            bookingForm.destination
                          );
                          setBookingConflict(conflict);
                        }
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className={formErrors.startDate ? 'trippy-mates-input-error' : ''}
                    style={{
                      borderColor: formErrors.startDate ? '#dc2626' : (bookingForm.startDate && isDateUnavailable(bookingForm.startDate) ? '#dc2626' : undefined),
                      borderWidth: formErrors.startDate || (bookingForm.startDate && isDateUnavailable(bookingForm.startDate)) ? '2px' : undefined
                    }}
                  />
                  {formErrors.startDate && (
                    <span style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {formErrors.startDate}
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
                        setFormErrors({ ...formErrors, endDate: 'This date is not available. Please select a different date.' });
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
                          setFormErrors({ ...formErrors, endDate: `Selected range includes ${unavailableInRange.length} unavailable date(s). Please choose a different range.` });
                          setBookingForm({ ...bookingForm, endDate: '' });
                          return;
                        }
                      }
                      
                      setBookingForm({ ...bookingForm, endDate: selectedDate });
                      setBookingConflict(null);
                      // Clear error when user selects date
                      if (formErrors.endDate) {
                        setFormErrors({ ...formErrors, endDate: '' });
                      }
                      // Always keep showing all unavailable dates - don't clear them
                      const captainUnavailableDates = unavailableDates[selectedCaptain?.id] || [];
                      setSelectedUnavailableDates(captainUnavailableDates);
                      
                      // Check availability when dates are selected (for validation only)
                      if (bookingForm.startDate && selectedDate && selectedCaptain) {
                        // Check availability (for validation, but don't update selectedUnavailableDates)
                        checkCaptainAvailability(selectedCaptain.id, bookingForm.startDate, selectedDate);
                        // Re-check conflict when dates change
                        if (bookingForm.destination) {
                          const conflict = checkBookingConflict(
                            bookingForm.startDate,
                            selectedDate,
                            bookingForm.destination
                          );
                          setBookingConflict(conflict);
                        }
                      }
                    }}
                    min={bookingForm.startDate || new Date().toISOString().split('T')[0]}
                    className={formErrors.endDate ? 'trippy-mates-input-error' : ''}
                    style={{
                      borderColor: formErrors.endDate ? '#dc2626' : (bookingForm.endDate && isDateUnavailable(bookingForm.endDate) ? '#dc2626' : undefined),
                      borderWidth: formErrors.endDate || (bookingForm.endDate && isDateUnavailable(bookingForm.endDate)) ? '2px' : undefined
                    }}
                  />
                  {formErrors.endDate && (
                    <span style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {formErrors.endDate}
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
                  onChange={(e) => {
                    setBookingForm({ ...bookingForm, customerName: e.target.value });
                    // Clear error when user starts typing
                    if (formErrors.customerName) {
                      setFormErrors({ ...formErrors, customerName: '' });
                    }
                  }}
                  placeholder="Enter your full name"
                  className={formErrors.customerName ? 'trippy-mates-input-error' : ''}
                />
                {formErrors.customerName && (
                  <span className="trippy-mates-form-error">{formErrors.customerName}</span>
                )}
              </div>

              <div className="trippy-mates-booking-form-row">
                <div className="trippy-mates-booking-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={bookingForm.customerEmail}
                    onChange={(e) => {
                      setBookingForm({ ...bookingForm, customerEmail: e.target.value });
                      // Clear error when user starts typing
                      if (formErrors.customerEmail) {
                        setFormErrors({ ...formErrors, customerEmail: '' });
                      }
                    }}
                    placeholder="your@email.com"
                    className={formErrors.customerEmail ? 'trippy-mates-input-error' : ''}
                  />
                  {formErrors.customerEmail && (
                    <span className="trippy-mates-form-error">{formErrors.customerEmail}</span>
                  )}
                </div>
                <div className="trippy-mates-booking-form-group">
                  <label>Phone <span className="required">*</span></label>
                  <input
                    type="tel"
                    value={bookingForm.customerPhone}
                    onChange={(e) => {
                      setBookingForm({ ...bookingForm, customerPhone: e.target.value });
                      // Clear error when user starts typing
                      if (formErrors.customerPhone) {
                        setFormErrors({ ...formErrors, customerPhone: '' });
                      }
                    }}
                    placeholder="+91 1234567890"
                    className={formErrors.customerPhone ? 'trippy-mates-input-error' : ''}
                  />
                  {formErrors.customerPhone && (
                    <span className="trippy-mates-form-error">{formErrors.customerPhone}</span>
                  )}
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
                <button type="button" className="trippy-mates-booking-cancel-btn" onClick={() => {
                  setShowBookingModal(false);
                  setFormErrors({});
                }}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="trippy-mates-booking-submit-btn" 
                  disabled={bookingLoading || (bookingConflict && bookingConflict.conflict)}
                >
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

