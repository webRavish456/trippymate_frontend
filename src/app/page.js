'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Grid, Skeleton } from "@mui/material";
import AOS from "aos";
import { Shadows_Into_Light } from "next/font/google";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { API_BASE_URL } from '@/lib/config';

const shadows = Shadows_Into_Light({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();
  const swiperRef = useRef(null);
  const offeringsSwiperRef = useRef(null);
  const [banners, setBanners] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [adventurePosts, setAdventurePosts] = useState([]);
  const [adventureLoading, setAdventureLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
      offset: 100
    });
    fetchBanners();
    fetchAdventurePosts();
  }, []);

  const fetchBanners = async () => {
    try {
      setBannerLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/user/banner/active?position=homepage`);
      const data = await response.json();
      
      if (data.status && data.data) {
        setBanners(data.data);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setBannerLoading(false);
    }
  };

  const fetchAdventurePosts = async () => {
    try {
      setAdventureLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/user/adventure-post/homepage?limit=8`);
      const data = await response.json();
      
      if (data.status && data.data) {
        setAdventurePosts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching adventure posts:", error);
    } finally {
      setAdventureLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-zinc-50 font-sans dark:bg-white" style={{ width: '100%', maxWidth: '100%' }}>
      <main className="flex w-full flex-col items-center bg-white dark:bg-white" style={{ width: '100%', maxWidth: '100%' }}>
        {/* Companion Banner Section */}
        <section className="companion-banner-section-dummy">
          {bannerLoading ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              animation="wave"
              sx={{
                bgcolor: '#e2e8f0',
                borderRadius: 0
              }}
            />
          ) : banners.length > 0 ? (
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation={banners.length > 1}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              loop={banners.length > 1}
              className="companion-banner-swiper"
              style={{ width: '100%', height: '100%' }}
            >
              {banners.map((banner, index) => (
                <SwiperSlide key={banner._id || index}>
                  <div className="banner-slide-wrapper">
                    {banner.link ? (
                      <a href={banner.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                        <img
                          src={banner.image}
                          alt={banner.title || 'Banner'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        <div className="banner-overlay"></div>
                      </a>
                    ) : (
                      <>
                        <img
                          src={banner.image}
                          alt={banner.title || 'Banner'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        <div className="banner-overlay"></div>
                      </>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="companion-banner-dummy-wrapper">
              <div className="companion-banner-dummy-content">
                <h1 className="companion-banner-dummy-title">TrippyMates</h1>
                <p className="companion-banner-dummy-subtitle">Your Travel Companion</p>
              </div>
            </div>
          )}
        </section>


      
        <section className="unforgettable-journey-section">
     
          <div className="unforgettable-journey-hero">
            <div className="unforgettable-journey-background-new">
              <div className="unforgettable-journey-background-overlay"></div>
              <div className="unforgettable-journey-circle-1"></div>
              <div className="unforgettable-journey-circle-2"></div>
              <div className="unforgettable-journey-circle-3"></div>
              <div className="unforgettable-journey-circle-4"></div>
              <div className="unforgettable-journey-circle-5"></div>
              <div className="unforgettable-journey-circle-6"></div>
              <div className="unforgettable-journey-circle-7"></div>
              <div className="unforgettable-journey-circle-8"></div>
              <div className="unforgettable-journey-circle-9"></div>
              <div className="unforgettable-journey-circle-10"></div>
            </div>
            

            <div className="unforgettable-journey-content ">
              <h1 className="unforgettable-journey-heading animation-glow" data-aos="fade-down" data-aos-delay="200">
                <span>UNFORGETTABLE</span>
                <span>JOURNEY AWAITS</span>
              </h1>
              
          
              <div className="unforgettable-journey-companions" data-aos="fade-up" data-aos-delay="400">

     
                <img src="/meet-our-captain.png" alt="Companions" className="companions-image" style={{position:"relative"}} />
                
         
                <button 
                  className="unforgettable-journey-hire-captain-btn" 
                  data-aos="fade-up" 
                  data-aos-delay="600"
                  onClick={() => router.push('/trippy-mates')}
                  type="button"
                >
                  Hire a Captain
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
           

           
              </div>

           


              <div className="hidden-gems-section">
            <div className="hidden-gems-container">
              <button 
                className="hidden-gems-nav hidden-gems-nav-left swiper-button-prev-custom" 
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
                spaceBetween={32}
                slidesPerView={1}
                loop={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                navigation={{
                  prevEl: '.swiper-button-prev-custom',
                  nextEl: '.swiper-button-next-custom',
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 24,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 32,
                  },
                  1280: {
                    slidesPerView: 4,
                    spaceBetween: 32,
                  },
                }}
                className="hidden-gems-cards"
              >
                <SwiperSlide>
                  <div className="hidden-gems-card hidden-gems-card-1" data-aos="fade-up" data-aos-delay="200">
                    <h3 className="hidden-gems-card-title">Travel Solo, Not Alone</h3>
                    <p className="hidden-gems-card-description">
                      Connect with like-minded travelers and turn solo trips into shared adventures filled with friendship.
                    </p>
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="hidden-gems-card hidden-gems-card-2" data-aos="fade-up" data-aos-delay="300">
                    <h3 className="hidden-gems-card-title">Find Your Travel Tribe</h3>
                    <p className="hidden-gems-card-description">
                      Discover perfect travel companions who match your style, whether you seek adventure, culture, or nature.
                    </p>
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="hidden-gems-card hidden-gems-card-3" data-aos="fade-up" data-aos-delay="400">
                    <h3 className="hidden-gems-card-title">Safety in Numbers</h3>
                    <p className="hidden-gems-card-description">
                      Travel confidently with our verified community and experienced captains ensuring safe, authentic experiences.
                    </p>
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="hidden-gems-card hidden-gems-card-4" data-aos="fade-up" data-aos-delay="500">
                    <h3 className="hidden-gems-card-title">Split Costs, Share Memories</h3>
                    <p className="hidden-gems-card-description">
                      Share expenses with your TrippyMates and create priceless memories together. More fun, less expense.
                    </p>
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="hidden-gems-card hidden-gems-card-5" data-aos="fade-up" data-aos-delay="600">
                    <h3 className="hidden-gems-card-title">From Strangers to Friends</h3>
                    <p className="hidden-gems-card-description">
                      Every journey starts with strangers but ends with friends. Form lasting friendships through travel.
                    </p>
                  </div>
                </SwiperSlide>
              </Swiper>

              <button 
                className="hidden-gems-nav hidden-gems-nav-right swiper-button-next-custom" 
                aria-label="Next"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
              
            </div>



            {/* Footer Text */}
            <div className="unforgettable-journey-footer">
              <p className="unforgettable-journey-footer-text">
                DISCOVER STORIES . CAPTURE MEMORIES . FIND TRIPMATES
              </p>
            </div>
          </div>


        
        </section>

        {/* How it Works Section */}
        <section className="how-it-works-section">
          <div className="how-it-works-container">
        
            <div className="how-it-works-header">
              <h2 className="how-it-works-title" data-aos="fade-up">
                <span className="how-text">How</span>
                <span className="trippy-mates-text"> Trippy Mates Works</span>
              </h2>
              <p className="how-it-works-subtitle" data-aos="fade-up" data-aos-delay="100">
                Your travel journey simplified into three easy steps.
              </p>
            </div>

          
            <div className="how-it-works-content">
      
              <div className="how-it-works-steps">
   
                <div className="how-it-works-card " data-aos="fade-up" data-aos-delay="200">
                  <div className="how-it-works-icon-wrapper">
                    <svg className="how-it-works-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 className="how-it-works-card-title">Set Your Destination</h3>
                  <p className="how-it-works-card-description">
                    Choose your preferred dates and budget — we'll help you find the perfect match.
                  </p>
                </div>

        
                <div className="how-it-works-connector" data-aos="fade-left" data-aos-delay="300"></div>

         
                <div className="how-it-works-card" data-aos="fade-up" data-aos-delay="400">
                  <div className="how-it-works-icon-wrapper" >
                    <svg className="how-it-works-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 11C17.66 11 19 9.66 19 8C19 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM16 7C16.55 7 17 7.45 17 8C17 8.55 16.55 9 16 9C15.45 9 15 8.55 15 8C15 7.45 15.45 7 16 7Z" fill="currentColor"/>
                      <path d="M8 11C9.66 11 11 9.66 11 8C11 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 7C8.55 7 9 7.45 9 8C9 8.55 8.55 9 8 9C7.45 9 7 8.55 7 8C7 7.45 7.45 7 8 7Z" fill="currentColor"/>
                      <path d="M12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14ZM12 12C12 12 12 12 12 12C12 12 12 12 12 12C12 12 12 12 12 12Z" fill="currentColor"/>
                      <path d="M16 13C16.55 13 17 13.45 17 14V19C17 19.55 16.55 20 16 20C15.45 20 15 19.55 15 19V14C15 13.45 15.45 13 16 13Z" fill="currentColor"/>
                      <path d="M8 13C8.55 13 9 13.45 9 14V19C9 19.55 8.55 20 8 20C7.45 20 7 19.55 7 19V14C7 13.45 7.45 13 8 13Z" fill="currentColor"/>
                      <path d="M12 15C11.45 15 11 15.45 11 16V19C11 19.55 11.45 20 12 20C12.55 20 13 19.55 13 19V16C13 15.45 12.55 15 12 15Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 className="how-it-works-card-title">Find Your Group or Captain</h3>
                  <p className="how-it-works-card-description">
                    We match you with travel buddies based on your interests and vibe.
                  </p>
                </div>

           
                <div className="how-it-works-connector" data-aos="fade-left" data-aos-delay="500"></div>

        
                <div className="how-it-works-card" data-aos="fade-up" data-aos-delay="600">
                  <div className="how-it-works-icon-wrapper">
                    <svg className="how-it-works-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 6.5H17.5L19.11 11H4.89L6.5 6.5ZM6.5 16.5C5.67 16.5 5 15.83 5 15C5 14.17 5.67 13.5 6.5 13.5C7.33 13.5 8 14.17 8 15C8 15.83 7.33 16.5 6.5 16.5ZM17.5 16.5C16.67 16.5 16 15.83 16 15C16 14.17 16.67 13.5 17.5 13.5C18.33 13.5 19 14.17 19 15C19 15.83 18.33 16.5 17.5 16.5Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 className="how-it-works-card-title">Book & Go!</h3>
                  <p className="how-it-works-card-description">
                    Confirm your trip with secure payment and get instant support from our team.
                  </p>
                </div>
              </div>

   
              <div className="how-it-works-cta">
                <button 
                  className="btn how-it-works-button" 
                  data-aos="zoom-in" 
                  data-aos-delay="700"
                  onClick={() => router.push('/packages')}
                  type="button"
                >
                  Plan Your Trip
                  <svg className="how-it-works-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 7L18 12L13 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Connect With Your Kind Section */}
        <section className="connect-kind-section" style={{marginBlock:"80px"}}>
          {/* Top Header Banner */}
          <div className="connect-kind-header">
            <h2 className="connect-kind-title">
              <span className="connect-text">Connect</span>
              <span className="with-your-kind-text"> With Your Kind</span>
            </h2>
          </div>

          {/* Main Content Area */}
          <div className="connect-kind-background">
            <div className="connect-kind-border-top">
              <img
                src="/connect/connect-design-2.png"
                alt="Connect design accent"
                className="connect-kind-top-border-image"
              />
            </div>

            {/* Animated Connect Images */}
            <div className="connect-kind-floating-images">
              <div className="connect-float-wrapper connect-float-1">
                <img src="/connect/connect-1.png" alt="Connect" className="connect-float-image" />
              </div>
              <div className="connect-float-wrapper connect-float-2">
                <img src="/connect/connect-2.png" alt="Connect" className="connect-float-image" />
              </div>
              <div className="connect-float-wrapper connect-float-3">
                <img src="/connect/connect-3.png" alt="Connect" className="connect-float-image" />
              </div>
              <div className="connect-float-wrapper connect-float-4">
                <img src="/connect/connect-4.png" alt="Connect" className="connect-float-image" />
              </div>
              <div className="connect-float-wrapper connect-float-5">
                <img src="/connect/connect-5.png" alt="Connect" className="connect-float-image" />
              </div>
              <div className="connect-float-wrapper connect-float-6">
                <img src="/connect/connect-6.png" alt="Connect" className="connect-float-image" />
              </div>
              <div className="connect-float-wrapper connect-float-7">
                <img src="/connect/connect-7.png" alt="Connect" className="connect-float-image" />
              </div>
              <div className="connect-float-wrapper connect-float-8">
                <img src="/connect/connect-8.png" alt="Connect" className="connect-float-image" />
              </div>
              <div className="connect-float-wrapper connect-float-9">
                <img src="/connect/connect-9.png" alt="Connect" className="connect-float-image" />
              </div>
              <div className="connect-float-wrapper connect-float-10">
                <img src="/connect/connect-10.png" alt="Connect" className="connect-float-image" />
              </div>
              <div className="connect-float-wrapper connect-float-11">
                <img src="/connect/connect-11.png" alt="Connect" className="connect-float-image" />
              </div>
            </div>

            {/* Content Overlay */}
            <div className="connect-kind-content">
              <div className="connect-kind-content-overlay">
                <h1 className="connect-kind-main-heading animation-glow" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="200">
                   Find Your Trippy Mate — 
                </h1>
                <p className="connect-kind-description" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
                  Set your destination, dates, and budget — and we'll connect you with travelers who share your vibe.
                </p>
                <div className="connect-kind-buttons">
                  <button 
                    className="btn connect-kind-button connect-kind-button-primary" 
                    data-aos="fade-right" 
                    data-aos-duration="1000" 
                    data-aos-delay="600"
                    onClick={() => router.push('/crew')}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 8C8.65685 8 10 6.65685 10 5C10 3.34315 8.65685 2 7 2C5.34315 2 4 3.34315 4 5C4 6.65685 5.34315 8 7 8Z" fill="currentColor"/>
                      <path d="M13 8C14.6569 8 16 6.65685 16 5C16 3.34315 14.6569 2 13 2C11.3431 2 10 3.34315 10 5C10 6.65685 11.3431 8 13 8Z" fill="currentColor"/>
                      <path d="M3 15C3 12.2386 5.23858 10 8 10C10.7614 10 13 12.2386 13 15V17H3V15Z" fill="currentColor"/>
                      <path d="M12 15C12 12.7909 13.7909 11 16 11C18.2091 11 20 12.7909 20 15V17H12V15Z" fill="currentColor"/>
                    </svg>
                    Join a Crew
                  </button>
                  <button 
                    className="btn outline-btn connect-kind-button connect-kind-button-secondary" 
                    data-aos="fade-left" 
                    data-aos-duration="1000" 
                    data-aos-delay="600"
                    onClick={() => router.push('/explore-destination')}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3V17M3 10H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    Create Your Own Crew
                  </button>
                </div>
                <p className="connect-kind-quote" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="800">
                  "No more solo fears — travel with people who get you."
                </p>
              </div>
            </div>

            <div className="connect-kind-border-bottom">
              <img
                src="/connect/connect-design.png"
                alt="Connect design accent"
                className="connect-kind-bottom-border-image"
              />
            </div>
          </div>
        </section>

        {/* Journey in Frames Section */}
        <section className="journey-frames-section">
       
            {/* Header */}
            <div className="journey-frames-header">
              <h2 className="journey-frames-title">
                <span className="journey-in-text">Journey </span>
                <span className="frames-text">in Frames</span>
              </h2>
            </div>
           
            {/* Image Frames */}

            <div className="journey-frames-grid">
              <Grid container spacing={4}>

                <Grid size={{xs: 12, sm: 4, md: 2.4}}>
                   <div className="journey-frame-wrapper journey-frame-wrapper-grid">
                    <div className="journey-frame-inner">
                      <img 
                        src="/journey-frame/journey-frame-1.png" 
                        alt="Journey frame 1" 
                        className="journey-frame-image"
                      />
                    </div>
                    </div>
                    </Grid>

                    <Grid size={{xs: 12, sm: 4, md: 2.4}}>

                    <div className="journey-frame-wrapper">
                    <div className="journey-frame-inner">
                      <img 
                        src="/journey-frame/journey-frame-2.png" 
                        alt="Journey frame 1" 
                        className="journey-frame-image"
                      />
                    </div>
                    </div>
                
                 
                    </Grid>


                    <Grid size={{xs: 12, sm: 4, md: 2.4}}>
                
                    <div className="journey-frame-wrapper journey-frame-highlighted"> 
                      <div className="journey-frame-inner">
                      <img 
                        src="/journey-frame/journey-frame-3.png" 
                        alt="Journey frame 1" 
                        className="journey-frame-image"
                      />
                    </div>

                    </div>
                    </Grid>


                    <Grid size={{xs: 12, sm: 4, md: 2.4}}>
               
                    <div className="journey-frame-wrapper"> 
                      <div className="journey-frame-inner">
                      <img 
                        src="/journey-frame/journey-frame-4.png" 
                        alt="Journey frame 1" 
                        className="journey-frame-image"
                      />
                    </div>
                    </div>
                    </Grid>


                    <Grid size={{xs: 12, sm: 4, md: 2.4}}>
                  
                    <div className="journey-frame-wrapper journey-frame-wrapper-grid">
                       <div className="journey-frame-inner">
                      <img 
                        src="/journey-frame/journey-frame-5.png" 
                        alt="Journey frame 1" 
                        className="journey-frame-image"
                      />
                    </div>
                    </div>
                    </Grid>
              </Grid>
              {/* <div className="journey-frame-wrapper">
                <div className="journey-frame-inner">
                  <img 
                    src="/journey-frame/journey-frame-1.png" 
                    alt="Journey frame 1" 
                    className="journey-frame-image"
                  />
                </div>
             
              </div>

              <div className="journey-frame-wrapper journey-frame-highlighted">
                <div className="journey-frame-inner">
                  <img 
                    src="/journey-frame/journey-frame-3.png" 
                    alt="Journey frame 3" 
                    className="journey-frame-image"
                  />
                </div>
              </div>

              <div className="journey-frame-wrapper">
                <div className="journey-frame-inner">
                  <img 
                    src="/journey-frame/journey-frame-4.png" 
                    alt="Journey frame 3" 
                    className="journey-frame-image"
                  />
                </div>
              </div>

              <div className="journey-frame-wrapper">
                <div className="journey-frame-inner">
                  <img 
                    src="/journey-frame/journey-frame-5.png" 
                    alt="Journey frame 3" 
                    className="journey-frame-image"
                  />
                </div>
              </div> */}

            </div>
     

          {/* Our Offerings Section */}
          <div className="our-offerings-section">
            <div className="our-offerings-container">
              {/* Header */}
              <div className="our-offerings-header">
                <h2 className="our-offerings-title" data-aos="fade-up">
                  <span className="our-text">Our</span>
                  <span className="offerings-text"> Offerings</span>
                </h2>
                <p className="our-offerings-subtitle" data-aos="fade-up" data-aos-delay="100">
                  Discover the experiences that make every journey with Trippy Mates special.
                </p>
                <div className="our-offerings-separator" data-aos="fade-up" data-aos-delay="200"></div>
              </div>

              {/* Offerings Cards */}
              <div className="our-offerings-cards-wrapper">
                <button 
                  className="our-offerings-nav our-offerings-nav-left swiper-button-prev-offerings" 
                  aria-label="Previous"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <Swiper
                  onSwiper={(swiper) => {
                    offeringsSwiperRef.current = swiper;
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
                    prevEl: '.swiper-button-prev-offerings',
                    nextEl: '.swiper-button-next-offerings',
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
                  }}
                  className="our-offerings-cards"
                >
                  <SwiperSlide>
                    <div className="our-offerings-card" data-aos="fade-up" data-aos-delay="400">
                      <div className="our-offerings-card-image-wrapper">
                        <img 
                          src="/offering/offering-1.png" 
                          alt="Connect. Travel. Celebrate." 
                          className="our-offerings-card-image"
                        />
                        <div className="our-offerings-card-overlay"></div>
                      </div>
                      <div className="our-offerings-card-content">
                        <h3 className="our-offerings-card-title">Connect. Travel. Celebrate.</h3>
                        <p className="our-offerings-card-description">
                          Turn strangers into friends along the way.
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide>
                    <div className="our-offerings-card" data-aos="fade-up" data-aos-delay="500">
                      <div className="our-offerings-card-image-wrapper">
                        <img 
                          src="/offering/offering-2.png" 
                          alt="Start Your Group Adventure" 
                          className="our-offerings-card-image"
                        />
                        <div className="our-offerings-card-overlay"></div>
                      </div>
                      <div className="our-offerings-card-content">
                        <h3 className="our-offerings-card-title">Start Your Group Adventure</h3>
                        <p className="our-offerings-card-description">
                          Join like-minded travelers and make memories that last forever.
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide>
                    <div className="our-offerings-card" data-aos="fade-up" data-aos-delay="600">
                      <div className="our-offerings-card-image-wrapper">
                        <img 
                          src="/offering/offering-3.png" 
                          alt="Guided by Our Local Captains" 
                          className="our-offerings-card-image"
                        />
                        <div className="our-offerings-card-overlay"></div>
                      </div>
                      <div className="our-offerings-card-content">
                        <h3 className="our-offerings-card-title">Guided by Our Local Captains</h3>
                        <p className="our-offerings-card-description">
                          Explore places with someone who knows them best.
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                </Swiper>

                <button 
                  className="our-offerings-nav our-offerings-nav-right swiper-button-next-offerings" 
                  aria-label="Next"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
         
      </section>

        {/* Trippy Darshan Section */}
        <section className="trippy-darshan-section">
          <div className="trippy-darshan-container">
            {/* Header */}
            <div className="trippy-darshan-header">
              <h2 className="trippy-darshan-title" data-aos="fade-up">
                <span className="trippy-text">Trippy</span>
                <span className="darshan-text"> Darshan</span>
              </h2>
              <p className="trippy-darshan-subtitle" data-aos="fade-up" data-aos-delay="100">
                Real moments from our travellers across India — every picture tells a story of friendship and <span className="adventure-text">adventure</span>.
              </p>
              <div className="trippy-darshan-separator" data-aos="fade-up" data-aos-delay="200"></div>
            </div>

            {/* Image Grid */}
            {adventureLoading ? (
              <div className="trippy-darshan-grid">
                {[...new Array(8)].reverse().map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    width="100%"
                    sx={{
                      aspectRatio: '1',
                      borderRadius: '16px',
                      bgcolor: '#e2e8f0',
                    }}
                    animation="wave"
                  />
                ))}
              </div>
            ) : adventurePosts.length > 0 ? (
              <div className="trippy-darshan-grid">
                {[...adventurePosts].reverse().map((post, index) => (
                  <img
                    key={post._id || index}
                    src={post.image}
                    alt={post.title || `Travel moment ${index + 1}`}
                    className="trippy-darshan-image"
                    data-aos="zoom-in"
                    data-aos-delay={(index % 4) * 100 + 100}
                  />
                ))}
              </div>
            ) : (
              <div className="trippy-darshan-grid" style={{ 
                gridColumn: '1 / -1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3rem 2rem',
                minHeight: '400px'
              }}>
                <div style={{
                  maxWidth: '500px',
                  textAlign: 'center',
                  padding: '3rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '20px',
                  border: '2px dashed #d1d5db'
                }}>
                  <svg 
                    width="80" 
                    height="80" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ margin: '0 auto 1.5rem', display: 'block', opacity: 0.6 }}
                  >
                    <path 
                      d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" 
                      stroke="#6b7280" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-family-sans-serif)'
                  }}>
                    No Adventures Yet
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: 0,
                    fontFamily: 'var(--font-family-sans-serif)'
                  }}>
                    We're collecting amazing travel moments from our community. Check back soon for inspiring adventures!
                  </p>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="trippy-darshan-cta">
              <button 
                className=" home-btn trippy-darshan-button" 
                data-aos="fade-up" 
                data-aos-delay="500"
                onClick={() => router.push('/adventure')}
                type="button"
              >
                <img src="/adventure.png" alt="Adventure icon" className="trippy-darshan-button-icon" />
                View All Adventures
              </button>
            </div>
          </div>
        </section>

        {/* Community Section with Globe Background */}
        <section className="community-section" style={{marginBlock:"70px"}}>
          <img 
            src="/community/Globe.png" 
            alt="India travel map with destinations and travelers"
          />
          <div className="community-decor">
            <div className="community-traveler community-traveler-gokarna">
              <img
                src="/community/human-1.png"
                alt="Traveler exploring Gokarna"
              />
       
            </div>

            <div className="community-traveler community-traveler-pondicherry">
              <img
                src="/community/human-4.png"
                alt="Travelers discovering Pondicherry"
              />
             
            </div>

            <div className="community-traveler community-traveler-goa">
              <img
                src="/community/human-5.png"
                alt="Friends celebrating in Goa"
              />
           
            </div>

            <div className="community-traveler community-traveler-manali">
              <img
                src="/community/human-2.png"
                alt="Travelers enjoying Manali"
              />
    
            </div>

            <div className="community-traveler community-traveler-puri">
              <img
                src="/community/human-3.png"
                alt="Explorer capturing memories in Puri"
              />
             
            </div>

            <div className="community-traveler community-traveler-covelong">
              <img
                src="/community/human-6.png"
                alt="Travel buddies celebrating in Covelong"
              />
            
            </div>

      
         

            <div className="community-spot community-spot-gokarna">
              <img
                src="/community/gokarna.jpg"
                alt="Gokarna coastline"
                className="community-spot-image"
              />
              <span className="community-spot-label">Gokarna</span>
            </div>

            <div className="community-spot community-spot-alleppey">
              <img
                src="/community/d4b7e9c625f4eac76b5782362d19532f5fdb741c.jpg"
                alt="Alleppey backwaters"
                className="community-spot-image"
              />
              <span className="community-spot-label">Alleppey</span>
            </div>

            <div className="community-spot community-spot-goa">
              <img
                src="/community/goa.jpg"
                alt="Goa coastline"
                className="community-spot-image"
              />
              <span className="community-spot-label">Goa</span>
            </div>

            <div className="community-spot community-spot-manali">
              <img
                src="/community/manali.jpg"
                alt="Manali mountains"
                className="community-spot-image"
              />
              <span className="community-spot-label">Manali</span>
            </div>

            <div className="community-spot community-spot-pondicherry">
              <img
                src="/community/pondicherry.jpg"
                alt="Pondicherry promenade"
                className="community-spot-image"
              />
              <span className="community-spot-label">Pondicherry</span>
            </div>

            <div className="community-spot community-spot-andaman">
              <img
                src="/community/andaman.jpg"
                alt="Andaman islands"
                className="community-spot-image"
              />
              <span className="community-spot-label">Andaman</span>
            </div>

            <div className="community-spot community-spot-covelong">
              <img
                src="/community/covelong.jpg"
                alt="Covelong beach"
                className="community-spot-image"
              />
              <span className="community-spot-label">Covelong</span>
            </div>

            <div className="community-spot community-spot-puri">
              <img
                src="/community/puri.jpg"
                alt="Puri coastline"
                className="community-spot-image"
              />
              <span className="community-spot-label">Puri</span>
            </div>
          </div>
          <div className="community-content">
            <div className="community-top-content">
              <h2 className="community-heading" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">Become Part of India's Fastest <br></br> Growing Travel Community.</h2>
            </div>
            <div className="community-bottom-content">
              <button 
                className="home-btn community-button" 
                data-aos="zoom-in" 
                data-aos-duration="1000" 
                data-aos-delay="400"
                onClick={() => router.push('/community')}
                type="button"
              >
                Join Our Community
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="community-arrow-icon">
                  <path d="M5 12H19M19 12L14 7M19 12L14 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </section>

  
     
      </main>
    </div>
  );
}
