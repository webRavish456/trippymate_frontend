'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Grid, useMediaQuery } from "@mui/material";

import { API_BASE_URL } from '@/lib/config';

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
  const [popularDestinations, setPopularDestinations] = useState([]);

  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchPackages();
    fetchPopularDestinations();
  }, [destinationId, selectedCategory, selectedPackageType, searchQuery]);

  // Dummy Packages Data
  const dummyPackages = [
    {
      _id: '1',
      title: 'Manali Adventure Escape',
      description: 'Trek, camp, and explore Manali with verified guides. Experience the best of Himalayan adventure.',
      duration: '3N/4D',
      destination: 'Manali',
      source: 'Delhi',
      category: 'Adventure',
      packageType: 'Adventure Packages',
      price: { adult: 8999 },
      rating: 4.8,
      reviewsCount: 124,
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop']
    },
    {
      _id: '2',
      title: 'Leh Ladakh Bike Expedition',
      description: 'Ride through the highest motorable roads with expert guides. An unforgettable Himalayan journey.',
      duration: '7N/8D',
      destination: 'Leh Ladakh',
      source: 'Delhi',
      category: 'Adventure',
      packageType: 'Adventure Packages',
      price: { adult: 24999 },
      rating: 4.9,
      reviewsCount: 89,
      images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop']
    },
    {
      _id: '3',
      title: 'Darjeeling Tea Trail',
      description: 'Experience sunrise at Tiger Hill and ride the toy train. Explore lush tea estates with local experts.',
      duration: '5N/6D',
      destination: 'Darjeeling',
      source: 'Kolkata',
      category: 'Cultural',
      packageType: 'Cultural Packages',
      price: { adult: 14999 },
      rating: 4.8,
      reviewsCount: 98,
      images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop']
    },
    {
      _id: '4',
      title: 'Nainital Lake Retreat',
      description: 'Serene lake views and mountain tranquility. Perfect getaway for nature lovers and peace seekers.',
      duration: '3N/4D',
      destination: 'Nainital',
      source: 'Delhi',
      category: 'Holiday',
      packageType: 'Holiday Packages',
      price: { adult: 9999 },
      rating: 4.6,
      reviewsCount: 142,
      images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop']
    },
    {
      _id: '5',
      title: 'Shimla Heritage Tour',
      description: 'Explore colonial charm and mountain beauty. Perfect blend of history and nature in the Himalayas.',
      duration: '4N/5D',
      destination: 'Shimla',
      source: 'Delhi',
      category: 'Cultural',
      packageType: 'Cultural Packages',
      price: { adult: 12499 },
      rating: 4.7,
      reviewsCount: 156,
      images: ['https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop']
    },
    {
      _id: '6',
      title: 'Coorg Coffee Plantation Tour',
      description: 'Discover the aroma of coffee plantations and enjoy the scenic beauty of Coorg hills.',
      duration: '3N/4D',
      destination: 'Coorg',
      source: 'Bangalore',
      category: 'Holiday',
      packageType: 'Holiday Packages',
      price: { adult: 10999 },
      rating: 4.5,
      reviewsCount: 112,
      images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop']
    },
    {
      _id: '7',
      title: 'Goa Beach Paradise',
      description: 'Sun, sand, and sea adventures await. Perfect beach getaway with water sports and nightlife.',
      duration: '4N/5D',
      destination: 'Goa',
      source: 'Mumbai',
      category: 'Beach',
      packageType: 'Beach Packages',
      price: { adult: 11999 },
      rating: 4.6,
      reviewsCount: 203,
      images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop']
    },
    {
      _id: '8',
      title: 'Kerala Backwaters Cruise',
      description: 'Experience the serene backwaters of Kerala in traditional houseboats. A peaceful journey through nature.',
      duration: '5N/6D',
      destination: 'Kerala',
      source: 'Kochi',
      category: 'Holiday',
      packageType: 'Holiday Packages',
      price: { adult: 15999 },
      rating: 4.7,
      reviewsCount: 178,
      images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop']
    }
  ];

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
        // Fallback to dummy data if API fails
        console.warn('API failed, using dummy data');
        let filteredPackages = dummyPackages;

        if (selectedCategory !== 'all') {
          filteredPackages = dummyPackages.filter(pkg => pkg.category === selectedCategory);
        }

        if (searchQuery) {
          filteredPackages = filteredPackages.filter(pkg => 
            pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.destination.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setPackages(filteredPackages);
        setTotalCount(filteredPackages.length);
        
        const counts = categories
          .filter(cat => cat.value !== 'all')
          .map(cat => ({
            _id: cat.value,
            count: cat.count || 0
          }));
        setPackageCounts(counts);
      }
      
    } catch (error) {
      console.error('Error fetching packages:', error);
      // Fallback to dummy data on error
      let filteredPackages = dummyPackages;

      if (selectedCategory !== 'all') {
        filteredPackages = dummyPackages.filter(pkg => pkg.category === selectedCategory);
      }

      if (searchQuery) {
        filteredPackages = filteredPackages.filter(pkg => 
          pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.destination.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setPackages(filteredPackages);
      setTotalCount(filteredPackages.length);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularDestinations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/popular-destinations?limit=6`);
      const data = await response.json();

      if (data.status && data.data && data.data.length > 0) {
        setPopularDestinations(data.data);
      } else {
        // Fallback to static data
        setPopularDestinations(getUniqueDestinations());
      }
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      // Fallback to static data
      setPopularDestinations(getUniqueDestinations());
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Adventure', label: 'Adventure', count: 24, description: 'Thrilling experiences for adrenaline seekers' },
    { value: 'Family', label: 'Family', count: 18, description: 'Perfect trips for the whole family' },
    { value: 'Honeymoon', label: 'Honeymoon', count: 15, description: 'Romantic getaways for couples' },
    { value: 'Holiday', label: 'Holiday', count: 32, description: 'Relaxing holiday packages' },
    { value: 'Cultural', label: 'Cultural', count: 12, description: 'Explore rich cultural heritage' },
    { value: 'Religious', label: 'Religious', count: 20, description: 'Spiritual journeys and pilgrimages' },
    { value: 'Wildlife', label: 'Wildlife', count: 14, description: 'Wildlife safaris and nature tours' },
    { value: 'Beach', label: 'Beach', count: 16, description: 'Sun, sand, and sea adventures' },
    { value: 'Hill Station', label: 'Hill Station', count: 22, description: 'Scenic mountain retreats' },
    { value: 'Weekend Getaways', label: 'Weekend Getaways', count: 19, description: 'Quick escapes for weekend relaxation' }
  ];

  const getPackageCount = (type) => {
    const count = packageCounts.find(p => p._id === type);
    return count ? count.count : 0;
  };

  // Get unique destinations for the circular images - Dummy Data
  const getUniqueDestinations = () => {
    return [
      {
        name: 'Manali',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'
      },
      {
        name: 'Leh Ladakh',
        image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=400&h=400&fit=crop'
      },
      {
        name: 'Shimla',
        image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=400&fit=crop'
      },
      {
        name: 'Darjeeling',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
      },
      {
        name: 'Nainital',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
      },
      {
        name: 'Coorg',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
      }
    ];
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

  const uniqueDestinations = getUniqueDestinations();

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#f8fafc' }}>
         <section>
      <div style={{
        background: 'linear-gradient(135deg, #1D4ED8 0%, #1e40af 100%)',
        padding: '4rem 6rem',
        color: 'white',
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: '800', 
          marginBottom: '1rem',
          textShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          Discover Amazing Packages
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          opacity: 0.95,
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Explore handpicked travel experiences with verified captains and travel companions
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
          {(popularDestinations.length > 0 ? popularDestinations : getUniqueDestinations()).map((dest, index) => (
              <div 
                key={index}
            style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onClick={() => {
                  // Navigate to packages filtered by destination
                  const params = new URLSearchParams();
                  params.set('destination', dest.name);
                  router.push(`/packages?${params.toString()}`);
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
                    src={dest.image} 
                    alt={dest.name}
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
                  textAlign: 'center'
                }}>
                  {dest.name}
                </span>
              </div>
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
            
            return (
              <div
                key={category.value}
                onClick={() => {
                  setSelectedCategory(category.value);
                  // Update URL with category filter
                  const params = new URLSearchParams(searchParams.toString());
                  if (category.value === 'all') {
                    params.delete('category');
                  } else {
                    params.set('category', category.value);
                  }
                  router.push(`/packages?${params.toString()}`);
                }}
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
                  letterSpacing: '0.5px'
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
              </div>
            );
          })}
        </div>

      {/* Packages Grid */}
        {(
          <div style={{ marginTop: '2rem 6rem' }}>
      {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <div style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: '500' }}>
                  Loading packages...
                </div>
        </div>
      ) : packages.length === 0 ? (
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
      ) : (
              <>
                {/* First Package - Horizontal Layout */}
                {packages.length > 0 && (
                  <Grid container spacing={2} style={{alignItems: 'stretch', margin: '0rem 6rem 2rem 6rem' }}>
                    <Grid size={{xs: 12, md: 8}} style={{ display: 'flex' }}>
                      <div
                        key={packages[0]._id}
                        className="first-package-card-grid"
                        onClick={() => router.push(`/packages/${packages[0]._id}`)}
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
                        {packages[0].images && packages[0].images.length > 0 && (
                          <img 
                            src={packages[0].images[0]} 
                            alt={packages[0].title}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        
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
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(packages[0]._id, e);
                          }}
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
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        >
                          <svg 
                            width="22" 
                            height="22" 
                            viewBox="0 0 24 24" 
                            fill={favorites.has(packages[0]._id) ? '#ef4444' : 'none'} 
                            stroke={favorites.has(packages[0]._id) ? '#ef4444' : '#475569'} 
                            strokeWidth="2.5"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </div>

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
                            gap: '1rem',
                            flexWrap: 'nowrap',
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
                              href={`/packages/${packages[0]._id}?book=true`}
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
                          onClick={() => router.push(`/packages/${packages[1]._id}`)}
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
                            {packages[1].images && packages[1].images.length > 0 && (
                              <img 
                                src={packages[1].images[0]} 
                                alt={packages[1].title}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover',
                                  transition: 'transform 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = 'scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'scale(1)';
                                }}
                              />
                            )}
                            
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
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                toggleFavorite(packages[1]._id, e);
                              }}
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
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                              </svg>
                            </div>

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
                                gap: '1rem',
                                flexWrap: 'nowrap',
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
                                href={`/packages/${packages[1]._id}?book=true`}
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
                  <Grid container spacing={2} style={{ margin: '0rem 6rem' }}>
                    {packages.slice(2).map((pkg) => (
                      <Grid size={{xs: 12, sm: isSmallScreen ? 12 : 6, md: 4}} key={pkg._id}>
                        <div
                          onClick={() => router.push(`/packages/${pkg._id}`)}
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
                      {(() => {
                        const imageUrl = (pkg.images && pkg.images.length > 0) 
                          ? pkg.images[0] 
                          : (packages.length > 1 && packages[1].images && packages[1].images.length > 0) 
                            ? packages[1].images[0] 
                            : null;
                        return imageUrl && (
                          <img 
                            src={imageUrl} 
                            alt={pkg.title}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                            }}
                          />
                        );
                      })()}
                      
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
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(pkg._id, e);
                        }}
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
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </div>

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
                          gap: '1rem',
                          flexWrap: 'nowrap',
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
                          href={`/packages/${pkg._id}?book=true`}
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
      )}
      </section>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    }>
      <PackagesPageContent />
    </Suspense>
  );
}
