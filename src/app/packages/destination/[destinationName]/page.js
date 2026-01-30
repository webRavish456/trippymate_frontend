'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { API_BASE_URL } from '@/lib/config';

const NO_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/No-Image-Placeholder-landscape.svg/1024px-No-Image-Placeholder-landscape.svg.png?20240614172314';

// Image Carousel Component
const ImageCarousel = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imagesArray = images && images.length > 0 ? images : [NO_IMAGE_URL];

  useEffect(() => {
    if (imagesArray.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imagesArray.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [imagesArray.length]);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        width: `${imagesArray.length * 100}%`,
        height: '100%',
        transform: `translateX(-${currentIndex * (100 / imagesArray.length)}%)`,
        transition: 'transform 0.8s ease-in-out'
      }}>
        {imagesArray.map((img, index) => (
          <img 
            key={index}
            src={img || NO_IMAGE_URL} 
            alt={`${title} - Image ${index + 1}`}
            onError={(e) => {
              e.target.src = NO_IMAGE_URL;
            }}
            style={{ 
              width: `${100 / imagesArray.length}%`, 
              height: '100%', 
              objectFit: 'cover',
              flexShrink: 0
            }}
          />
        ))}
      </div>
      
      {imagesArray.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 10
        }}>
          {imagesArray.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to image ${index + 1}`}
              style={{
                width: currentIndex === index ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: currentIndex === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                padding: 0,
                fontFamily: 'inherit'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Package Card Component (Reused from packages page)
const PackageCard = ({ pkg, router, favorites, toggleFavorite }) => {
  const formatDuration = (duration) => {
    if (!duration) return '';
    const match = duration.match(/(\d+)[ND]/);
    if (match) {
      const days = Number.parseInt(match[1], 10);
      return `${days}N/${days + 1}D`;
    }
    return duration;
  };

  const getPackageFeature = (pkg) => {
    if (pkg.packageType?.includes('Bike')) return 'Bike Included';
    if (pkg.packageType?.includes('Tea')) return 'Tea Gardens';
    if (pkg.packageType?.includes('Lake')) return 'Lake Activities';
    if (pkg.packageType?.includes('Heritage')) return 'Heritage Sites';
    if (pkg.category === 'Adventure') return 'Adventure Activities';
    return 'Local Captain';
  };

  return (
    <div
      tabIndex={0}
      onClick={() => router.push(`/packages/${pkg._id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/packages/${pkg._id}`);
        }
      }}
      aria-label={`View details for ${pkg.title}`}
      style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: '1px solid #f1f5f9',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
      }}
    >
      {/* Package Image */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '260px', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <ImageCarousel 
          images={pkg?.images} 
          title={pkg?.title || 'Package'}
        />
        
        {/* Verified Captain Badge */}
        <div style={{
          position: 'absolute',
          top: '1.25rem',
          left: '1.25rem',
          display: 'flex', 
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(29, 78, 216, 0.95)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '25px',
          fontSize: '0.8125rem',
          fontWeight: '700',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
          </svg>
          Verified Captain
        </div>
        
        {/* Heart Icon */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(pkg._id, e);
          }}
          aria-label={favorites.has(pkg._id) ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: 'none',
            padding: 0,
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg 
            width="22" 
            height="22" 
            viewBox="0 0 24 24" 
            fill={favorites.has(pkg._id) ? '#ef4444' : 'none'} 
            stroke={favorites.has(pkg._id) ? '#ef4444' : '#475569'} 
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Title and Details Overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
          padding: '1.5rem 1.25rem 1.25rem 1.25rem',
          color: 'white'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: 'white',
            margin: '0 0 0.75rem 0',
            lineHeight: '1.3'
          }}>
            {pkg.title}
          </h3>

          {/* Details Row */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {/* First Row: Duration and Group Trip */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              alignItems: 'center',
              whiteSpace: 'nowrap'
            }}>
              {pkg.duration && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: 'white', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
                  </svg>
                  <span>{formatDuration(pkg.duration)}</span>
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                color: 'white', 
                fontSize: '0.875rem',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 7H16.5c-.8 0-1.54.5-1.85 1.26l-1.85 4.74H12v8h2v-6h1.5l.5 6H20zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm1.5 2h-3C3.67 8 3 8.67 3 9.5V14h2v7h2v-7h2V9.5C9 8.67 8.33 8 7 8z" fill="currentColor"/>
                </svg>
                <span>Group Trip</span>
              </div>
            </div>
            
            {/* Second Row: Local Captain */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'white', 
              fontSize: '0.875rem',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
              </svg>
              <span>{getPackageFeature(pkg)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Package Info */}
      <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Description */}
        <p style={{ 
          fontSize: '1rem', 
          color: '#64748b', 
          lineHeight: '1.7',
          marginBottom: '1.5rem',
          flex: 1
        }}>
          {pkg.description || `${pkg.title}. Experience the best of ${pkg.destination || 'travel'} with verified guides.`}
        </p>

        {/* Price and Rating Row */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingTop: '0'
        }}>
          <div>
            <div style={{ 
              fontSize: '1.875rem', 
              fontWeight: '800', 
              color: '#1D4ED8',
              lineHeight: '1.2'
            }}>
              ₹{(pkg.price?.adult || 0).toLocaleString()} 
              <span style={{ 
                fontSize: '1rem', 
                fontWeight: '500', 
                color: '#94a3b8' 
              }}> /person</span>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.9375rem',
            fontWeight: '700',
            color: '#1e293b',
            backgroundColor: '#f8fafc',
            padding: '0.5rem 1rem',
            borderRadius: '12px'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24"/>
            </svg>
            {pkg.rating ? `${pkg.rating.toFixed(1)}` : '4.8'} 
            <span style={{ color: '#64748b', fontWeight: '500' }}>
              ({pkg.reviewsCount || Math.floor(Math.random() * 200) + 50})
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link 
            href={`/packages/${pkg._id}`}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              flex: 1,
              padding: '0.875rem 1.5rem',
              backgroundColor: 'transparent',
              color: '#1D4ED8',
              border: '2px solid #1D4ED8',
              borderRadius: '12px',
              fontSize: '0.9375rem',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#eff6ff';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            View Details
          </Link>
          <Link
            href={`/packages/${pkg._id}/book`}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              flex: 1,
              padding: '0.875rem 1.5rem',
              backgroundColor: '#1D4ED8',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.9375rem',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(29, 78, 216, 0.5)';
              e.currentTarget.style.backgroundColor = '#1e40af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 78, 216, 0.4)';
              e.currentTarget.style.backgroundColor = '#1D4ED8';
            }}
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function DestinationPackagesPage() {
  const params = useParams();
  const router = useRouter();
  const destinationName = params.destinationName;
  
  // Swiper refs for each category carousel
  const swiperRefs = useRef({});

  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  // Category mapping - map requirement categories to database categories
  const categoryMapping = {
    'Romantic': 'romantic',
    'Family': 'family',
    'Adventure': 'adventure',
    'Group': 'group',
    'Cultural': 'cultural',
    'Religious': 'religious'
  };

  // Category display names
  const categoryDisplayNames = {
    'Romantic': 'Romantic Trips',
    'Family': 'Family Trips',
    'Adventure': 'Adventure Tours',
    'Group': 'Group Trips',
    'Cultural': 'Cultural Tours',
    'Religious': 'Religious Tours'
  };

  // Categories to show
  const categoriesToShow = ['Romantic', 'Family', 'Adventure', 'Group', 'Cultural', 'Religious'];

  useEffect(() => {
    fetchPackages();
  }, [destinationName]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      
      // Convert URL slug back to destination name format
      const destinationQuery = destinationName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      // Fetch packages for this destination
      const response = await fetch(
        `${API_BASE_URL}/api/user/getPackages?page=1&limit=100&destination=${encodeURIComponent(destinationQuery)}`
      );
      const data = await response.json();

      if (data.status && data.data) {
        // Also filter client-side to ensure packages match the destination
        const filteredPackages = data.data.filter(pkg => {
          // Check destination field (case-insensitive)
          if (pkg.destination && 
              pkg.destination.toLowerCase().includes(destinationQuery.toLowerCase())) {
            return true;
          }
          
          // Check destinations array (if exists)
          if (pkg.destinations && Array.isArray(pkg.destinations)) {
            return pkg.destinations.some(dest => {
              const destName = dest.destinationName || dest.name || '';
              return destName.toLowerCase().includes(destinationQuery.toLowerCase());
            });
          }
          
          return false;
        });
        
        setAllPackages(filteredPackages);
      } else {
        setAllPackages([]);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setAllPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (packageId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(packageId)) {
        newFavorites.delete(packageId);
      } else {
        newFavorites.add(packageId);
      }
      return newFavorites;
    });
  };

  // Group packages by category
  const getPackagesByCategory = (categoryKey) => {
    const dbCategory = categoryMapping[categoryKey];
    if (!dbCategory) return [];
    
    return allPackages.filter(pkg => {
      // Check if package category matches
      if (pkg.category?.toLowerCase() === dbCategory.toLowerCase()) {
        return true;
      }
      // Also check if packageType contains the category name
      if (pkg.packageType?.toLowerCase().includes(categoryKey.toLowerCase())) {
        return true;
      }
      return false;
    });
  };

  // Capitalize destination name for display
  const capitalizeDestinationName = (name) => {
    if (!name) return '';
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const displayDestinationName = capitalizeDestinationName(destinationName);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header Section */}
      <section>
        <div style={{
          background: 'linear-gradient(135deg, #1D4ED8 0%, #1e40af 100%)',
          padding: '3rem 2rem',
          color: 'white',
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
            fontWeight: '800', 
            marginBottom: '1rem',
            textShadow: '0 4px 20px rgba(0,0,0,0.4)',
            letterSpacing: '-2px',
            lineHeight: '1.1',
            color: 'white'
          }}>
            Packages in {displayDestinationName}
          </h1>
          <p style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Discover curated travel experiences for {displayDestinationName}
          </p>
        </div>
      </section>

      {/* Category Carousels */}
      <section style={{ padding: '0 2rem 4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '1.25rem', color: '#64748b' }}>Loading packages...</div>
          </div>
        ) : (
          <>
            {categoriesToShow.map((categoryKey) => {
              const categoryPackages = getPackagesByCategory(categoryKey);
              const categoryDisplayName = categoryDisplayNames[categoryKey];
              
              // Skip if no packages for this category
              if (categoryPackages.length === 0) return null;

              const carouselId = `carousel-${categoryKey.toLowerCase()}`;

              return (
                <div key={categoryKey} style={{ marginBottom: '4rem' }}>
                  {/* Category Title */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ 
                      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
                      fontWeight: '700', 
                      color: '#1e3a8a',
                      marginBottom: '0.5rem'
                    }}>
                      {categoryDisplayName} in {displayDestinationName}
                    </h2>
                    <div style={{
                      width: '80px',
                      height: '4px',
                      backgroundColor: '#1D4ED8',
                      borderRadius: '2px'
                    }}></div>
                  </div>

                  {/* Carousel */}
                  <div style={{ position: 'relative', padding: '0 60px' }}>
                    <button 
                      className={`swiper-button-prev-${carouselId}`}
                      style={{
                        position: 'absolute',
                        left: '0',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1D4ED8';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 78, 216, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                      aria-label="Previous"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    <Swiper
                      onSwiper={(swiper) => {
                        swiperRefs.current[carouselId] = swiper;
                      }}
                      modules={[Navigation, Autoplay]}
                      spaceBetween={24}
                      slidesPerView={1}
                      loop={categoryPackages.length > 3}
                      autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }}
                      navigation={{
                        prevEl: `.swiper-button-prev-${carouselId}`,
                        nextEl: `.swiper-button-next-${carouselId}`,
                      }}
                      breakpoints={{
                        640: {
                          slidesPerView: 2,
                          spaceBetween: 20,
                        },
                        1024: {
                          slidesPerView: 3,
                          spaceBetween: 24,
                        },
                        1280: {
                          slidesPerView: 4,
                          spaceBetween: 24,
                        },
                      }}
                    >
                      {categoryPackages.map((pkg) => (
                        <SwiperSlide key={pkg._id}>
                          <PackageCard 
                            pkg={pkg} 
                            router={router}
                            favorites={favorites}
                            toggleFavorite={toggleFavorite}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <button 
                      className={`swiper-button-next-${carouselId}`}
                      style={{
                        position: 'absolute',
                        right: '0',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1D4ED8';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 78, 216, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                      aria-label="Next"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}

            {allPackages.length === 0 && !loading && (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <div style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: '500' }}>
                  No packages found for {displayDestinationName}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
