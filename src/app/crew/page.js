'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Grid, Skeleton } from "@mui/material";
import { API_BASE_URL } from '@/lib/config';
import StarIcon from '@mui/icons-material/Star';

export default function CrewPage() {
  const router = useRouter();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState('all');
  const [selectedDestination, setSelectedDestination] = useState('all');

  useEffect(() => {
    fetchAvailableSlots();
  }, [selectedPackage, selectedDestination]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      
      // Fetch all packages
      const packagesResponse = await fetch(`${API_BASE_URL}/api/user/getPackages?page=1&limit=50`);
      const packagesData = await packagesResponse.json();
      
      if (packagesData.status && packagesData.data) {
        const allSlots = [];
        const today = new Date();
        
        // Fetch slots for each package - check next 7 days (one week)
        const promises = packagesData.data.map(async (pkg) => {
          const destinationId = pkg.destinationId || pkg.destinations?.[0]?.destinationId || pkg.destinations?.[0]?._id;
          
          if (!destinationId || !pkg._id) return;
          
          // Check slots for next 7 days
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            const dateStr = checkDate.toISOString().split('T')[0];
            
            try {
              const slotsResponse = await fetch(
                `${API_BASE_URL}/api/user/slot/available?packageId=${pkg._id}&destinationId=${destinationId}&tripDate=${dateStr}`
              );
              
              if (slotsResponse.ok) {
                const slotsData = await slotsResponse.json();
                
                if (slotsData.status && slotsData.data && Array.isArray(slotsData.data)) {
                  slotsData.data.forEach(slot => {
                    const isAvailable = slot.status === 'available' && 
                                      (slot.availableSlots > 0 || (slot.maxSlots - slot.currentBookings > 0));
                    
                    if (isAvailable) {
                      const exists = allSlots.find(s => s._id === slot._id);
                      if (!exists) {
                        allSlots.push({
                          ...slot,
                          packageInfo: {
                            _id: pkg._id,
                            title: pkg.title,
                            destination: pkg.destination,
                            image: pkg.images?.[0] || pkg.image,
                            price: pkg.price,
                            duration: pkg.duration,
                            category: pkg.category
                          },
                          // Get admin/creator info from slot
                          adminInfo: {
                            name: slot.createdBy?.name || 'Admin',
                            image: slot.createdBy?.profilePicture || slot.createdBy?.picture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
                            rating: slot.createdBy?.rating || 0
                          }
                        });
                      }
                    }
                  });
                }
              }
            } catch (err) {
              // Continue silently
            }
          }
        });
        
        await Promise.all(promises);
        
        // Apply filters
        let filteredSlots = allSlots;
        if (selectedPackage !== 'all') {
          filteredSlots = filteredSlots.filter(slot => slot.packageInfo?._id === selectedPackage);
        }
        if (selectedDestination !== 'all') {
          filteredSlots = filteredSlots.filter(slot => 
            slot.packageInfo?.destination?.toLowerCase() === selectedDestination.toLowerCase()
          );
        }
        
        // Sort by trip date
        filteredSlots.sort((a, b) => {
          const dateA = new Date(a.tripDate);
          const dateB = new Date(b.tripDate);
          return dateA - dateB;
        });
        
        setAvailableSlots(filteredSlots);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDateTag = (dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    const startDay = date.getDate();
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 3); // Assuming 3-4 day trip
    const endDay = endDate.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${startDay} - ${endDay} ${month} ${year}`;
  };

  const handleSlotClick = (slot) => {
    if (slot.packageInfo?._id) {
      router.push(`/packages/${slot.packageInfo._id}/slot/${slot._id}`);
    }
  };

  const getTripType = (category) => {
    const typeMap = {
      'Adventure': 'Adventure',
      'Beach': 'Beach Vibes',
      'Cultural': 'Cultural',
      'Nature': 'Nature Lovers',
      'Festival': 'Music Festival',
      'Relaxation': 'Relaxation',
      'Heritage': 'Heritage',
      'default': 'Mixed Group'
    };
    return typeMap[category] || typeMap['default'];
  };

  return (
    <div className="packages-page">
      {/* Header Section */}
      <div className="profile-page-header">
        <div className="profile-page-header-container">
          <h1 className="profile-page-title">Available Crew Slots</h1>
          <p className="profile-page-subtitle">Join existing travel groups and make new friends</p>
        </div>
      </div>

      <section className="packages-details-section">
        <div className="packages-details-container">
          {/* Filters */}
          <div style={{ 
            marginBottom: '2rem', 
            display: 'flex', 
            gap: '1rem', 
            flexWrap: 'wrap',
          }}>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '0.9375rem',
                minWidth: '200px'
              }}
            >
              <option value="all">All Packages</option>
            </select>
            
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '0.9375rem',
                minWidth: '200px'
              }}
            >
              <option value="all">All Destinations</option>
            </select>
          </div>

          {/* Slots Grid */}
          {loading ? (
            <Grid container spacing={3} style={{ padding: '0 6rem' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid size={{xs: 12, sm: 6, md: 4}} key={i}>
                  <Skeleton variant="rectangular" height={450} animation="wave" sx={{ borderRadius: '24px' }} />
                </Grid>
              ))}
            </Grid>
          ) : availableSlots.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem',
              backgroundColor: 'white',
              borderRadius: '16px',
              margin: '0 6rem'
            }}>
              <div style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: '500' }}>
                No available slots at the moment
              </div>
              <button
                onClick={() => router.push('/packages')}
                style={{
                  marginTop: '1.5rem',
                  padding: '0.875rem 2rem',
                  backgroundColor: '#1D4ED8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1e40af';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1D4ED8';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Browse Packages
              </button>
            </div>
          ) : (
            <Grid container spacing={3} style={{ padding: '0 6rem', paddingBottom: '80px' }}>
              {availableSlots.map((slot) => (
                <Grid size={{xs: 12, sm: 6, md: 4}} key={slot._id}>
                  <div
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                    onClick={() => handleSlotClick(slot)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    }}
                  >
                    {/* Image Header Section with Gradient Overlay */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '280px',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={slot.packageInfo?.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'}
                        alt={slot.packageInfo?.title || 'Trip'}
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
                        height: '60%',
                        background: 'linear-gradient(to top, rgba(29, 78, 216, 0.85) 0%, rgba(29, 78, 216, 0.5) 50%, transparent 100%)'
                      }} />

                      {/* Date Tag - Top Left */}
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        backgroundColor: 'rgba(29, 78, 216, 0.95)',
                        color: 'white',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        zIndex: 2
                      }}>
                        {formatDateTag(slot.tripDate)}
                      </div>

                      {/* Title and Attributes - Centered in Gradient */}
                      <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '20px',
                        right: '20px',
                        zIndex: 2
                      }}>
                        <h3 style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: 'white',
                          marginBottom: '12px',
                          textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                          {slot.packageInfo?.title || slot.slotName || 'Trip Group'}
                        </h3>
                        
                        {/* Attributes with dividers */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            fontSize: '0.875rem',
                            color: 'white',
                            fontWeight: '500'
                          }}>
                            {getTripType(slot.packageInfo?.category)}
                          </span>
                          <span style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '0.875rem'
                          }}>|</span>
                          <span style={{
                            fontSize: '0.875rem',
                            color: 'white',
                            fontWeight: '500'
                          }}>
                            {slot.currentBookings || 0} Members
                          </span>
                          <span style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '0.875rem'
                          }}>|</span>
                          <span style={{
                            fontSize: '0.875rem',
                            color: 'white',
                            fontWeight: '500'
                          }}>
                            Mixed Group
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section - Admin Info and Join Button */}
                    <div style={{
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flex: 1
                    }}>
                      {/* Admin Info - Left */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flex: 1
                      }}>
                        <img
                          src={slot.adminInfo?.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'}
                          alt={slot.adminInfo?.name || 'Admin'}
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
                            fontSize: '0.9375rem',
                            fontWeight: '700',
                            color: '#1e293b',
                            marginBottom: '4px'
                          }}>
                            {slot.adminInfo?.name || 'Admin'}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8125rem',
                            color: '#64748b'
                          }}>
                            <StarIcon sx={{ fontSize: '14px', color: '#fbbf24' }} />
                            <span>{slot.adminInfo?.rating || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Join Now Button - Right */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSlotClick(slot);
                        }}
                        style={{
                          padding: '10px 24px',
                          backgroundColor: '#1D4ED8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '24px',
                          fontSize: '0.9375rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#1e40af';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#1D4ED8';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        Join Now
                      </button>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          )}
        </div>
      </section>
    </div>
  );
}
