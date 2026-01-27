'use client';

import { Grid, Skeleton } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { Shadows_Into_Light } from "next/font/google";

const shadows = Shadows_Into_Light({
  weight: "400",
  subsets: ["latin"],
});

// API Base URL - Update this to your backend URL
import { API_BASE_URL } from '@/lib/config';



export default function ExploreDesignation() {
  const router = useRouter();
  
  // Swiper refs
  const popularDestinationsSwiperRef = useRef(null);
  const tripTypeSwiperRef = useRef(null);
  const bestMonthsSwiperRef = useRef(null);
  const tabsScrollRef = useRef(null);

  // State for dynamic data
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [months, setMonths] = useState([]);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [heritage, setHeritage] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryPlaces, setCategoryPlaces] = useState([]);
  const [beachPlaces, setBeachPlaces] = useState([]);
  const [selectedMonthTab, setSelectedMonthTab] = useState('January');
  const [allDestinations, setAllDestinations] = useState([]);
  const [loading, setLoading] = useState({
    popularDestinations: true,
    months: true,
    categories: true,
    regions: true,
    activities: true,
    heritage: true,
    categoryPlaces: false
  });

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Popular Destinations
        const popularUrl = `${API_BASE_URL}/api/admin/destination/popular`.replace(/\?+$/, '');
        const popularRes = await fetch(popularUrl);
        const popularData = await popularRes.json();
        if (popularData.status && popularData.data) {
          const formattedPopular = popularData.data
            .filter(item => item.status === 'active')
            .map(item => ({
              id: item._id,
              name: item.name || '',
              description: item.description || '',
              location: item.location || '',
              image: item.image || item.images?.[0] || '/explore-destination/default.png',
              images: item.images || [],
              bestTimeToVisit: item.bestTimeToVisit || '',
              topAttractions: item.topAttractions || [],
              activities: item.activities || [],
              hotels: item.hotels || [],
              foodAndCuisine: item.foodAndCuisine || [],
              nearbyDestinations: item.nearbyDestinations || []
            }));
          setPopularDestinations(formattedPopular);
        }
        setLoading(prev => ({ ...prev, popularDestinations: false }));

        // Fetch Season data (Best Months)
        const seasonRes = await fetch(`${API_BASE_URL}/api/admin/destination/season`);
        const seasonData = await seasonRes.json();
        if (seasonData.status && seasonData.data) {
          const formattedMonths = seasonData.data
            .filter(item => item.status === 'active')
            .map(item => ({
              monthTitle: item.title || item.name || '',
              color: item.color || '#0077ff',
              places: item.places || '',
              desc: item.desc || item.description || '',
              image: item.image || '/explore-destination/monthly/default.png',
              placesDetails: item.placesDetails || []
            }));
          setMonths(formattedMonths);
          
          // Flatten all destinations from all months
          const allDest = [];
          formattedMonths.forEach(month => {
            if (month.placesDetails && month.placesDetails.length > 0) {
              month.placesDetails.forEach(place => {
                allDest.push({
                  ...place,
                  monthTitle: month.monthTitle,
                  monthColor: month.color,
                  image: place.image || place.images?.[0] || month.image || '/explore-destination/monthly/default.png'
                });
              });
            }
          });
          setAllDestinations(allDest);
        }
        setLoading(prev => ({ ...prev, months: false }));

        // Fetch Category data (Trip Types)
        const categoryRes = await fetch(`${API_BASE_URL}/api/admin/destination/category`);
        const categoryData = await categoryRes.json();
        if (categoryData.status && categoryData.data) {
          const formattedCategories = categoryData.data
            .filter(item => item.status === 'active')
            .map(item => ({
              id: item._id,
              name: item.category || item.name || '',
              description: item.desc || item.description || '',
              image: item.image || '/explore-destination/trip-default.png',
              locations: item.places || '',
              placesDetails: item.placesDetails || []
            }));
          setCategories(formattedCategories);
          // Set first category as selected by default
          if (formattedCategories.length > 0) {
            setSelectedCategory(formattedCategories[0]);
            setCategoryPlaces(formattedCategories[0].placesDetails || []);
          }
          // Collect all beach-related places
          const beachCategories = formattedCategories.filter(cat => 
            cat.name?.toLowerCase().includes('beach') || 
            cat.name?.toLowerCase().includes('beaches')
          );
          const allBeachPlaces = [];
          beachCategories.forEach(cat => {
            if (cat.placesDetails && Array.isArray(cat.placesDetails)) {
              allBeachPlaces.push(...cat.placesDetails);
            }
          });
          setBeachPlaces(allBeachPlaces);
        }
        setLoading(prev => ({ ...prev, categories: false }));

        // Fetch Region data - Only show 4 main regions: North, South, East, West
        const regionRes = await fetch(`${API_BASE_URL}/api/admin/destination/region`);
        const regionData = await regionRes.json();
        if (regionData.status && regionData.data) {
          // Filter to only get North, South, East, West regions
          const mainRegions = ['north', 'south', 'east', 'west'];
          const regionMap = new Map(); // Use Map to store unique regions
          
          regionData.data
            .filter(item => {
              if (item.status !== 'active') return false;
              const regionName = (item.region || item.name || '').toLowerCase();
              // Check if region name contains any of the main region names
              return mainRegions.some(mainRegion => regionName.includes(mainRegion));
            })
            .forEach(item => {
              const regionName = (item.region || item.name || '').toLowerCase();
              let normalizedName = '';
              if (regionName.includes('north')) normalizedName = 'North India';
              else if (regionName.includes('south')) normalizedName = 'South India';
              else if (regionName.includes('east')) normalizedName = 'East India';
              else if (regionName.includes('west')) normalizedName = 'West India';
              else normalizedName = item.region || item.name || '';
              
              // Only add if this normalized region name doesn't exist in map
              // This ensures we only have one entry per region
              if (!regionMap.has(normalizedName)) {
                regionMap.set(normalizedName, {
                  id: item._id, // Use first document's ID
                  name: normalizedName,
                  image: item.image || '/explore-destination/region/default.png',
                  description: item.desc || item.description || '',
                  states: item.states || []
                });
              }
            });
          
          // Convert Map to Array
          const formattedRegions = Array.from(regionMap.values());
          
          // Sort regions in order: North, South, East, West
          const regionOrder = { 'north india': 0, 'south india': 1, 'east india': 2, 'west india': 3 };
          formattedRegions.sort((a, b) => {
            const aOrder = regionOrder[a.name.toLowerCase()] ?? 99;
            const bOrder = regionOrder[b.name.toLowerCase()] ?? 99;
            return aOrder - bOrder;
          });
          
          setRegions(formattedRegions);
        }
        setLoading(prev => ({ ...prev, regions: false }));

        // Fetch Adventure Activities
        const adventureRes = await fetch(`${API_BASE_URL}/api/admin/destination/adventure`);
        const adventureData = await adventureRes.json();
        if (adventureData.status && adventureData.data) {
          const formattedActivities = adventureData.data
            .filter(item => item.status === 'active')
            .map(item => ({
              id: item._id,
              name: item.name || item.title || '',
              image: item.image || '/explore-destination/activites/default.png',
              description: item.desc || item.description || '',
              destinations: item.destinations || []
            }));
          setActivities(formattedActivities);
        }
        setLoading(prev => ({ ...prev, activities: false }));

        // Fetch Culture & Heritage
        const cultureRes = await fetch(`${API_BASE_URL}/api/admin/destination/culture`);
        const cultureData = await cultureRes.json();
        if (cultureData.status && cultureData.data) {
          const formattedHeritage = cultureData.data
            .filter(item => item.status === 'active')
            .map(item => ({
              id: item._id,
              name: item.name || item.title || '',
              image: item.image || '/explore-destination/heritage/default.png',
              description: item.desc || item.description || '',
              destinations: item.destinations || []
            }));
          setHeritage(formattedHeritage);
        }
        setLoading(prev => ({ ...prev, heritage: false }));

      } catch (error) {
        console.error('Error fetching explore destination data:', error);
        setLoading({
          months: false,
          categories: false,
          regions: false,
          activities: false,
          heritage: false
        });
      }
    };

    fetchData();
  }, []);

  // Capitalize category name properly
  const capitalizeCategoryName = (name) => {
    if (!name) return '';
    const lowerName = name.toLowerCase();
    if (lowerName.includes('beach')) {
      return 'Beaches';
    }
    // Capitalize first letter of each word
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Handle category hover/selection
  const handleCategoryHover = (category) => {
    setSelectedCategory(category);
    setCategoryPlaces(category.placesDetails || []);
  };

  // Handle destination explore click - navigate to detail page
  const handleExploreClick = (destinationId) => {
    router.push(`/explore-destination/${destinationId}`);
  };


  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 4,
      slidesToSlide: 3
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  const CustomLeftArrow = ({ onClick }) => (
    <button 
      className="popular-carousel-nav popular-carousel-nav-left" 
      onClick={onClick}
      aria-label="Previous"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );

  const CustomRightArrow = ({ onClick }) => (
    <button 
      className="popular-carousel-nav popular-carousel-nav-right" 
      onClick={onClick}
      aria-label="Next"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );

    return (
        <>
   
   <div className="flex items-center justify-center bg-zinc-50 font-sans dark:bg-white" style={{ width: '100%', maxWidth: '100%' }}>
      <main className="flex w-full flex-col items-center bg-white dark:bg-white" style={{ width: '100%', maxWidth: '100%' }}>
     
        <section className="hero-container">

            <Grid container spacing={2}>

                <Grid size={{xs:12, sm:6, md:5}}>
                <div className="hero-content">
        <h1 className="hero-title">
          Explore the Soul of India{" "}
          <span className="highlight">One Destination</span> <span className="highlight">at a Time</span>
        </h1>

        <p className="hero-subtext">
          Discover curated travel experiences designed for every vibe — from
          beaches to mountains and beyond.
        </p>

        <div className="hero-buttons">
          <button className="btn primary-btn">Browse Packages</button>
          <button className="btn outline-btn">Find My Vibe</button>
        </div>
           </div>
                </Grid>
                <Grid size={{xs:12, sm:6, md:7}}>
                <div className="hero-image-wrapper">
        <img
          src="/explore-destination/ram-mandir.png"
          alt="Ram Mandir"
          className="hero-image"
        />

        <button className="plane-btn">✈</button>
      </div>
                </Grid>
            </Grid>
        

   
    </section>

    {/* Popular Destinations Section */}
    <section className="popular-destinations-section">
      <div className="popular-destinations-container">
        <div className="popular-destinations-header">
          <h2 className="popular-destinations-title">
            <span className="popular-text">Popular</span>
            <span className="destinations-text"> Destinations</span>
          </h2>
          <p className="popular-destinations-subtitle">
            Discover India's most loved travel destinations
          </p>
          <div className="popular-destinations-separator"></div>
        </div>

        {loading.popularDestinations ? (
          <div className="popular-destinations-carousel-wrapper">
            <Swiper
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 }
              }}
            >
              {[...new Array(4)].map((_, idx) => (
                <SwiperSlide key={idx}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    height: '100%'
                  }}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={300}
                      sx={{
                        bgcolor: '#e2e8f0',
                      }}
                      animation="wave"
                    />
                    <div style={{ padding: '1.5rem' }}>
                      <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                      <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5, bgcolor: '#e2e8f0' }} animation="wave" />
                      <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : popularDestinations.length > 0 ? (
          <div className="popular-destinations-carousel-wrapper">
            <button 
              className="popular-destinations-nav popular-destinations-nav-left swiper-button-prev-popular" 
              aria-label="Previous"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <Swiper
              onSwiper={(swiper) => {
                popularDestinationsSwiperRef.current = swiper;
              }}
              modules={[Navigation, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={{
                prevEl: '.swiper-button-prev-popular',
                nextEl: '.swiper-button-next-popular',
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
              className="popular-destinations-carousel"
            >
              {popularDestinations.map((destination, index) => (
                <SwiperSlide key={destination.id || index}>
                  <div className="popular-destination-card">
                    <div className="popular-destination-image-wrapper">
                      <img 
                        src={destination.image} 
                        alt={destination.name} 
                        className="popular-destination-image"
                      />
                      <div className="popular-destination-gradient-overlay"></div>
                      <div className="popular-destination-badge">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 1L10.5 5.5L15.5 6.5L12 10L12.5 15L8 12.5L3.5 15L4 10L0.5 6.5L5.5 5.5L8 1Z" fill="currentColor"/>
                        </svg>
                        Popular
                      </div>
                    </div>
                    <div className="popular-destination-content">
                      <div className="popular-destination-header">
                        <h3 className="popular-destination-name">{destination.name}</h3>
                      </div>
                      <div className="popular-destination-info">
                        <div className="popular-destination-location-wrapper">
                          <svg className="location-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 9.75C10.2426 9.75 11.25 8.74264 11.25 7.5C11.25 6.25736 10.2426 5.25 9 5.25C7.75736 5.25 6.75 6.25736 6.75 7.5C6.75 8.74264 7.75736 9.75 9 9.75Z" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 1.5C7.4087 1.5 5.88258 2.13214 4.75736 3.25736C3.63214 4.38258 3 5.9087 3 7.5C3 11.25 9 16.5 9 16.5C9 16.5 15 11.25 15 7.5C15 5.9087 14.3679 4.38258 13.2426 3.25736C12.1174 2.13214 10.5913 1.5 9 1.5Z" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <p className="popular-destination-location">{destination.location}</p>
                        </div>
                      </div>
                      <button 
                        className="popular-destination-button"
                        onClick={() => handleExploreClick(destination.id)}
                      >
                        <span>Explore</span>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 14L12 9L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <button 
              className="popular-destinations-nav popular-destinations-nav-right swiper-button-next-popular" 
              aria-label="Next"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="popular-destinations-empty">
            <p>No popular destinations available</p>
          </div>
        )}
      </div>
    </section>

 
    <section className="pick-your-type-section">
          <div className="pick-your-type-container">
           
            <div className="pick-your-type-header">
              <h2 className="pick-your-type-title">
                <span className="our-text">Pick Your Trip</span>
                <span className="offerings-type-text"> Type</span>
              </h2>
              <p className="pick-your-type-subtitle">
                Discover India through different experiences.
              </p>
              <div className="pick-your-type-separator"></div>
            </div>

         
            <div className="pick-your-type-cards-wrapper">
              <button 
                className="pick-your-type-nav pick-your-type-nav-left swiper-button-prev-triptype" 
                aria-label="Previous"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {loading.categories ? (
                <Swiper
                  modules={[Navigation]}
                  spaceBetween={20}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                    1280: { slidesPerView: 4 }
                  }}
                  className="pick-your-type-cards"
                >
                  {[...new Array(4)].map((_, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="trip-type-card">
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height={200}
                          sx={{
                            borderRadius: '16px',
                            bgcolor: '#e2e8f0',
                          }}
                          animation="wave"
                        />
                        <div className="trip-type-card-content" style={{ padding: '1.5rem' }}>
                          <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                          <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : categories.length > 0 ? (
                <Swiper
                  onSwiper={(swiper) => {
                    tripTypeSwiperRef.current = swiper;
                  }}
                  modules={[Navigation, Autoplay]}
                  spaceBetween={20}
                  slidesPerView={1}
                  loop={true}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  navigation={{
                    prevEl: '.swiper-button-prev-triptype',
                    nextEl: '.swiper-button-next-triptype',
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
                  className="pick-your-type-cards"
                >
                  {categories.map((category, index) => (
                    <SwiperSlide key={category.id || index}>
                      <div 
                        className="trip-type-card"
                        onMouseEnter={() => handleCategoryHover(category)}
                      >
                        <div className="trip-type-card-image-wrapper">
                          <img src={category.image} alt={category.name} className="trip-type-card-image"/>
                          <div className="explore-destination-point"></div>
                        </div>
                        <div className="trip-type-card-content">
                          <h1 className="trip-type-card-title">{capitalizeCategoryName(category.name)}</h1>
                          <p className="trip-type-card-locations">{category.locations}</p>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="pick-your-type-cards">
                  <div className="trip-type-card">
                    <div className="trip-type-card-content">
                      <p>No data available</p>
                    </div>
                  </div>
                </div>
              )}

              <button 
                className="pick-your-type-nav pick-your-type-nav-right swiper-button-next-triptype" 
                aria-label="Next"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>


            {selectedCategory && (
              <div className="popular-mountains-wrapper">
                {(() => {
                  const placesToShow = (selectedCategory.name?.toLowerCase().includes('beach') || selectedCategory.name?.toLowerCase().includes('beaches'))
                    ? beachPlaces
                    : categoryPlaces;
                  
                  return placesToShow.length > 0 ? (
                    <div className="popular-mountains-swiper-wrapper">
                      <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={24}
                        slidesPerView={1}
                        loop={placesToShow.length > 1}
                        autoplay={{
                          delay: 4000,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: true,
                        }}
                        navigation={{
                          prevEl: `.swiper-button-prev-${selectedCategory.id}`,
                          nextEl: `.swiper-button-next-${selectedCategory.id}`,
                        }}
                        className="popular-mountains-swiper"
                      >
                        {placesToShow.map((place, idx) => (
                          <SwiperSlide key={idx}>
                            <div className="popular-mountains-card-wrapper">
                              <div className="popular-mountains-card">
                                <div className="popular-mountains-image-wrapper">
                                  <svg width="100%" height="100%" viewBox="0 0 1374 588" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="popular-mountains-image">
                                    <path d="M1374 547.016C1374 569.615 1355.68 587.935 1333.08 587.935H40.9184C18.3198 587.935 0 569.615 0 547.016V165.918C0 143.32 18.3198 125 40.9185 125H505.248C527.846 125 546.166 106.68 546.166 84.0815V40.9185C546.166 18.3198 564.486 0 587.085 0H1333.08C1355.68 0 1374 18.3198 1374 40.9185V547.016Z" fill={`url(#pattern0_35_604_${idx})`}/>
                                    <defs>
                                      <pattern id={`pattern0_35_604_${idx}`} patternContentUnits="objectBoundingBox" width="1" height="1">
                                        <use xlinkHref={`#image0_35_604_${idx}`} transform="matrix(0.000531915 0 0 0.00124308 0 -0.278791)"/>
                                      </pattern>
                                      <image id={`image0_35_604_${idx}`} width="1880" height="1253" preserveAspectRatio="none" xlinkHref={"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}/>
                                    </defs>
                                  </svg>
                                  <div className="popular-mountains-overlay"></div>
                                  <div className="popular-mountains-banner">
                                    <h2 className="popular-mountains-title">
                                      {`Popular ${capitalizeCategoryName(selectedCategory.name)}`}
                                    </h2>
                                  </div>
                                </div>
                                <div className="popular-mountains-content">
                                  <h1 className="popular-mountains-card-title">
                                    {place.placeName || "Destination"}
                                  </h1>
                                  <p className="popular-mountains-description">
                                    {place.description || place.weatherInfo || "Experience the beauty of this amazing destination."}
                                  </p>
                                  <button className="popular-mountains-button">
                                    View Details
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      <button 
                        className={`popular-mountains-nav-arrow swiper-button-next-${selectedCategory.id}`}
                        aria-label="Next"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="popular-mountains-card-wrapper">
                      <div className="popular-mountains-card">
                        <div className="popular-mountains-content">
                          <p>No places available for this category</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </section>


    <section className="explore-destination-hero-section btv-section">
      <div className="btv-container">
        <div className="btv-header">
          <h2 className="btv-title">
            <span className="btv-title-text">Best Months</span>
            <span className="btv-title-highlight"> for Every Destination</span>
          </h2>
          <p className="btv-subtitle">
            Discover the perfect time to visit India's most beautiful places
          </p>
          <div className="btv-separator"></div>
        </div>

        {/* Month Tabs */}
        {!loading.months && (
          <div className="btv-tabs-wrapper">
            <button 
              className="btv-tabs-nav btv-tabs-nav-left"
              onClick={() => {
                if (tabsScrollRef.current) {
                  tabsScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                }
              }}
              aria-label="Scroll tabs left"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="btv-tabs-container" ref={tabsScrollRef}>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((monthName, index) => {
                const monthData = months.find(m => m.monthTitle === monthName);
                const isActive = selectedMonthTab === monthName;
                const hasData = allDestinations.some(dest => dest.monthTitle === monthName);
                
                return (
                  <button
                    key={index}
                    className={`btv-tab ${isActive ? 'btv-tab-active' : ''} ${!hasData ? 'btv-tab-no-data' : ''}`}
                    onClick={() => setSelectedMonthTab(monthName)}
                    style={{
                      borderBottomColor: isActive ? (monthData?.color || '#3460DC') : 'transparent',
                      backgroundColor: isActive ? (monthData?.color || '#3460DC') : 'transparent',
                      color: isActive ? '#ffffff' : undefined
                    }}
                  >
                    {monthName}
                  </button>
                );
              })}
            </div>
            <button 
              className="btv-tabs-nav btv-tabs-nav-right"
              onClick={() => {
                if (tabsScrollRef.current) {
                  tabsScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                }
              }}
              aria-label="Scroll tabs right"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {loading.months ? (
          <div className="btv-carousel-wrapper">
            <Swiper
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
              }}
            >
              {[...new Array(3)].map((_, idx) => (
                <SwiperSlide key={idx}>
                  <div className="btv-card">
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={400}
                      sx={{
                        borderRadius: '20px',
                        bgcolor: '#e2e8f0',
                      }}
                      animation="wave"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : allDestinations.length > 0 || months.length > 0 ? (
          (() => {
            // Filter destinations based on selected tab
            // Show destinations for selected month only
            const filteredDestinations = allDestinations.filter(dest => dest.monthTitle === selectedMonthTab);
            
            return filteredDestinations.length > 0 ? (
              <div className="btv-carousel-wrapper">
                <button 
                  className="btv-nav btv-nav-left swiper-button-prev-bestmonths" 
                  aria-label="Previous"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <Swiper
                  key={selectedMonthTab || 'all'} // Re-render swiper when tab changes
                  onSwiper={(swiper) => {
                    bestMonthsSwiperRef.current = swiper;
                  }}
                  modules={[Navigation, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={1}
                  loop={filteredDestinations.length > 1}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  navigation={{
                    prevEl: '.swiper-button-prev-bestmonths',
                    nextEl: '.swiper-button-next-bestmonths',
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
                  className="btv-carousel"
                >
                  {filteredDestinations.map((dest, index) => (
                <SwiperSlide key={index}>
                  <div 
                    className="btv-card" 
                    style={{ backgroundImage: `url(${dest.image})` }}
                  >
                    <div className="btv-card-overlay"></div>
                    <div className="btv-card-content">
                      <div
                        className="btv-month-bar"
                        style={{ backgroundColor: dest.monthColor || '#0077ff' }}
                      ></div>

                      <h3>{dest.location || dest.placeName || dest.name || 'Destination'}</h3>
                      <p className="btv-places">{dest.placeName || dest.name || ''}</p>
                      <p className="btv-desc">{dest.description || dest.desc || dest.weatherInfo || ''}</p>
                      <button className="btv-explore-button">
                        Explore Now
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <button 
              className="btv-nav btv-nav-right swiper-button-next-bestmonths" 
              aria-label="Next"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
            ) : (
              <div className="btv-carousel-wrapper">
                <div className="btv-card">
                  <div className="btv-card-overlay"></div>
                  <div className="btv-card-content">
                    <p>No destinations available for this month</p>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="btv-carousel-wrapper">
            <div className="btv-card">
              <div className="btv-card-overlay"></div>
              <div className="btv-card-content">
                <p>No data available</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>

     
     
        <section className="explore-destination-hero-section region-section">
      <div className="region-container">
        <div className="region-header">
          <h2 className="region-title">
            <span className="region-title-text">Explore by</span>
            <span className="region-title-highlight"> Region</span>
          </h2>
          <p className="region-subtitle">Journey through India's diverse landscapes, cultures, and experiences</p>
          <div className="region-separator"></div>
        </div>
        {loading.regions ? (
          <div className="region-grid">
            {[...new Array(4)].map((_, idx) => (
              <div className="region-card" key={idx}>
                <div className="region-card-inner">
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    sx={{
                      borderRadius: '20px',
                      bgcolor: '#e2e8f0',
                      minHeight: '300px'
                    }}
                    animation="wave"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : regions.length > 0 ? (
          <div className="region-grid">
            {regions.map((r, i) => (
              <div className={`region-card region-card-${i + 1}`} key={i}>
                <div className="region-card-inner">
                  <div className="region-image-wrapper">
                    <img src={r.image} alt={r.name} />
                    <div className="region-color-overlay"></div>
                    <div className="region-pattern-overlay"></div>
                  </div>
                  <div className="region-floating-badge">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="region-content">
                    <div className="region-number">0{i + 1}</div>
                    <h3 className="region-name">{r.name}</h3>
                    <div className="region-divider"></div>
                    <p className="region-description">{r.description || "Explore destinations"}</p>
                    <button 
                      type="button"
                      className="region-explore-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const regionName = (r.name || '').toLowerCase().replace(/\s+/g, '-');
                        console.log('Navigating to region:', regionName);
                        router.push(`/explore-destination/region/${regionName}`);
                      }}
                    >
                      <span>Explore</span>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 14L12 9L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className="region-corner-accent"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="region-grid">
            <div className="region-card">
              <div className="region-card-inner">
                <div className="region-content">
                  <p>No data available</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>

    <section className="explore-destination-hero-section adv-section">
      <div className="adv-container">
        <div className="adv-header">
          <h2 className="adv-title">
            <span className="adv-title-text">Adventure</span>
            <span className="adv-title-highlight"> Activities</span>
          </h2>
          <p className="adv-subtitle">Experience thrilling adventures and create unforgettable memories</p>
          <div className="adv-separator"></div>
        </div>
        {loading.activities ? (
          <div className="adv-grid">
            {[...new Array(4)].map((_, idx) => (
              <div className="adv-card" key={idx}>
                <div className="adv-card-inner">
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={250}
                    sx={{
                      borderRadius: '20px',
                      bgcolor: '#e2e8f0',
                      mb: 2
                    }}
                    animation="wave"
                  />
                  <div className="adv-content" style={{ padding: '1.5rem' }}>
                    <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="text" width="100%" height={20} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="adv-grid">
            {activities.map((act, i) => (
              <div className="adv-card" key={i}>
                <div className="adv-card-inner">
                  <div className="adv-image-wrapper">
                    <img src={act.image} alt={act.name} />
                    <div className="adv-shine-effect"></div>
                  </div>
                  <div className="adv-content">
                    <div className="adv-icon-wrapper">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="adv-name">{act.name}</h3>
                    <button 
                      className="adv-explore-btn"
                      onClick={() => {
                        const activityName = (act.name || '').toLowerCase().replace(/\s+/g, '-');
                        router.push(`/explore-destination/adventure/${activityName}`);
                      }}
                    >
                      <span>Explore</span>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 14L12 9L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="adv-grid">
            <div className="adv-card">
              <div className="adv-card-inner">
                <div className="adv-content">
                  <p>No data available</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>

    <section className="explore-destination-hero-section culture-section">
      <div className="culture-container">
        <div className="culture-header">
          <h2 className="culture-title">
            <span className="culture-title-text">Culture &</span>
            <span className="culture-title-highlight"> Heritage</span>
          </h2>
          <p className="culture-subtitle">Explore India's rich cultural heritage and historical monuments</p>
          <div className="culture-separator"></div>
        </div>
        {loading.heritage ? (
          <div className="adv-grid">
            {[...new Array(4)].map((_, idx) => (
              <div className="adv-card" key={idx}>
                <div className="adv-card-inner">
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={250}
                    sx={{
                      borderRadius: '20px',
                      bgcolor: '#e2e8f0',
                      mb: 2
                    }}
                    animation="wave"
                  />
                  <div className="adv-content" style={{ padding: '1.5rem' }}>
                    <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="text" width="100%" height={20} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : heritage.length > 0 ? (
          <div className="adv-grid">
            {heritage.map((heritageItem, i) => (
              <div className="adv-card" key={i}>
                <div className="adv-card-inner">
                  <div className="adv-image-wrapper">
                    <img src={heritageItem.image} alt={heritageItem.name} />
                    <div className="adv-shine-effect"></div>
                  </div>
                  <div className="adv-content">
                    <div className="adv-icon-wrapper">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="adv-name">{heritageItem.name}</h3>
                    <button 
                      className="adv-explore-btn"
                      onClick={() => {
                        const heritageName = (heritageItem.name || '').toLowerCase().replace(/\s+/g, '-');
                        router.push(`/explore-destination/heritage/${heritageName}`);
                      }}
                    >
                      <span>Explore</span>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 14L12 9L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="adv-grid">
            <div className="adv-card">
              <div className="adv-card-inner">
                <div className="adv-content">
                  <p>No data available</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  </main>
</div>
        </>
    );
}


