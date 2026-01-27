'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Grid, useMediaQuery } from "@mui/material";

import { API_BASE_URL } from '@/lib/config';

const NO_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/No-Image-Placeholder-landscape.svg/1024px-No-Image-Placeholder-landscape.svg.png?20240614172314';

// Skeleton Loader Components
const PackageCardSkeleton = () => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <div style={{
      width: '100%',
      height: '260px',
      backgroundColor: '#e2e8f0',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }} />
    <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        height: '24px',
        width: '80%',
        backgroundColor: '#e2e8f0',
        borderRadius: '4px',
        marginBottom: '12px',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }} />
      <div style={{
        height: '16px',
        width: '100%',
        backgroundColor: '#e2e8f0',
        borderRadius: '4px',
        marginBottom: '8px',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }} />
      <div style={{
        height: '16px',
        width: '90%',
        backgroundColor: '#e2e8f0',
        borderRadius: '4px',
        marginBottom: '1.5rem',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }} />
      <div style={{
        height: '40px',
        width: '100%',
        backgroundColor: '#e2e8f0',
        borderRadius: '12px',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }} />
    </div>
  </div>
);

const PackagesSkeleton = () => (
  <Grid container spacing={2} style={{ margin: '0rem 6rem' }}>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Grid size={{xs: 12, sm: 6, md: 4}} key={i}>
        <PackageCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

// Image Carousel Component with Auto-scroll
const ImageCarousel = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imagesArray = images && images.length > 0 ? images : [NO_IMAGE_URL];

  useEffect(() => {
    if (imagesArray.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imagesArray.length);
      }, 3000); // Change image every 3 seconds

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
      
      {/* Image Indicators */}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(index);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function PackagesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const destinationId = searchParams.get('destination');
  const category = searchParams.get('category');
  const packageType = searchParams.get('packageType');

  const [packages, setPackages] = useState([]);
  const [packageCounts, setPackageCounts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [selectedPackageType, setSelectedPackageType] = useState(packageType || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [popularPackages, setPopularPackages] = useState([]);

  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchPackages();
    fetchPopularPackages();
  }, [destinationId, selectedCategory, selectedPackageType, searchQuery]);

  // All packages data is now fetched from API - no dummy data

  const fetchPackages = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '50');
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (destinationId) {
        params.append('destinationId', destinationId);
      }
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (selectedPackageType !== 'all') {
        params.append('packageType', selectedPackageType);
      }

      const response = await fetch(`${API_BASE_URL}/api/user/getPackages?${params.toString()}`);
      const data = await response.json();

      if (data.status && data.data) {
        // Transform API data to match frontend format
        const transformedPackages = data.data.map(pkg => ({
          _id: pkg._id,
          title: pkg.title,
          description: pkg.overview || pkg.description || '',
          duration: pkg.duration || '',
          destination: pkg.destination || '',
          source: pkg.source || '',
          category: pkg.category || 'Other',
          packageType: pkg.packageType || '',
          price: pkg.price || { adult: 0 },
          rating: pkg.rating || 4.5,
          reviewsCount: pkg.reviewsCount || 0,
          images: pkg.images || [],
          highlights: pkg.highlights || [],
          itinerary: pkg.itinerary || [],
          inclusions: pkg.inclusions || [],
          exclusions: pkg.exclusions || []
        }));
        
        setPackages(transformedPackages);
        setTotalCount(data.totalCount || transformedPackages.length);
        
        // Set package counts from API
        if (data.packageCounts && data.packageCounts.length > 0) {
          setPackageCounts(data.packageCounts);
        } else {
          // Fallback: calculate counts from packages
          const counts = transformedPackages.reduce((acc, pkg) => {
            const type = pkg.packageType || pkg.category;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});
          
          setPackageCounts(Object.entries(counts).map(([_id, count]) => ({ _id, count })));
        }
      } else {
        // No packages found
        setPackages([]);
        setTotalCount(0);
        setPackageCounts([]);
      }
      
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages([]);
      setTotalCount(0);
      setPackageCounts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularPackages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/getPackages?page=1&limit=6&isPopular=true`);
      const data = await response.json();

      if (data.status && data.data && data.data.length > 0) {
        setPopularPackages(data.data);
      } else {
        setPopularPackages([]);
      }
    } catch (error) {
      console.error('Error fetching popular packages:', error);
      setPopularPackages([]);
    }
  };

  // Categories are now dynamically generated from packageCounts
  const getCategories = () => {
    const categoryLabels = {
      'adventure': { label: 'Adventure', description: 'Thrilling experiences for adrenaline seekers' },
      'family': { label: 'Family', description: 'Perfect trips for the whole family' },
      'honeymoon': { label: 'Honeymoon', description: 'Romantic getaways for couples' },
      'holiday': { label: 'Holiday', description: 'Relaxing holiday packages' },
      'cultural': { label: 'Cultural', description: 'Explore rich cultural heritage' },
      'religious': { label: 'Religious', description: 'Spiritual journeys and pilgrimages' },
      'wildlife': { label: 'Wildlife', description: 'Wildlife safaris and nature tours' },
      'beach': { label: 'Beach', description: 'Sun, sand, and sea adventures' },
      'hill-station': { label: 'Hill Station', description: 'Scenic mountain retreats' },
      'weekend': { label: 'Weekend Getaways', description: 'Quick escapes for weekend relaxation' },
      'other': { label: 'Other', description: 'Other travel packages' }
    };

    const baseCategories = [{ value: 'all', label: 'All Categories' }];
    
    // Add categories from packageCounts with dynamic counts
    const dynamicCategories = packageCounts
      .filter(pc => pc._id && pc.count > 0)
      .map(pc => {
        const categoryInfo = categoryLabels[pc._id] || { label: pc._id, description: '' };
        return {
          value: pc._id,
          label: categoryInfo.label,
          count: pc.count,
          description: categoryInfo.description
        };
      })
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return [...baseCategories, ...dynamicCategories];
  };
  
  const categories = getCategories();

  // All destinations are now fetched from API - no static data

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

  const formatDuration = (duration) => {
    if (!duration) return '';
    // Extract days from duration string like "3N/4D" or "3 days"
    const match = duration.match(/(\d+)[ND]/);
    if (match) {
      const days = parseInt(match[1]);
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
    <div style={{ minHeight: '100%' }}>
         <section>
      <div style={{
        background: 'linear-gradient(135deg, #1D4ED8 0%, #1e40af 100%)',
        padding: '4rem 6rem',
        color: 'white',
        textAlign: 'center',
        marginBottom: '3rem',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: '800', 
          marginBottom: '1.5rem',
          textShadow: '0 4px 20px rgba(0,0,0,0.4)',
          letterSpacing: '-2px',
          lineHeight: '1.1',
          color: 'white'
        }}>
          Discover Amazing Packages
        </h1>
        <p style={{ 
          fontSize: '1.75rem', 
          color: 'white',
          maxWidth: '700px',
          margin: '0 auto 1.5rem auto',
          letterSpacing: '3px',
          lineHeight: '1.6',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          fontWeight: '300'
        }}>
          Explore . Experience . Share
        </p>
        <p style={{ 
          fontSize: '1.125rem', 
          color: 'rgba(255, 255, 255, 0.9)',
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.8',
          textShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontWeight: '400'
        }}>
          Explore handpicked travel experiences with verified captains and travel companions. Discover amazing destinations, curated itineraries, and unforgettable adventures. Your journey to extraordinary experiences starts here.
        </p>
      </div>
      </section>


      <section style={{ maxWidth: '100%', margin: '0 auto' }}>
        {/* Popular Packages Title */}
        <h2 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
        marginBottom: '2rem',
          color: '#1e3a8a',
          textAlign: 'center',
          background: 'none'
        }}>
          Popular Packages
        </h2>

        {/* Circular Destination Images */}
        <div style={{ 
          display: 'flex', 
          gap: '2rem', 
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '3rem'
        }}>
          {popularPackages.map((pkg, index) => (
              <button 
                key={pkg._id || index}
                type="button"
                onClick={() => {
                  router.push(`/packages/${pkg._id}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/packages/${pkg._id}`);
                  }
                }}
                aria-label={`View package ${pkg?.title || 'package'}`}
            style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #e5e7eb',
                  marginBottom: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <img 
                    src={pkg?.images?.[0] || NO_IMAGE_URL} 
                    alt={pkg?.title || 'Package'}
                    onError={(e) => {
                      e.target.src = NO_IMAGE_URL;
                    }}
                   style={{
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                  />
        </div>
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  textAlign: 'center',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: '1.4',
                  maxWidth: '120px',
                  wordBreak: 'break-word'
                }}>
                  {pkg?.title || 'Package'}
                </span>
              </button>
            ))}
      </div>

        {/* Category Chips */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'center',
          marginBottom: '3rem',
          padding:'0 6rem'
        }}>
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category.value;
            
            const handleCategoryClick = (e) => {
              e.preventDefault();
              setSelectedCategory(category.value);
              // Update URL with category filter
              const params = new URLSearchParams(searchParams.toString());
              if (category.value === 'all') {
                params.delete('category');
              } else {
                params.set('category', category.value);
              }
              // Update URL without scrolling to top
              const newUrl = `/packages?${params.toString()}`;
              window.history.pushState({ ...window.history.state }, '', newUrl);
              
              // Scroll to packages section smoothly
              setTimeout(() => {
                const packagesSection = document.getElementById('packages-section');
                if (packagesSection) {
                  packagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 50);
            };

            const handleKeyDown = (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCategoryClick();
              }
            };

            return (
              <button
                key={category.value}
                type="button"
                onClick={handleCategoryClick}
                onKeyDown={handleKeyDown}
                style={{
                  background: isSelected 
                    ? '#1D4ED8' 
                    : 'linear-gradient(135deg, #1D4ED8 0%, #1e40af 100%)',
                  color: 'white',
                  padding: '0.875rem 2rem',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: isSelected 
                    ? '1px solid #1D4ED8' 
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  boxShadow: isSelected 
                    ? '0 4px 16px rgba(29, 78, 216, 0.4)' 
                    : '0 2px 8px rgba(0,0,0,0.2)',
                  whiteSpace: 'nowrap',
                  backdropFilter: isSelected ? 'none' : 'blur(10px)',
                  position: 'relative',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 78, 216, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                  }
                }}
              >
                <span>{category.label}</span>
                {category.count && (
                  <span style={{ 
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '12px',
                    minWidth: '24px',
                    textAlign: 'center',
                    backdropFilter: 'blur(5px)'
                  }}>
                    {category.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      {/* Packages Grid */}
      <div id="packages-section" style={{ marginTop: '2rem 6rem' }}>
        {loading && <PackagesSkeleton />}
        
        {!loading && packages.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: '500' }}>
              No packages found in this category
            </div>
          </div>
        )}
        
        {!loading && packages.length > 0 && (
              <>
                {/* First Package - Horizontal Layout */}
                {packages.length > 0 && (
                  <Grid container spacing={4} style={{alignItems: 'stretch', margin: '0rem 6rem 2rem 6rem' }}>
                    <Grid size={{xs: 12, md: 8}} style={{ display: 'flex' }}>
                      <div
                        key={packages[0]._id}
                        className="first-package-card-grid"
                        onClick={() => router.push(`/packages/${packages[0]._id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            router.push(`/packages/${packages[0]._id}`);
                          }
                        }}
                        aria-label={`View details for ${packages[0].title}`}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '24px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          border: '1px solid #f1f5f9',
                          width: '100%',
                          height: '100%',
                         display: 'grid', 
                          gridTemplateColumns: '1fr 1fr'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                        }}
                      >
                      {/* Image Side */}
                      <div
                        style={{ 
                          position: 'relative', 
                          minHeight: '400px',
                          overflow: 'hidden',
                          background: '#1D4ED8'
                        }}
                      >
                        <ImageCarousel 
                          images={packages[0]?.images} 
                          title={packages[0]?.title || 'Package'}
                        />
                        
                        {/* Verified Captain Badge */}
                        <div style={{
                          position: 'absolute',
                          top: '1.5rem',
                          left: '1.5rem',
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
                            toggleFavorite(packages[0]._id, e);
                          }}
                          aria-label={favorites.has(packages[0]._id) ? 'Remove from favorites' : 'Add to favorites'}
                          style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '1.5rem',
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
                        >
                          <svg 
                            width="22" 
                            height="22" 
                            viewBox="0 0 24 24" 
                            fill={favorites.has(packages[0]._id) ? '#ef4444' : 'none'} 
                            stroke={favorites.has(packages[0]._id) ? '#ef4444' : '#475569'} 
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
                          padding: '2rem 1.5rem 1.5rem 1.5rem',
                          color: 'white'
                        }}>
                          <h3 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700', 
                            color: 'white',
                            margin: '0 0 1rem 0',
                            lineHeight: '1.3'
                          }}>
                            {packages[0].title}
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
                              {packages[0].duration && (
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
                                  <span>{formatDuration(packages[0].duration)}</span>
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
                              <span>{getPackageFeature(packages[0])}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Side */}
                      <div
                        style={{ 
                          padding: '2.5rem', 
                          display: 'flex', 
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        {/* Description */}
                        <div>
                          <p style={{ 
                            fontSize: '1.125rem', 
                            color: '#64748b', 
                            lineHeight: '1.7',
                            marginBottom: '2rem'
                          }}>
                            {packages[0].description || `${packages[0].title}. Experience the best of ${packages[0].destination || 'travel'} with verified guides.`}
                          </p>
                        </div>

                        {/* Price, Rating and Buttons */}
                        <div>
                          {/* Price and Rating Row */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '2rem',
                            paddingTop: '0'
                          }}>
                            <div>
                              <div style={{ 
                                fontSize: '2.25rem', 
                                fontWeight: '800', 
                                color: '#1D4ED8',
                                lineHeight: '1.2'
                              }}>
                                ₹{(packages[0].price?.adult || 0).toLocaleString()} 
                                <span style={{ 
                                  fontSize: '1.125rem', 
                                  fontWeight: '500', 
                                  color: '#94a3b8' 
                                }}> /person</span>
                              </div>
                            </div>
                            
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem',
                              fontSize: '1rem',
                              fontWeight: '700',
                              color: '#1e293b',
                              backgroundColor: '#f8fafc',
                              padding: '0.5rem 1rem',
                              borderRadius: '12px'
                            }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24"/>
                              </svg>
                              {packages[0].rating ? `${packages[0].rating.toFixed(1)}` : '4.8'} 
                              <span style={{ color: '#64748b', fontWeight: '500' }}>
                                ({packages[0].reviewsCount || Math.floor(Math.random() * 200) + 50})
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Link 
                              href={`/packages/${packages[0]._id}`}
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
                              href={`/packages/${packages[0]._id}/book`}
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
                      </div>
                    </Grid>
                    {packages.length > 1 && (
                      <Grid size={{xs: 12, md: 4}} style={{ display: 'flex' }}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => router.push(`/packages/${packages[1]._id}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              router.push(`/packages/${packages[1]._id}`);
                            }
                          }}
                          aria-label={`View details for ${packages[1].title}`}
                          style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            border: '1px solid #f1f5f9',
                            width: '100%',
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
                              images={packages[1]?.images} 
                              title={packages[1]?.title || 'Package'}
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
                                toggleFavorite(packages[1]._id, e);
                              }}
                              aria-label={favorites.has(packages[1]._id) ? 'Remove from favorites' : 'Add to favorites'}
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
                                fill={favorites.has(packages[1]._id) ? '#ef4444' : 'none'} 
                                stroke={favorites.has(packages[1]._id) ? '#ef4444' : '#475569'} 
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
                                {packages[1].title}
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
                                  {packages[1].duration && (
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
                                      <span>{formatDuration(packages[1].duration)}</span>
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
                                  <span>{getPackageFeature(packages[1])}</span>
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
                              {packages[1].description || `${packages[1].title}. Experience the best of ${packages[1].destination || 'travel'} with verified guides.`}
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
                                  ₹{(packages[1].price?.adult || 0).toLocaleString()} 
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
                                {packages[1].rating ? `${packages[1].rating.toFixed(1)}` : '4.8'} 
                                <span style={{ color: '#64748b', fontWeight: '500' }}>
                                  ({packages[1].reviewsCount || Math.floor(Math.random() * 200) + 50})
                                </span>
                    </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                              <Link 
                                href={`/packages/${packages[1]._id}`}
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
                                href={`/packages/${packages[1]._id}/book`}
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
                      </Grid>
                    )}
                  </Grid>
                )}

                {/* Rest of Packages - Grid Layout */}
                {packages.length > 2 && (
                  <Grid container spacing={4} style={{ margin: '0rem 6rem' , paddingBottom: '80px'}}>
                    {packages.slice(2).map((pkg) => (
                      <Grid size={{xs: 12, sm: isSmallScreen ? 12 : 6, md: 4}} key={pkg._id}>
                        <div
                          role="button"
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
                      </Grid>
          ))}
                  </Grid>
                )}
              </>
        )}
      </div>
      </section>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<PackagesSkeleton />}>
      <PackagesPageContent />
    </Suspense>
  );
}
