'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Grid } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// API Base URL
import { API_BASE_URL } from '@/lib/config';

// Constants
const DEFAULT_REVIEWS = [
  {
    userName: 'Priya Sharma',
    rating: 5,
    comment: 'Amazing experience! The place was beautiful and the trip was well organized. Highly recommend this destination for a peaceful getaway.',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    userName: 'Rahul Kumar',
    rating: 4,
    comment: 'Great destination with stunning views. The accommodations were comfortable and the local food was delicious. Would visit again!',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    userName: 'Anjali Patel',
    rating: 5,
    comment: 'Perfect for solo travelers! Felt safe throughout the trip. The guides were knowledgeable and friendly. Made some great memories here.',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    userName: 'Vikram Singh',
    rating: 4,
    comment: 'Beautiful location with rich culture. The activities were engaging and the overall experience was memorable. Worth every penny!',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper Functions
const isCompositeId = (id) => {
  const idParts = String(id).split('-');
  return idParts.length >= 2 && idParts[0].length === 24; // MongoDB ObjectId is 24 chars
};

const parseCompositeId = (id) => {
  const idParts = String(id).split('-');
  const parentId = idParts[0];
  const lastPart = idParts[idParts.length - 1];
  const isLastPartIndex = /^\d+$/.test(lastPart);
  const placeNameRaw = isLastPartIndex 
    ? idParts.slice(1, -1).join('-')
    : idParts.slice(1).join('-');
  const placeName = decodeURIComponent(placeNameRaw);
  return { parentId, placeName };
};

const findPlaceInDetails = (placesDetails, placeName) => {
  if (!Array.isArray(placesDetails)) return null;
  
  const searchName = placeName.trim().toLowerCase();
  return placesDetails.find(p => {
    if (!p?.placeName) return false;
    const pName = p.placeName.trim().toLowerCase();
    
    // Exact match
    if (pName === searchName) return true;
    
    // Normalized match (handle spaces and hyphens)
    const normalizedPName = pName.replace(/[-\s]+/g, ' ').trim();
    const normalizedSearchName = searchName.replace(/[-\s]+/g, ' ').trim();
    return normalizedPName === normalizedSearchName;
  });
};

const transformPlaceToDestination = (place, parent, destinationId) => ({
  _id: place._id || destinationId,
  id: place._id || destinationId,
  name: place.placeName,
  location: place.location || `${place.placeName}, ${parent.state || parent.region || ''}`,
  description: place.description || '',
  images: place.images || (place.image ? [place.image] : []),
  image: place.images?.[0] || place.image || '/explore-destination/default.png',
  rating: place.rating || 4.5,
  weatherInfo: place.weatherInfo || '',
  bestTimeToVisit: place.bestTimeToVisit || '',
  topAttractions: place.topAttractions || [],
  activities: place.activities || [],
  foodAndCuisine: place.food || [],
  hotels: place.hotels || [],
  eventsFestivals: place.eventsFestivals || [],
  nearbyDestinations: place.nearbyDestinations || [],
  reviews: DEFAULT_REVIEWS,
  isWishlisted: false,
  shareCount: 0
});

const addDefaultReviews = (destination) => {
  if (!destination.reviews || destination.reviews.length === 0) {
    destination.reviews = DEFAULT_REVIEWS;
  }
  return destination;
};

export default function DestinationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const destinationId = params.id;

  const [destinationDetails, setDestinationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [destinationPackages, setDestinationPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [packageCount, setPackageCount] = useState(0);

  // Swiper refs for carousels
  const attractionsSwiperRef = useRef(null);
  const activitiesSwiperRef = useRef(null);
  const hotelsSwiperRef = useRef(null);
  const foodSwiperRef = useRef(null);
  const nearbySwiperRef = useRef(null);

  useEffect(() => {
    const fetchDestinationDetails = async () => {
      if (!destinationId) return;
      
      setLoading(true);
      try {
        // Handle composite ID (from placesDetails)
        if (isCompositeId(destinationId)) {
          const { parentId, placeName } = parseCompositeId(destinationId);
          
          try {
            const parentRes = await fetch(`${API_BASE_URL}/api/admin/destination/${parentId}`);
            const parentDataRes = await parentRes.json();
            
            if (parentDataRes.status && parentDataRes.data?.placesDetails) {
              const place = findPlaceInDetails(parentDataRes.data.placesDetails, placeName);
              
              if (place) {
                const destination = transformPlaceToDestination(place, parentDataRes.data, destinationId);
                setDestinationDetails(destination);
                setIsWishlisted(false);
                setShareCount(0);
                setLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error('Error fetching parent data:', error);
          }
        }
        
        // Regular destination fetch
        const detailUrl = `${API_BASE_URL}/api/admin/destination/${destinationId}`.replace(/\?+$/, '');
        const detailRes = await fetch(detailUrl);
        const detailData = await detailRes.json();
        
        if (detailData.status && detailData.data) {
          const destination = addDefaultReviews(detailData.data);
          setDestinationDetails(destination);
          setIsWishlisted(destination.isWishlisted || false);
          setShareCount(destination.shareCount || 0);
        }
      } catch (error) {
        console.error('Error fetching destination details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinationDetails();
    fetchDestinationPackages();
  }, [destinationId]);

  const fetchDestinationPackages = async () => {
    if (!destinationId) return;
    
    // Skip package fetching for composite IDs (placesDetails don't have associated packages)
    if (isCompositeId(destinationId)) {
      setPackagesLoading(false);
      setDestinationPackages([]);
      setPackageCount(0);
      return;
    }
    
    setPackagesLoading(true);
    try {
      const params = new URLSearchParams({
        destinationId: destinationId,
        page: '1',
        limit: '6'
      });
      
      const response = await fetch(`${API_BASE_URL}/api/user/getPackages?${params}`);
      const data = await response.json();
      
      if (data.status) {
        setDestinationPackages(data.data || []);
        setPackageCount(data.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching destination packages:', error);
    } finally {
      setPackagesLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    // Disable wishlist for composite IDs (placesDetails)
    if (isCompositeId(destinationId)) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/destination/${destinationId}/wishlist`, {
        method: isWishlisted ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setIsWishlisted(!isWishlisted);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Fallback: update UI even if API fails
      setIsWishlisted(!isWishlisted);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: destinationDetails?.name || 'Destination',
          text: destinationDetails?.description || '',
          url: globalThis.location.href
        });
      } else {
        await navigator.clipboard.writeText(globalThis.location.href);
        alert('Link copied to clipboard!');
      }
      
      // Update share count (skip API call for composite IDs)
      if (!isCompositeId(destinationId)) {
        const response = await fetch(`${API_BASE_URL}/api/destination/${destinationId}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      
        if (response.ok) {
          setShareCount(prev => prev + 1);
        }
      } else {
        // For composite IDs, just update UI without API call
        setShareCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="destination-details-loading">
          <p>Loading destination details...</p>
        </div>
      </div>
    );
  }

  if (!destinationDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="destination-details-error">
          <p>Destination not found</p>
          <button onClick={() => router.push('/explore-destination')}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-zinc-50 font-sans dark:bg-white" style={{ width: '100%', maxWidth: '100%' }}>
      <main className="flex w-full flex-col items-center bg-white dark:bg-white" style={{ width: '100%', maxWidth: '100%' }}>
        <div className="destination-details-content" style={{ width: '100%', paddingTop: '4rem', paddingBottom: '2rem' }}>
          {/* Hero Section */}
          <section className="destination-hero-section" style={{paddingInline: '6rem'}}>
            <Grid container spacing={{xs: 3, md: 6}}>
              <Grid size={{xs: 12, md: 6}}>
                <div className="destination-hero-image-container">
                  {destinationDetails.images && destinationDetails.images.length > 1 && (
                    <div className="destination-hero-thumbnails">
                      {destinationDetails.images.slice(0, 5).map((img, idx) => (
                        <div 
                          key={idx} 
                          className={`destination-hero-thumbnail ${selectedImageIndex === idx ? 'active' : ''}`}
                          onClick={() => setSelectedImageIndex(idx)}
                        >
                          <img src={img} alt={`${destinationDetails.name} ${idx + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="destination-hero-image-wrapper">
                    <img 
                      src={destinationDetails.images?.[selectedImageIndex] || destinationDetails.image || '/explore-destination/default.png'} 
                      alt={destinationDetails.name}
                      className="destination-hero-image"
                    />
                    <div className="destination-hero-badge">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 1L12.5 6.5L18.5 7.5L14 11L14.5 17L10 14.5L5.5 17L6 11L1.5 7.5L7.5 6.5L10 1Z" fill="currentColor"/>
                      </svg>
                      {destinationDetails.category || destinationDetails.name || 'Destination'}
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid size={{xs: 12, md: 6}}>
                <div className="destination-hero-content-wrapper">
                  <div className="destination-hero-content">
                    <div className="destination-hero-header">
                    <h1 className="destination-hero-title">
                      Explore Beautiful <br/><span className="destination-hero-title-highlight">{destinationDetails.name}</span>
                    </h1>
                    <div className="destination-hero-actions">
                      <button 
                        className={`destination-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                        onClick={handleWishlistToggle}
                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        {isWishlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </button>
                      <button 
                        className="destination-share-btn"
                        onClick={handleShare}
                        title="Share"
                      >
                        <ShareIcon />
                        {shareCount > 0 && <span className="destination-share-count">{shareCount}</span>}
                      </button>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  {destinationDetails.rating && (
                    <div className="destination-hero-rating">
                      <div className="destination-rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 1L12.5 6.5L18.5 7.5L14 11L14.5 17L10 14.5L5.5 17L6 11L1.5 7.5L7.5 6.5L10 1Z" fill={star <= Math.round(destinationDetails.rating) ? "#FFD700" : "#E5E7EB"} stroke={star <= Math.round(destinationDetails.rating) ? "#FFD700" : "#E5E7EB"} strokeWidth="1"/>
                          </svg>
                        ))}
                      </div>
                      <span className="destination-rating-value">{destinationDetails.rating}</span>
                      {destinationDetails.reviewCount && (
                        <span className="destination-review-count">({destinationDetails.reviewCount} reviews)</span>
                      )}
                    </div>
                  )}
                  
                  {destinationDetails.location && (
                    <div className="destination-hero-location">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 10.75C11.2426 10.75 12.25 9.74264 12.25 8.5C12.25 7.25736 11.2426 6.25 10 6.25C8.75736 6.25 7.75 7.25736 7.75 8.5C7.75 9.74264 8.75736 10.75 10 10.75Z" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 2.5C8.4087 2.5 6.88258 3.13214 5.75736 4.25736C4.63214 5.38258 4 6.9087 4 8.5C4 12.25 10 17.5 10 17.5C10 17.5 16 12.25 16 8.5C16 6.9087 15.3679 5.38258 14.2426 4.25736C13.1174 3.13214 11.5913 2.5 10 2.5Z" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{destinationDetails.location}</span>
                    </div>
                  )}
                  {destinationDetails.description && (
                    <p className="destination-hero-description">{destinationDetails.description}</p>
                  )}
                  
                  {/* Weather Forecast in Hero Section */}
                  {destinationDetails.weatherInfo && (
                    <div className="destination-hero-weather">
                      <div className="destination-hero-weather-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h4 className="destination-hero-weather-label">Weather Forecast</h4>
                      <p className="destination-hero-weather-text">{destinationDetails.weatherInfo}</p>
                    </div>
                  )}
                  
                  {/* Best Time to Visit in Content */}
                  {destinationDetails.bestTimeToVisit && (
                    <div className="destination-hero-best-time">
                      <div className="destination-hero-best-time-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 14H8.01M12 14H12.01M16 14H16.01M8 18H8.01M12 18H12.01M16 18H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h4 className="destination-hero-best-time-label">Best Time to Visit</h4>
                      <p className="destination-hero-best-time-text">{destinationDetails.bestTimeToVisit}</p>
                    </div>
                  )}
                  
                    <div className="destination-hero-buttons">
                      <button 
                        className="destination-hero-btn-primary"
                        onClick={() => {
                          // Navigate to first package detail page if packages exist
                          if (destinationPackages && destinationPackages.length > 0) {
                            const firstPackageId = destinationPackages[0]._id || destinationPackages[0].id;
                            if (firstPackageId) {
                              router.push(`/packages/${firstPackageId}`);
                            } else {
                              // If no package ID, navigate to packages list with destination filter
                              router.push(`/packages?destination=${destinationId}`);
                            }
                          } else {
                            // If no packages loaded yet, navigate to packages list with destination filter
                            router.push(`/packages?destination=${destinationId}`);
                          }
                        }}
                      >
                        View Packages
                      </button>
                      <button 
                        className="destination-hero-btn-secondary"
                        onClick={() => router.push(`/packages?destination=${destinationId}`)}
                      >
                        Plan My Trip
                      </button>
                    </div>
                  </div>
                </div>
              </Grid>
            </Grid>
          </section>

          {/* Top Attractions Section - With Carousel */}
          {destinationDetails.topAttractions && destinationDetails.topAttractions.length > 0 && (
            <section className="destination-details-section" style={{paddingInline: '6rem'}}>
              <div className="destination-section-header">
              <h2 className="destination-details-section-title">Top Attractions</h2>
                <p className="destination-section-subtitle">Must-visit places in {destinationDetails.name}</p>
              </div>
              <div className="destination-carousel-wrapper">
                <button 
                  className="destination-carousel-nav destination-carousel-nav-left swiper-button-prev-attractions" 
                  aria-label="Previous"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <Swiper
                  onSwiper={(swiper) => {
                    attractionsSwiperRef.current = swiper;
                  }}
                  modules={[Navigation, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                  }}
                  navigation={{
                    prevEl: '.swiper-button-prev-attractions',
                    nextEl: '.swiper-button-next-attractions',
                  }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  loop={destinationDetails.topAttractions.length > 3}
                  className="destination-attractions-carousel"
                >
                {destinationDetails.topAttractions.map((attraction, index) => (
                    <SwiperSlide key={index}>
                      <div className="destination-attraction-card-new">
                        <div className="destination-attraction-image-wrapper-new">
                          <img 
                            src={attraction.image || '/explore-destination/default.png'} 
                            alt={attraction.name}
                            className="destination-attraction-image-new"
                          />
                          <div className="destination-attraction-overlay-new"></div>
                          <div className="destination-attraction-badge-new">Must Visit</div>
                          {(attraction.rating || 4.5) && (
                            <div className="destination-attraction-rating-new">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 1L10 5.5L15 6.5L11.5 10L12.5 15L8 12.5L3.5 15L4.5 10L1 6.5L6 5.5L8 1Z" fill="#FFD700"/>
                              </svg>
                              <span>{attraction.rating || 4.5}</span>
                            </div>
                          )}
                          <div className="destination-attraction-title-overlay-new">
                            <h3 className="destination-attraction-name-new">{attraction.name}</h3>
                          </div>
                        </div>
                        <div className="destination-attraction-content-new">
                          {attraction.description && (
                            <p className="destination-attraction-description-new">{attraction.description}</p>
                          )}
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <button 
                  className="destination-carousel-nav destination-carousel-nav-right swiper-button-next-attractions" 
                  aria-label="Next"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </section>
          )}

          {/* Activities Section - With Carousel */}
          {destinationDetails.activities && destinationDetails.activities.length > 0 && (
            <section className=" destination-activities-section-new" style={{paddingInline: '6rem'}} >
              <div className="destination-section-header">
                <h2 className="destination-details-section-title">Activities & Adventures</h2>
                <p className="destination-section-subtitle">Exciting things to do in {destinationDetails.name}</p>
              </div>
              <div className="destination-carousel-wrapper">
                <button 
                  className="destination-carousel-nav destination-carousel-nav-left swiper-button-prev-activities" 
                  aria-label="Previous"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <Swiper
                  onSwiper={(swiper) => {
                    activitiesSwiperRef.current = swiper;
                  }}
                  modules={[Navigation, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                  }}
                  navigation={{
                    prevEl: '.swiper-button-prev-activities',
                    nextEl: '.swiper-button-next-activities',
                  }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  loop={destinationDetails.activities.length > 3}
                  className="destination-activities-carousel"
                >
                {destinationDetails.activities.map((activity, index) => (
                    <SwiperSlide key={index}>
                      <div className="destination-activity-card-new">
                        <div className="destination-activity-image-wrapper-new">
                          <img 
                            src={activity.image || '/explore-destination/default.png'} 
                            alt={activity.name}
                            className="destination-activity-image-new"
                          />
                          <div className="destination-activity-overlay-new"></div>
                          {activity.type && (
                            <div className="destination-activity-badge-new">
                              {activity.type}
                            </div>
                          )}
                          <div className="destination-activity-rating-new">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 1L10 5.5L15 6.5L11.5 10L12.5 15L8 12.5L3.5 15L4.5 10L1 6.5L6 5.5L8 1Z" fill="#FFD700"/>
                            </svg>
                            <span>{activity.rating || 4.5}</span>
                          </div>
                          <div className="destination-activity-title-overlay-new">
                            <h3 className="destination-activity-name-new">{activity.name}</h3>
                            <div className="destination-activity-details-overlay-new">
                              <div className="destination-activity-details-row-new">
                                {activity.duration && (
                                  <div className="destination-activity-detail-item-overlay-new">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                      <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    <span>{activity.duration}</span>
                                  </div>
                                )}
                                {activity.priceRange && (
                                  <div className="destination-activity-detail-item-overlay-new">
                                    <span className="destination-activity-price-icon-new">₹</span>
                                    <span>
                                      {typeof activity.priceRange === 'string'
                                        ? activity.priceRange.replace('per person', '/ person')
                                        : activity.priceRange}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {activity.location && (
                                <div className="destination-activity-detail-item-overlay-new destination-activity-location-item-new">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
                                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                                  </svg>
                                  <span>{activity.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="destination-activity-content-new">
                          {activity.description && (
                            <p className="destination-activity-description-new">{activity.description}</p>
                          )}
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <button 
                  className="destination-carousel-nav destination-carousel-nav-right swiper-button-next-activities" 
                  aria-label="Next"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </section>
          )}

          {/* Hotels Section - With Carousel */}
          {destinationDetails.hotels && destinationDetails.hotels.length > 0 && (
            <section className=" destination-hotels-section" style={{paddingInline: '6rem'}} >
              <div className="destination-section-header">
                <h2 className="destination-details-section-title">Hotels & Accommodations</h2>
                <p className="destination-section-subtitle">Best places to stay in {destinationDetails.name}</p>
              </div>
              <div className="destination-carousel-wrapper">
                <button 
                  className="destination-carousel-nav destination-carousel-nav-left swiper-button-prev-hotels" 
                  aria-label="Previous"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <Swiper
                  onSwiper={(swiper) => {
                    hotelsSwiperRef.current = swiper;
                  }}
                  modules={[Navigation, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                  }}
                  navigation={{
                    prevEl: '.swiper-button-prev-hotels',
                    nextEl: '.swiper-button-next-hotels',
                  }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  loop={destinationDetails.hotels.length > 3}
                  className="destination-hotels-carousel"
                >
                {destinationDetails.hotels.map((hotel, index) => (
                    <SwiperSlide key={index}>
                      <div className="destination-hotel-card-new">
                        <div className="destination-hotel-image-wrapper-new">
                          <img 
                            src={hotel.image || '/explore-destination/default.png'} 
                            alt={hotel.name}
                            className="destination-hotel-image-new"
                          />
                          <div className="destination-hotel-overlay-new"></div>
                          {hotel.rating && (
                            <div className="destination-hotel-rating-new">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 1L10 5.5L15 6.5L11.5 10L12.5 15L8 12.5L3.5 15L4.5 10L1 6.5L6 5.5L8 1Z" fill="#FFD700"/>
                              </svg>
                              <span>{hotel.rating}</span>
                            </div>
                          )}
                          <div className="destination-hotel-title-overlay-new">
                            <h3 className="destination-hotel-name-new">{hotel.name}</h3>
                            {hotel.priceRange && (
                              <div className="destination-hotel-price-overlay-new">
                                <span className="destination-hotel-price-label-new">Starting from</span>
                                <span className="destination-hotel-price-value-new">{hotel.priceRange}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="destination-hotel-content-new">
                          {hotel.location && (
                            <div className="destination-hotel-location-new">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              <span>{hotel.location}</span>
                            </div>
                          )}
                          {hotel.description && (
                            <p className="destination-hotel-description-new">{hotel.description}</p>
                          )}
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <button 
                  className="destination-carousel-nav destination-carousel-nav-right swiper-button-next-hotels" 
                  aria-label="Next"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </section>
          )}

          {/* Food & Cuisine Section - With Carousel */}
          {destinationDetails.foodAndCuisine && destinationDetails.foodAndCuisine.length > 0 && (
            <section className=" destination-food-section" style={{paddingInline: '6rem'}} >
              <div className="destination-section-header">
                <h2 className="destination-details-section-title">Food & Local Cuisine</h2>
                <p className="destination-section-subtitle">Taste the authentic flavors of {destinationDetails.name}</p>
              </div>
              <div className="destination-carousel-wrapper">
                <button 
                  className="destination-carousel-nav destination-carousel-nav-left swiper-button-prev-food" 
                  aria-label="Previous"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <Swiper
                  onSwiper={(swiper) => {
                    foodSwiperRef.current = swiper;
                  }}
                  modules={[Navigation, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                  }}
                  navigation={{
                    prevEl: '.swiper-button-prev-food',
                    nextEl: '.swiper-button-next-food',
                  }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  loop={destinationDetails.foodAndCuisine.length > 3}
                  className="destination-food-carousel"
                >
                {destinationDetails.foodAndCuisine.map((food, index) => (
                    <SwiperSlide key={index}>
                      <div className="destination-food-card-new">
                        <div className="destination-food-image-wrapper-new">
                          <img 
                            src={food.image || '/explore-destination/default.png'} 
                            alt={food.name}
                            className="destination-food-image-new"
                          />
                          <div className="destination-food-overlay-new"></div>
                          {food.type && (
                            <div className={`destination-food-badge-new ${food.type.toLowerCase().replace('-', '')}`}>
                              {food.type}
                            </div>
                          )}
                          <div className="destination-food-title-overlay-new">
                            <h3 className="destination-food-name-new">{food.name}</h3>
                            {food.location && (
                              <div className="destination-food-location-overlay-new">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
                                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                <span>{food.location}</span>
                              </div>
                            )}
                            <div className="destination-food-tags-overlay-new">
                              {food.vegType && (
                                <span className="destination-food-tag-overlay-new veg">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                  </svg>
                                  Veg: {food.vegType}
                                </span>
                              )}
                              {food.nonVegType && (
                                <span className="destination-food-tag-overlay-new nonveg">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                  </svg>
                                  Non-Veg: {food.nonVegType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="destination-food-content-new">
                          {food.description && (
                            <p className="destination-food-description-new">{food.description}</p>
                          )}
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <button 
                  className="destination-carousel-nav destination-carousel-nav-right swiper-button-next-food" 
                  aria-label="Next"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </section>
          )}

          {/* Nearby Destinations Section - With Carousel */}
          {destinationDetails.nearbyDestinations && destinationDetails.nearbyDestinations.length > 0 && (
            <section className=" destination-nearby-section" style={{paddingInline: '6rem'}}   >
              <div className="destination-section-header">
              <h2 className="destination-details-section-title">Nearby Destinations</h2>
                <p className="destination-section-subtitle">Explore places close to {destinationDetails.name}</p>
              </div>
              <div className="destination-carousel-wrapper">
                <button 
                  className="destination-carousel-nav destination-carousel-nav-left swiper-button-prev-nearby" 
                  aria-label="Previous"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <Swiper
                  onSwiper={(swiper) => {
                    nearbySwiperRef.current = swiper;
                  }}
                  modules={[Navigation, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                  }}
                  navigation={{
                    prevEl: '.swiper-button-prev-nearby',
                    nextEl: '.swiper-button-next-nearby',
                  }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  loop={destinationDetails.nearbyDestinations.length > 3}
                  className="destination-nearby-carousel"
                >
                {destinationDetails.nearbyDestinations.map((nearby, index) => (
                    <SwiperSlide key={index}>
                      <div className="destination-nearby-card-new" onClick={() => router.push(`/explore-destination/${nearby._id || index}`)}>
                        <div className="destination-nearby-image-wrapper-new">
                          <img 
                            src={nearby.image || '/explore-destination/default.png'} 
                            alt={nearby.name}
                            className="destination-nearby-image-new"
                          />
                          <div className="destination-nearby-overlay-new"></div>
                          {nearby.distance && (
                            <div className="destination-nearby-distance-new">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              <span>{nearby.distance}</span>
                            </div>
                          )}
                          <div className="destination-nearby-title-overlay-new">
                            <h3 className="destination-nearby-name-new">{nearby.name}</h3>
                          </div>
                        </div>
                        <div className="destination-nearby-content-new">
                          {nearby.description && (
                            <p className="destination-nearby-description-new">{nearby.description}</p>
                          )}
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <button 
                  className="destination-carousel-nav destination-carousel-nav-right swiper-button-next-nearby" 
                  aria-label="Next"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </section>
          )}

          {/* Destination Packages Section */}
          {packageCount > 0 && (
            <section className="destination-details-section" style={{paddingInline: '6rem'}}>
              <div className="destination-section-header">
                <h2 className="destination-details-section-title">Packages for {destinationDetails.name}</h2>
                <p className="destination-section-subtitle">
                  {packageCount} {packageCount === 1 ? 'package' : 'packages'} available
                </p>
              </div>
              
              {packagesLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>Loading packages...</p>
                </div>
              ) : destinationPackages.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                  gap: '1.5rem',
                  marginTop: '1.5rem'
                }}>
                  {destinationPackages.map((pkg) => (
                    <div
                      key={pkg._id}
                      onClick={() => router.push(`/packages/${pkg._id}`)}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      }}
                    >
                      {pkg.images && pkg.images.length > 0 && (
                        <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                          <img 
                            src={pkg.images[0]} 
                            alt={pkg.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div style={{ padding: '1.5rem' }}>
                        <h3 style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '600', 
                          color: '#1f2937',
                          marginBottom: '0.75rem'
                        }}>
                          {pkg.title}
                        </h3>
                        {pkg.packageType && (
                          <div style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            marginBottom: '0.75rem'
                          }}>
                            {pkg.packageType}
                          </div>
                        )}
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          {pkg.duration && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.9 1.57h1.52c-.01-1.28-.87-2.3-2.54-2.75V4H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.23-1.64H8.04c0 1.23.95 2.19 2.48 2.52V16h2.21v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
                              </svg>
                              {pkg.duration}
                            </div>
                          )}
                          {pkg.destination && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                              </svg>
                              {pkg.source && `${pkg.source} → `}{pkg.destination}
                            </div>
                          )}
                        </div>
                        {pkg.price && (
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            paddingTop: '1rem',
                            borderTop: '1px solid #e5e7eb'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Starting from</div>
                              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1D4ED8' }}>
                                ₹{pkg.price.adult?.toLocaleString() || '0'}
                              </div>
                            </div>
                            <button style={{
                              padding: '0.75rem 1.5rem',
                              backgroundColor: '#1D4ED8',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}>
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              
              {packageCount > 6 && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button
                    onClick={() => router.push(`/packages?destination=${destinationId}`)}
                    style={{
                      padding: '0.75rem 2rem',
                      backgroundColor: '#1D4ED8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    View All {packageCount} Packages
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Travel Solo, Not Alone Section */}
          <section className="destination-solo-travel-section">
            <div 
              className="destination-solo-travel-container"
            >
              <div className="destination-solo-travel-overlay"></div>
              
              <div className="destination-solo-travel-header">
                <h2 className="destination-solo-travel-title">
                  Travel <span className="destination-solo-travel-highlight">Solo</span>, Not Alone
                </h2>
                <p className="destination-solo-travel-subtitle">
                  Your safety is our priority. All Captains and members are verified, and our 24/7 team is ready to assist wherever you travel in India.
                </p>
                <div className="destination-solo-travel-divider"></div>
              </div>
              
              <div className="destination-solo-travel-illustration-area">
                {/* Center Traveler Image */}
                <div className="destination-solo-traveler-image">
                  <img 
                    src="/explore-destination/travel-alone.png" 
                    alt="Solo Traveler"
                    className="destination-solo-traveler-img"
                  />
                </div>
                
                {/* Feature Boxes Positioned Around Illustration */}
                <div className="destination-solo-feature-card destination-solo-feature-top-left">
                  <div className="destination-solo-feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="destination-solo-feature-content">
                    <h3 className="destination-solo-feature-title">SOS & Emergency Helpline Support</h3>
                    <p className="destination-solo-feature-description">24/7 safety assistance whenever you need.</p>
                  </div>
                </div>
                
                <div className="destination-solo-feature-card destination-solo-feature-top-right">
                  <div className="destination-solo-feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="destination-solo-feature-content">
                    <h3 className="destination-solo-feature-title">Female-Friendly Features</h3>
                    <p className="destination-solo-feature-description">Designed to ensure comfort and safety for solo female travellers.</p>
                  </div>
                </div>
                
                <div className="destination-solo-feature-card destination-solo-feature-bottom-left">
                  <div className="destination-solo-feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="destination-solo-feature-content">
                    <h3 className="destination-solo-feature-title">Transparent Refund Policies</h3>
                    <p className="destination-solo-feature-description">Hassle-free and clear refund terms for all trips.</p>
                  </div>
                </div>
                
                <div className="destination-solo-feature-card destination-solo-feature-bottom-right">
                  <div className="destination-solo-feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="destination-solo-feature-content">
                    <h3 className="destination-solo-feature-title">Verified IDs & Background Checks</h3>
                    <p className="destination-solo-feature-description">Every traveller and captain undergoes strict verification.</p>
                  </div>
                </div>
                
                <div className="destination-solo-travel-cta">
                  <button className="destination-solo-travel-btn">
                    Learn About Our Safety Process
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Reviews Section */}
          <section className="destination-details-section" style={{paddingInline: '6rem'}}>
            <div className="destination-reviews-header">
              <h2 className="destination-details-section-title">Customer Reviews</h2>
              <a href="#" className="destination-reviews-view-all">View all Reviews ({destinationDetails.reviews?.length || 0})</a>
            </div>
         
            <div className="destination-reviews-container">
              {destinationDetails.reviews && destinationDetails.reviews.length > 0 ? (
                <>
                  {/* Ratings Summary Section */}
                  <Grid container spacing={{xs: 3, md: 4}}>
                    <Grid size={{xs: 12, md: 6}}>
                      <div className="destination-reviews-summary">
                    <div className="destination-reviews-average">
                      <div className="destination-reviews-average-rating">
                        {(() => {
                          const avgRating = destinationDetails.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / destinationDetails.reviews.length;
                          return avgRating.toFixed(1);
                        })()}
                      </div>
                      <div className="destination-reviews-average-stars">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const avgRating = destinationDetails.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / destinationDetails.reviews.length;
                          const filled = star <= Math.floor(avgRating);
                          const halfFilled = star === Math.ceil(avgRating) && avgRating % 1 >= 0.3 && avgRating % 1 < 0.8;
                          return (
                            <svg key={star} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                                fill={filled ? "#22c55e" : halfFilled ? "#22c55e" : "#e5e7eb"} 
                                stroke={filled ? "#22c55e" : halfFilled ? "#22c55e" : "#e5e7eb"} 
                                strokeWidth="1"
                                opacity={halfFilled ? "0.5" : "1"}
                              />
                            </svg>
                          );
                        })}
                      </div>
                    </div>
                    <div className="destination-reviews-distribution">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = destinationDetails.reviews.filter(r => Math.round(r.rating || 0) === rating).length;
                        const total = destinationDetails.reviews.length;
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        const maxCount = Math.max(...[5, 4, 3, 2, 1].map(r => destinationDetails.reviews.filter(rev => Math.round(rev.rating || 0) === r).length));
                        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        return (
                          <div key={rating} className="destination-reviews-distribution-item">
                            <span className="destination-reviews-distribution-rating">{rating} star</span>
                            <div className="destination-reviews-distribution-bar-wrapper">
                              <div 
                                className="destination-reviews-distribution-bar" 
                                style={{ 
                                  width: `${barWidth}%`,
                                  backgroundColor: rating >= 4 ? '#22c55e' : rating >= 3 ? '#f59e0b' : '#ef4444'
                                }}
                              ></div>
                            </div>
                            <span className="destination-reviews-distribution-count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                      </div>
                    </Grid>
                  </Grid>

                  {/* Reviews List */}
                  {/* Mobile Swiper Carousel */}
                  <div className="destination-reviews-list-mobile">
                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={16}
                      slidesPerView={1}
                      breakpoints={{
                        640: { slidesPerView: 1.5 },
                        768: { slidesPerView: 2 }
                      }}
                      className="destination-reviews-swiper"
                    >
                      {destinationDetails.reviews.slice(0, 5).map((review, index) => (
                        <SwiperSlide key={index}>
                          <div className="destination-review-card">
                            <div className="destination-review-card-header">
                              <h3 className="destination-review-title">{review.comment?.substring(0, 60) || 'Excellent service they provide to us. must recomrecommended company'}</h3>
                              <div className="destination-review-rating-badge">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
                                </svg>
                                <span>{review.rating || 4.5}</span>
                              </div>
                            </div>
                            <p className="destination-review-text">
                              {review.comment || 'The services was very nice and clean process i really liked the services they gave me.'}
                              <a href="#" className="destination-review-read-more">....Read more</a>
                            </p>
                            <div className="destination-review-images">
                              {[1, 2, 3, 4, 5].map((img) => (
                                <div key={img} className="destination-review-image">
                                  <img 
                                    src={`https://images.unsplash.com/photo-1556912172-45b7abe8b7c4?w=100&h=100&fit=crop&q=80`} 
                                    alt={`Review ${index + 1} image ${img}`}
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="destination-review-footer">
                              <span className="destination-review-time">
                                {(() => {
                                  if (!review.date) return '9 months ago';
                                  const reviewDate = new Date(review.date);
                                  const now = new Date();
                                  const monthsDiff = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24 * 30));
                                  if (monthsDiff < 1) return 'Recently';
                                  if (monthsDiff === 1) return '1 month ago';
                                  return `${monthsDiff} months ago`;
                                })()}
                              </span>
                              <span className="destination-review-separator">-</span>
                              <span className="destination-review-author">{review.userName || 'Sanjeeb Ranasi'}</span>
                              <span className="destination-review-location">(Bhubaneswar)</span>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  {/* Desktop Grid Layout */}
                  <Grid container spacing={{xs: 3, md: 4}} className="destination-reviews-list-desktop">
                    {destinationDetails.reviews.slice(0, 5).map((review, index) => (
                      <Grid key={index} size={{xs: 12, md: 6}}>
                        <div className="destination-review-card">
                        <div className="destination-review-card-header">
                          <h3 className="destination-review-title">{review.comment?.substring(0, 60) || 'Excellent service they provide to us. must recomrecommended company'}</h3>
                          <div className="destination-review-rating-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
                            </svg>
                            <span>{review.rating || 4.5}</span>
                          </div>
                        </div>
                        <p className="destination-review-text">
                          {review.comment || 'The services was very nice and clean process i really liked the services they gave me.'}
                          <a href="#" className="destination-review-read-more">....Read more</a>
                        </p>
                        <div className="destination-review-images">
                          {[1, 2, 3, 4, 5].map((img) => (
                            <div key={img} className="destination-review-image">
                              <img 
                                src={`https://images.unsplash.com/photo-1556912172-45b7abe8b7c4?w=100&h=100&fit=crop&q=80`} 
                                alt={`Review ${index + 1} image ${img}`}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="destination-review-footer">
                          <span className="destination-review-time">
                            {(() => {
                              if (!review.date) return '9 months ago';
                              const reviewDate = new Date(review.date);
                              const now = new Date();
                              const monthsDiff = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24 * 30));
                              if (monthsDiff < 1) return 'Recently';
                              if (monthsDiff === 1) return '1 month ago';
                              return `${monthsDiff} months ago`;
                            })()}
                          </span>
                          <span className="destination-review-separator">-</span>
                          <span className="destination-review-author">{review.userName || 'Sanjeeb Ranasi'}</span>
                          <span className="destination-review-location">(Bhubaneswar)</span>
                        </div>
                      </div>
                      </Grid>
                    ))}
                  </Grid>
                </>
              ) : (
                <div className="destination-reviews-empty">
                  <p>No reviews yet. Be the first to review this destination!</p>
                </div>
              )}
            </div>
           
          </section>
        </div>
      </main>
    </div>
  );
}

