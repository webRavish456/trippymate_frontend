'use client';

import { useState, useEffect, useRef } from "react";
import { Grid, useMediaQuery, useTheme, Skeleton } from "@mui/material";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { io } from 'socket.io-client';
import 'swiper/css';
import 'swiper/css/navigation';
import { API_BASE_URL } from '@/lib/config';

export default function CommunityPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [selectedDestination, setSelectedDestination] = useState('all');
  const [selectedDate, setSelectedDate] = useState('any');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [sortBy, setSortBy] = useState('most-popular');
  const [joinedTrips, setJoinedTrips] = useState(new Set()); 
  const [pendingTrips, setPendingTrips] = useState(new Set()); 
  const [showFindCommunity, setShowFindCommunity] = useState(false);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [tripImage, setTripImage] = useState(null);
  const [tripImagePreview, setTripImagePreview] = useState(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [formedTrips, setFormedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [createTripData, setCreateTripData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    groupType: 'Mixed Group',
    tripType: 'other',
    maxMembers: 20
  });

  // Fetch trips from backend
  useEffect(() => {
    fetchTrips();
  }, []);

  // Socket: listen for join-request-status (approved/rejected) so UI updates in real time
  const socketRef = useRef(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('join-user-room');
    });
    socket.on('join-request-status', (data) => {
      const { tripId, status } = data || {};
      if (!tripId) return;
      setJoinedTrips(prev => {
        const next = new Set(prev);
        if (status === 'approved') {
          next.add(tripId);
        }
        return next;
      });
      setPendingTrips(prev => {
        const next = new Set(prev);
        next.delete(tripId);
        return next;
      });
      setToast({
        show: true,
        message: status === 'approved'
          ? 'Your join request was approved. You have joined the trip!'
          : 'Your join request was not approved for this trip.'
      });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      
    
      const upcomingResponse = await fetch(`${API_BASE_URL}/api/user/community-trip/all?status=upcoming&limit=3`);
      const upcomingResult = await upcomingResponse.json();
      
      if (upcomingResult.status) {
        const transformedUpcoming = upcomingResult.data.map(trip => {
          const organizerName = trip.organizerName || 'Organizer';
          const displayName = (organizerName.toLowerCase() === 'superadmin@gmail.com' || organizerName === 'superadmin@gmail.com') ? 'Admin' : organizerName;
          
          return {
            id: trip._id,
            image: trip.images?.[0]?.path || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
            hostName: displayName,
            hostImage: trip.organizerImage?.path || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            rating: trip.organizerRating || 0,
            verified: trip.organizerVerified || false
          };
        });
        setUpcomingTrips(transformedUpcoming);
      }

      // Fetch formed trips (ongoing and upcoming) — send token so backend can return correct membership
      const token = localStorage.getItem('token');
      const formedResponse = await fetch(`${API_BASE_URL}/api/user/community-trip/all?limit=6`, {
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      });
      const formedResult = await formedResponse.json();
      
      if (formedResult.status) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = (user._id || user.id)?.toString?.() || user._id || user.id;
        
        const transformedFormed = formedResult.data.map(trip => {
          const startDate = new Date(trip.startDate);
          const endDate = new Date(trip.endDate);
          const dateRange = `${startDate.getDate()} - ${endDate.getDate()} ${endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
          
          const tripTypeMap = {
            adventure: 'Adventure',
            beach: 'Beach Vibes',
            cultural: 'Cultural',
            nature: 'Nature Lovers',
            festival: 'Music Festival',
            relaxation: 'Relaxation',
            other: 'Mixed Group'
          };
          
          const organizerName = trip.organizerName || 'Organizer';
          const displayName = (organizerName.toLowerCase() === 'superadmin@gmail.com' || organizerName === 'superadmin@gmail.com') ? 'Admin' : organizerName;
          
          // Check user's membership status (userId can be populated object or raw id)
          const memberId = (m) => (m.userId?._id ?? m.userId)?.toString?.() ?? (m.userId && String(m.userId));
          const userMember = trip.members?.find(m => memberId(m) === (userId && String(userId)));
          const memberStatus = userMember?.status || null;
          
          return {
            id: trip._id,
            dateRange: dateRange,
            image: trip.images?.[0]?.path || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop',
            title: trip.title,
            description: tripTypeMap[trip.tripType] || trip.tripType,
            members: trip.members?.length || 0,
            groupType: trip.groupType,
            hostName: displayName,
            hostImage: trip.organizerImage?.path || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            rating: trip.organizerRating || 0,
            verified: trip.organizerVerified || false,
            memberStatus: memberStatus // 'approved', 'pending', 'rejected', or null
          };
        });
        setFormedTrips(transformedFormed);
        
        // Update joined and pending sets based on member status
        const approvedIds = new Set();
        const pendingIds = new Set();
        transformedFormed.forEach(trip => {
          if (trip.memberStatus === 'approved') {
            approvedIds.add(trip.id);
          } else if (trip.memberStatus === 'pending') {
            pendingIds.add(trip.id);
          }
        });
        setJoinedTrips(approvedIds);
        setPendingTrips(pendingIds);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', position: 'relative' }}>
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#1D4ED8',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: '1rem', fontWeight: '600' }}>{toast.message}</span>
        </div>
      )}
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1D4ED8 0%, #1e40af 100%)',
        padding: '6rem 6rem',
        color: 'white',
        textAlign: 'center',
        overflow: 'hidden',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Background Image */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.2,
          zIndex: 0
        }} />
        
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: '800', 
            marginBottom: '1.5rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            lineHeight: '1.2'
          }}>
            Travel Together, Celebrate Together
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            opacity: 0.95,
            marginBottom: '3rem',
            lineHeight: '1.6'
          }}>
            See who's traveling where and when — join a community that matches your vibe.
          </p>
          
          {/* CTA Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => setShowFindCommunity(true)}
              style={{
                backgroundColor: 'white',
                color: '#1D4ED8',
                padding: '1rem 2.5rem',
                borderRadius: '50px',
                border: 'none',
                fontSize: '1.125rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
              </svg>
              Find My Community
            </button>
            <button 
              onClick={() => setShowCreateTrip(true)}
              style={{
                backgroundColor: 'white',
                color: '#1D4ED8',
                padding: '1rem 2.5rem',
                borderRadius: '50px',
                border: 'none',
                fontSize: '1.125rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
              </svg>
              Create Your Own Trip Group
            </button>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section style={{
        backgroundColor: 'white',
        padding: '1.5rem 6rem',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <select
          value={selectedDestination}
          onChange={(e) => setSelectedDestination(e.target.value)}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '1rem',
            backgroundColor: 'white',
            cursor: 'pointer',
            minWidth: '180px'
          }}
        >
          <option value="all">All Destinations</option>
          <option value="goa">Goa</option>
          <option value="manali">Manali</option>
          <option value="leh">Leh Ladakh</option>
          <option value="shimla">Shimla</option>
        </select>

        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '1rem',
            backgroundColor: 'white',
            cursor: 'pointer',
            minWidth: '150px'
          }}
        >
          <option value="any">Any Date</option>
          <option value="november">November 2025</option>
          <option value="december">December 2025</option>
          <option value="january">January 2026</option>
        </select>

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '1rem',
            backgroundColor: 'white',
            cursor: 'pointer',
            minWidth: '150px'
          }}
        >
          <option value="all">All Groups</option>
          <option value="mixed">Mixed Group</option>
          <option value="female">Female Only</option>
          <option value="nature">Nature Lovers</option>
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1rem', color: '#64748b' }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '1rem',
              backgroundColor: 'white',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            <option value="most-popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </section>

      {/* Upcoming Community Trips */}
      {!loading && upcomingTrips.length > 0 && (
      <section id="upcoming-trips" className="upcoming-community-section" style={{ padding: isMobile ? '2rem 1rem' : isTablet ? '3rem 2rem' : '4rem 6rem 0rem' }}>
        <div className="upcoming-community-content">
          <div>
            <h2 style={{ 
              fontSize: isMobile ? '1.75rem' : isTablet ? '2rem' : '2.5rem', 
              fontWeight: 'bold', 
              color: '#1D4ED8',
              marginBottom: '0.5rem',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              Upcoming Community Trips
            </h2>
            <p style={{ 
              fontSize: isMobile ? '1rem' : '1.25rem', 
              color: '#64748b',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              Join amazing travelers on their next adventure
            </p>
          </div>

          {loading ? (
            <div style={{ position: 'relative', padding: isMobile ? '1rem 0' : '2rem 0' }}>
              <Swiper
                modules={[Navigation]}
                grabCursor={true}
                centeredSlides={false}
                slidesPerView={isMobile ? 1 : isTablet ? 2 : 3}
                spaceBetween={isMobile ? 20 : isTablet ? 20 : 30}
                navigation={true}
                loop={false}
                style={{
                  padding: isMobile ? '1rem 0 3rem 0' : '2rem 0 4rem 0'
                }}
              >
                {[...new Array(3)].map((_, idx) => (
                  <SwiperSlide key={idx} style={{ height: 'auto' }}>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '20px',
                      border: '1px solid #e5e7eb',
                      overflow: 'visible',
                      height: isMobile ? '480px' : '420px',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '1.5rem'
                    }}>
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={isMobile ? 300 : 240}
                        sx={{
                          borderRadius: '12px',
                          bgcolor: '#e2e8f0',
                          mb: 2
                        }}
                        animation="wave"
                      />
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-60px', marginBottom: '1rem' }}>
                        <Skeleton variant="circular" width={90} height={90} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                      </div>
                      <Skeleton variant="text" width="70%" height={24} sx={{ mx: 'auto', mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                      <Skeleton variant="text" width="50%" height={20} sx={{ mx: 'auto', mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                      <Skeleton variant="text" width="60%" height={20} sx={{ mx: 'auto', bgcolor: '#e2e8f0' }} animation="wave" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
          <div style={{ position: 'relative', padding: isMobile ? '1rem 0' : '2rem 0' }}>
          <Swiper
            modules={[Navigation]}
            grabCursor={true}
            centeredSlides={false}
            slidesPerView={isMobile ? 1 : isTablet ? 2 : 3}
            spaceBetween={isMobile ? 20 : isTablet ? 20 : 30}
            navigation={true}
            loop={false}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              640: {
                slidesPerView: 1.5,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
            style={{
              padding: isMobile ? '1rem 0 3rem 0' : '2rem 0 4rem 0'
            }}
          >
            {upcomingTrips.slice(0, 3).map((trip, index) => {
              const cardHeight = isMobile ? '480px' : isTablet ? '420px' : '420px';
              const imageHeight = isMobile ? '300px' : isTablet ? '240px' : '240px';
              const avatarSize = isMobile ? '80px' : isTablet ? '90px' : '90px';
              const isFirstCard = index === 0;
              
              return (
              <SwiperSlide 
                key={trip.id}
                style={{
                  height: 'auto',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  border: '1px solid #e5e7eb',
                  overflow: 'visible',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  height: cardHeight,
                  display: 'flex',
                  flexDirection: 'column',
                  margin: isMobile ? '0 auto' : '0'
                }}
                onClick={() => {
                  router.push(`/community/${trip.id}?isUpcoming=true`);
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
                  {/* Trip Image */}
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: imageHeight,
                    overflow: 'visible',
                    flexShrink: 0,
                    backgroundColor: isFirstCard ? 'white' : 'transparent',
                    borderRadius: '20px 20px 0 0'
                  }}>
                    {!isFirstCard && (
                      <img 
                        src={trip.image} 
                        alt={trip.hostName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius:'20px 20px 0px 0px',
                           padding:'8px 8px 0px 8px'
                        }}
                      />
                    )}
                    
                    {/* Host Profile Picture - Half upper, half in blue section */}
                    <div style={{
                      position: 'absolute',
                      bottom: isFirstCard ? '-40px' : '-40px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: avatarSize,
                      height: avatarSize,
                      borderRadius: '50%',
                      border: '5px solid white',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      backgroundColor: 'white',
                      zIndex: 10
                    }}>
                      <img 
                        src={trip.hostImage} 
                        alt={trip.hostName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          
                        }}
                      />
                    </div>
                  </div>

                  {/* Bottom Blue Section */}
                  <div style={{ 
                    backgroundColor: '#1D4ED8',
                    padding: '2.5rem 1.5rem 1.25rem 1.5rem',
                    paddingTop: '2.5rem',
                    textAlign: 'center',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    borderRadius: '0 0 20px 20px',
                    borderTopLeftRadius: '50px',
                    borderTopRightRadius: '50px',
                    position: 'relative',
                    overflow: 'visible'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: '8px',
                
                    }}>
                      <h3 style={{ 
                        fontSize: isMobile ? '1.125rem' : '1.25rem', 
                        fontWeight: '700', 
                        color: 'white',
                        margin: 0
                      }}>
                        {trip.hostName}
                      </h3>
                      {trip.verified && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      )}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '0.5rem'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24"/>
                      </svg>
                      <span style={{ 
                        fontSize: isMobile ? '1rem' : '1rem', 
                        fontWeight: '600', 
                        color: 'white' 
                      }}>
                        {trip.rating}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (joinedTrips.has(trip.id)) {
                            router.push(`/community/${trip.id}?isUpcoming=true`);
                            return;
                          }
                          
                          if (pendingTrips.has(trip.id)) {
                            return;
                          }
                          
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(`${API_BASE_URL}/api/user/community-trip/${trip.id}/join`, {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              }
                            });
                            
                            const result = await response.json();
                            
                            if (result.status) {
                              setToast({ show: true, message: 'Your request will be sent' });
                              setTimeout(() => setToast({ show: false, message: '' }), 3000);
                              setPendingTrips(new Set([...pendingTrips, trip.id]));
                            } else {
                              const msg = result.message || 'Failed to send join request';
                              if (msg.toLowerCase().includes('already a member') || msg.toLowerCase().includes('already requested')) {
                                setPendingTrips(prev => new Set([...prev, trip.id]));
                                fetchTrips();
                              }
                              setToast({ show: true, message: msg });
                              setTimeout(() => setToast({ show: false, message: '' }), 4000);
                            }
                          } catch (error) {
                            console.error('Error joining trip:', error);
                            setToast({ show: true, message: 'Failed to send join request. Please try again.' });
                            setTimeout(() => setToast({ show: false, message: '' }), 4000);
                          }
                        }}
                        style={{
                          width: 'auto',
                          minWidth: '100px',
                          backgroundColor: joinedTrips.has(trip.id) ? '#10b981' : pendingTrips.has(trip.id) ? '#f59e0b' : 'white',
                          color: joinedTrips.has(trip.id) || pendingTrips.has(trip.id) ? 'white' : '#1D4ED8',
                          padding: isMobile ? '0.625rem 1.25rem' : '0.625rem 1.25rem',
                          borderRadius: '50px',
                          border: 'none',
                          fontSize: isMobile ? '0.875rem' : '0.875rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!joinedTrips.has(trip.id) && !pendingTrips.has(trip.id)) {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                          }
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          if (!joinedTrips.has(trip.id) && !pendingTrips.has(trip.id)) {
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {joinedTrips.has(trip.id) ? 'Joined' : pendingTrips.has(trip.id) ? 'Pending' : 'Join Now'}
                      </button>
                      {joinedTrips.has(trip.id) && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/community/${trip.id}?isUpcoming=true`);
                          }}
                          style={{
                            width: 'auto',
                            minWidth: '100px',
                            backgroundColor: '#1D4ED8',
                            color: 'white',
                            padding: isMobile ? '0.625rem 1.25rem' : '0.625rem 1.25rem',
                            borderRadius: '50px',
                            border: 'none',
                            fontSize: isMobile ? '0.875rem' : '0.875rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1e40af';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1D4ED8';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          Chat Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
          )}
        </div>
      </section>
      )}

      {/* Formed Community Trips */}
      <section className="formed-community-section" style={{ 
        padding: '0px 6rem 80px', 
        marginBottom: 0,
        ...(loading || formedTrips.length > 0 ? { background: 'linear-gradient(to top, #1d4ed8 20%, rgb(255, 255, 255) 50%, rgb(29, 78, 216,0.96) 100%)' } : {})
      }}>
        <div className="formed-community-content" style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: formedTrips.length === 0 && !loading ? '#334155' : 'white',
            marginBottom: '3rem',
            ...(formedTrips.length > 0 || loading ? { textShadow: '0 2px 10px rgba(0,0,0,0.3)' } : {})
          }}>
            Formed Community Trips
          </h2>

          {loading ? (
            <Grid container rowSpacing={5} columnSpacing={5}>
              {[...new Array(6)].map((_, idx) => (
                <Grid size={{xs:12, sm:6, md:4}} key={idx}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={280}
                      sx={{
                        bgcolor: '#e2e8f0',
                      }}
                      animation="wave"
                    />
                    <div style={{ padding: '1.5rem' }}>
                      <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                        <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                      </div>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          ) : formedTrips.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px'
            }}>
              <p style={{ 
                color: '#475569', 
                fontSize: '1.125rem',
                fontWeight: '500',
                margin: 0,
                letterSpacing: '0.01em'
              }}>
                No trip community yet
              </p>
            </div>
          ) : loading ? (
            <Grid container rowSpacing={5} columnSpacing={5}>
              {[...new Array(6)].map((_, idx) => (
                <Grid size={{xs:12, sm:6, md:4}} key={idx}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={280}
                      sx={{
                        bgcolor: '#e2e8f0',
                      }}
                      animation="wave"
                    />
                    <div style={{ padding: '1.5rem' }}>
                      <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                        <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                      </div>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          ) : (
          <Grid container rowSpacing={5} columnSpacing={5}>
          {formedTrips.map((trip) => (
            <Grid size={{xs:12, sm:6, md:4}} key={trip.id}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
              onClick={() => {
                router.push(`/community/${trip.id}`);
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
                {/* Trip Image with Overlay Content */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '280px',
                  overflow: 'hidden',
                 
                }}>
                  <img 
                    src={trip.image} 
                    alt={trip.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                    padding: '1.5rem',
                    zIndex: 1
                  }}>
                    {/* Title */}
                    <h3 style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      color: 'white',
                      marginBottom: '0.75rem',
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                    }}>
                      {trip.title}
                    </h3>

                    {/* Details Row */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '0.75rem',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ 
                        fontSize: '0.9375rem', 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: '600'
                      }}>
                        {trip.description}
                      </span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>|</span>
                      <span style={{ 
                        fontSize: '0.9375rem', 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: '600'
                      }}>
                        {trip.members} Members
                      </span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>|</span>
                      <span style={{ 
                        fontSize: '0.9375rem', 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: '600'
                      }}>
                        {trip.groupType}
                      </span>
                    </div>
                  </div>

                  {/* Date Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    backgroundColor: 'rgba(29, 78, 216, 0.9)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '50px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    zIndex: 2
                  }}>
                    {trip.dateRange}
                  </div>
                </div>

                {/* Bottom Section - Avatar and Join Button */}
                <div style={{ 
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  {/* Host Info - Left Side */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '0.75rem',
                    flex: 1
                  }}>
                    <img 
                      src={trip.hostImage} 
                      alt={trip.hostName}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #e5e7eb'
                      }}
                    />
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ 
                          fontSize: '1rem', 
                          fontWeight: '700', 
                          color: '#1e293b' 
                        }}>
                          {trip.hostName}
                        </span>
                        {trip.verified && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1D4ED8" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        )}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginTop: '0.25rem'
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24"/>
                        </svg>
                        <span style={{ 
                          fontSize: '0.875rem', 
                          color: '#64748b',
                          fontWeight: '600'
                        }}>
                          {trip.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Join Now / Joined + Chat Now - Right Side */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (joinedTrips.has(trip.id)) {
                          router.push(`/community/${trip.id}`);
                          return;
                        }
                        
                        if (pendingTrips.has(trip.id)) {
                          return;
                        }
                        
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`${API_BASE_URL}/api/user/community-trip/${trip.id}/join`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            }
                          });
                          
                          const result = await response.json();
                          
                          if (result.status) {
                            setToast({ show: true, message: 'Your request will be sent' });
                            setTimeout(() => setToast({ show: false, message: '' }), 3000);
                            setPendingTrips(new Set([...pendingTrips, trip.id]));
                          } else {
                            const msg = result.message || 'Failed to send join request';
                            if (msg.toLowerCase().includes('already a member') || msg.toLowerCase().includes('already requested')) {
                              setPendingTrips(prev => new Set([...prev, trip.id]));
                              fetchTrips();
                            }
                            setToast({ show: true, message: msg });
                            setTimeout(() => setToast({ show: false, message: '' }), 4000);
                          }
                        } catch (error) {
                          console.error('Error joining trip:', error);
                          setToast({ show: true, message: 'Failed to send join request. Please try again.' });
                          setTimeout(() => setToast({ show: false, message: '' }), 4000);
                        }
                      }}
                      style={{
                        backgroundColor: joinedTrips.has(trip.id) ? '#10b981' : pendingTrips.has(trip.id) ? '#f59e0b' : '#1D4ED8',
                        color: 'white',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '50px',
                        border: 'none',
                        fontSize: '0.9375rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        if (joinedTrips.has(trip.id)) {
                          e.currentTarget.style.backgroundColor = '#059669';
                        } else if (pendingTrips.has(trip.id)) {
                          e.currentTarget.style.backgroundColor = '#d97706';
                        } else {
                          e.currentTarget.style.backgroundColor = '#1e40af';
                        }
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        if (joinedTrips.has(trip.id)) {
                          e.currentTarget.style.backgroundColor = '#10b981';
                        } else if (pendingTrips.has(trip.id)) {
                          e.currentTarget.style.backgroundColor = '#f59e0b';
                        } else {
                          e.currentTarget.style.backgroundColor = '#1D4ED8';
                        }
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {joinedTrips.has(trip.id) ? 'Joined' : pendingTrips.has(trip.id) ? 'Pending' : 'Join Now'}
                    </button>
                    {joinedTrips.has(trip.id) && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/community/${trip.id}`);
                        }}
                        style={{
                          backgroundColor: '#1D4ED8',
                          color: 'white',
                          padding: '0.75rem 1.25rem',
                          borderRadius: '50px',
                          border: 'none',
                          fontSize: '0.9375rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1e40af';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#1D4ED8';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Chat Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
          )}
        </div>
      </section>

      {/* Find My Community Modal */}
      {showFindCommunity && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}
        onClick={() => setShowFindCommunity(false)}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFindCommunity(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '1rem'
            }}>
              Find My Community
            </h2>
            
            <p style={{
              fontSize: '1.125rem',
              color: '#64748b',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              Discover communities that match your travel interests and preferences.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  Destination
                </label>
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1D4ED8';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <option value="all">All Destinations</option>
                  <option value="goa">Goa</option>
                  <option value="manali">Manali</option>
                  <option value="leh">Leh Ladakh</option>
                  <option value="shimla">Shimla</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  Travel Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1D4ED8';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <option value="any">Any Date</option>
                  <option value="november">November 2025</option>
                  <option value="december">December 2025</option>
                  <option value="january">January 2026</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  Group Type
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1D4ED8';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <option value="all">All Groups</option>
                  <option value="mixed">Mixed Group</option>
                  <option value="female">Female Only</option>
                  <option value="nature">Nature Lovers</option>
                </select>
              </div>

              <button
                onClick={() => {
                  // Scroll to filter section
                  document.getElementById('upcoming-trips')?.scrollIntoView({ behavior: 'smooth' });
                  setShowFindCommunity(false);
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#1D4ED8',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginTop: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e40af';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Search Communities
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Your Own Trip Group Modal */}
      {showCreateTrip && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}
        onClick={() => {
          setShowCreateTrip(false);
          setTripImage(null);
          setTripImagePreview(null);
        }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowCreateTrip(false);
                setTripImage(null);
                setTripImagePreview(null);
              }}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '1rem'
            }}>
              Create Your Own Trip Group
            </h2>
            
            <p style={{
              fontSize: '1.125rem',
              color: '#64748b',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              Start your own travel community and invite fellow travelers to join your adventure.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  Trip Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Goa Beach Adventure"
                  value={createTripData.title}
                  onChange={(e) => setCreateTripData({ ...createTripData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1D4ED8';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  Trip Image
                </label>
                {tripImagePreview ? (
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <img
                      src={tripImagePreview}
                      alt="Trip preview"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb'
                      }}
                    />
                    <button
                      onClick={() => {
                        setTripImage(null);
                        setTripImagePreview(null);
                      }}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '3rem 2rem',
                      border: '2px dashed #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: '#f8fafc'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#1D4ED8';
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setTripImage(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setTripImagePreview(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1rem' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1D4ED8',
                      marginBottom: '0.5rem'
                    }}>
                      Click to upload image
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      color: '#64748b'
                    }}>
                      PNG, JPG up to 10MB
                    </span>
                  </label>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  Destination
                </label>
                <input
                  type="text"
                  placeholder="e.g., Goa, India"
                  value={createTripData.destination}
                  onChange={(e) => setCreateTripData({ ...createTripData, destination: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1D4ED8';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '0.5rem'
                  }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={createTripData.startDate}
                    onChange={(e) => setCreateTripData({ ...createTripData, startDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1.25rem',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1D4ED8';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '0.5rem'
                  }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={createTripData.endDate}
                    onChange={(e) => setCreateTripData({ ...createTripData, endDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1.25rem',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1D4ED8';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '0.5rem'
                  }}>
                    Group Type
                  </label>
                  <select
                    value={createTripData.groupType}
                    onChange={(e) => setCreateTripData({ ...createTripData, groupType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1.25rem',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1D4ED8';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <option value="Mixed Group">Mixed Group</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Heritage">Heritage</option>
                    <option value="Solo">Solo</option>
                    <option value="Nature">Nature</option>
                    <option value="Party">Party</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '0.5rem'
                  }}>
                    Trip Type
                  </label>
                  <select
                    value={createTripData.tripType}
                    onChange={(e) => setCreateTripData({ ...createTripData, tripType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1.25rem',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1D4ED8';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <option value="adventure">Adventure</option>
                    <option value="beach">Beach</option>
                    <option value="cultural">Cultural</option>
                    <option value="nature">Nature</option>
                    <option value="festival">Festival</option>
                    <option value="relaxation">Relaxation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  Max Members
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 20"
                  value={createTripData.maxMembers}
                  onChange={(e) => setCreateTripData({ ...createTripData, maxMembers: parseInt(e.target.value) || 20 })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1D4ED8';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  Description
                </label>
                <textarea
                  placeholder="Tell us about your trip..."
                  rows={4}
                  value={createTripData.description}
                  onChange={(e) => setCreateTripData({ ...createTripData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1D4ED8';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                />
              </div>

              <button
                onClick={async () => {
                  if (!createTripData.title || !createTripData.destination || !createTripData.startDate || !createTripData.endDate) {
                    alert('Please fill in all required fields');
                    return;
                  }

                  try {
                    const token = localStorage.getItem('token');
                    const formDataToSend = new FormData();
                    formDataToSend.append('title', createTripData.title);
                    formDataToSend.append('description', createTripData.description || '');
                    formDataToSend.append('location', createTripData.destination);
                    formDataToSend.append('startDate', new Date(createTripData.startDate).toISOString());
                    formDataToSend.append('endDate', new Date(createTripData.endDate).toISOString());
                    formDataToSend.append('groupType', createTripData.groupType || 'Mixed Group');
                    formDataToSend.append('tripType', createTripData.tripType || 'other');
                    formDataToSend.append('maxMembers', (createTripData.maxMembers || 20).toString());
                    
                    if (tripImage) {
                      formDataToSend.append('images', tripImage);
                    }

                    const response = await fetch(`${API_BASE_URL}/api/user/community-trip/create`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      },
                      body: formDataToSend
                    });

                    const result = await response.json();

                    if (result.status) {
                      alert('Trip request submitted successfully! Waiting for admin approval. You will receive an email notification once approved.');
                      setShowCreateTrip(false);
                      setTripImage(null);
                      setTripImagePreview(null);
                      setCreateTripData({
                        title: '',
                        destination: '',
                        startDate: '',
                        endDate: '',
                        description: '',
                        groupType: 'Mixed Group',
                        tripType: 'other',
                        maxMembers: 20
                      });
                      fetchTrips(); // Refresh trips list
                    } else {
                      alert(result.message || 'Failed to create trip');
                    }
                  } catch (error) {
                    console.error('Error creating trip:', error);
                    alert('Failed to create trip. Please try again.');
                  }
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#1D4ED8',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginTop: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e40af';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Create Trip Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

