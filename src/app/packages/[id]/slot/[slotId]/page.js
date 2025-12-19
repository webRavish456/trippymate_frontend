'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Grid } from "@mui/material";

import { API_BASE_URL } from '@/lib/config';

export default function SlotDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id;
  const slotId = params.slotId;

  const [slotDetails, setSlotDetails] = useState(null);
  const [packageDetails, setPackageDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dummy package details
  const dummyPackageDetails = {
    _id: packageId,
    title: 'Manali Adventure Escape',
    duration: '3N/4D',
    source: 'Delhi',
    destination: 'Manali',
    category: 'Adventure',
    overview: 'Experience the breathtaking beauty of Manali with this amazing adventure package. Trek through scenic trails, enjoy camping under the stars, and explore the best of Himalayan culture.',
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
    }
  };

  // Dummy slot details data with groups
  const dummySlotDetails = {
    _id: slotId,
    slotName: slotId === '1' ? 'Early Bird' : slotId === '2' ? 'Weekend Special' : 'Holiday Package',
    tripDate: new Date(Date.now() + (slotId === '1' ? 30 : slotId === '2' ? 45 : 60) * 24 * 60 * 60 * 1000).toISOString(),
    maxSlots: slotId === '1' ? 10 : slotId === '2' ? 12 : 15,
    currentBookings: slotId === '1' ? 3 : slotId === '2' ? 7 : 15,
    availableSlots: slotId === '1' ? 7 : slotId === '2' ? 5 : 0,
    status: slotId === '3' ? 'full' : 'available',
    destinationName: 'Manali',
    createdBy: {
      name: slotId === '1' ? 'Rahul Sharma' : slotId === '2' ? 'Priya Patel' : 'Amit Kumar',
      avatar: slotId === '1' ? 'https://i.pravatar.cc/150?img=12' : slotId === '2' ? 'https://i.pravatar.cc/150?img=47' : 'https://i.pravatar.cc/150?img=33'
    },
    captain: {
      name: 'Rajesh Kumar',
      avatar: 'https://i.pravatar.cc/150?img=1',
      rating: 4.8,
      experience: '5+ Years',
      languages: ['Hindi', 'English', 'Pahari'],
      expertise: ['Trekking', 'Adventure Sports', 'Local Culture', 'Specialist'],
      verified: true
    },
    startDateTime: new Date(Date.now() + (slotId === '1' ? 30 : slotId === '2' ? 45 : 60) * 24 * 60 * 60 * 1000).toISOString(),
    endDateTime: new Date(Date.now() + (slotId === '1' ? 34 : slotId === '2' ? 49 : 64) * 24 * 60 * 60 * 1000).toISOString(),
    duration: slotId === '1' ? '3N/4D' : slotId === '2' ? '4N/5D' : '5N/6D',
    pickupLocation: 'Delhi Airport',
    dropLocation: 'Delhi Airport',
    groups: slotId === '1' ? [
      {
        groupId: '1',
        groupLeader: 'Rahul Sharma',
        groupLeaderAvatar: 'https://i.pravatar.cc/150?img=12',
        members: [
          { name: 'Rahul Sharma', age: 28 },
          { name: 'Neha Sharma', age: 26 }
        ],
        totalMembers: 2,
        joinedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        groupId: '2',
        groupLeader: 'Priya Patel',
        groupLeaderAvatar: 'https://i.pravatar.cc/150?img=47',
        members: [
          { name: 'Priya Patel', age: 25 }
        ],
        totalMembers: 1,
        joinedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        groupId: '3',
        groupLeader: 'You',
        groupLeaderAvatar: 'https://i.pravatar.cc/150?img=68',
        members: [
          { name: 'You', age: 24 },
          { name: 'Rohan Mehta', age: 27 }
        ],
        totalMembers: 2,
        joinedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isCurrentUser: true
      }
    ] : slotId === '2' ? [
      {
        groupId: '1',
        groupLeader: 'Rahul Sharma',
        groupLeaderAvatar: 'https://i.pravatar.cc/150?img=12',
        members: [
          { name: 'Rahul Sharma', age: 28 }
        ],
        totalMembers: 1,
        joinedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        groupId: '2',
        groupLeader: 'Priya Patel',
        groupLeaderAvatar: 'https://i.pravatar.cc/150?img=47',
        members: [
          { name: 'Priya Patel', age: 25 },
          { name: 'Arjun Patel', age: 30 },
          { name: 'Kavya Patel', age: 22 }
        ],
        totalMembers: 3,
        joinedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        groupId: '3',
        groupLeader: 'Amit Kumar',
        groupLeaderAvatar: 'https://i.pravatar.cc/150?img=33',
        members: [
          { name: 'Amit Kumar', age: 29 },
          { name: 'Sneha Kumar', age: 27 }
        ],
        totalMembers: 2,
        joinedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        groupId: '4',
        groupLeader: 'Sneha Singh',
        groupLeaderAvatar: 'https://i.pravatar.cc/150?img=51',
        members: [
          { name: 'Sneha Singh', age: 23 }
        ],
        totalMembers: 1,
        joinedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ] : []
  };

  useEffect(() => {
    fetchSlotDetails();
    fetchPackageDetails();
  }, [slotId, packageId]);

  const fetchSlotDetails = async () => {
    try {
      setLoading(true);
      // In real app, fetch from API
      // const response = await fetch(`${API_BASE_URL}/user/slot/${slotId}`);
      // const data = await response.json();
      
      // For now, use dummy data
      setSlotDetails(dummySlotDetails);
    } catch (error) {
      console.error('Error fetching slot details:', error);
      setSlotDetails(dummySlotDetails);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackageDetails = async () => {
    try {
      // For now, use dummy data
      setPackageDetails(dummyPackageDetails);
      
      // In real app, fetch from API
      // const response = await fetch(`${API_BASE_URL}/user/getPackagebyId`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ id: packageId }),
      // });

      // const data = await response.json();
      // if (data.status && data.data) {
      //   setPackageDetails(data.data);
      // }
    } catch (error) {
      console.error('Error fetching package:', error);
      setPackageDetails(dummyPackageDetails);
    }
  };

  if (loading) {
    return (
      <div className="packages-page-loading">
        <div className="packages-loading-spinner"></div>
        <p>Loading slot details...</p>
      </div>
    );
  }

  if (!slotDetails) {
    return (
      <div className="packages-page-loading">
        <p>Slot not found</p>
        <button onClick={() => router.push(`/packages/${packageId}`)}>Back to Package</button>
      </div>
    );
  }

  const totalGroups = slotDetails.groups?.length || 0;
  const totalPeople = slotDetails.groups?.reduce((sum, group) => sum + group.totalMembers, 0) || 0;

  return (
    <div className="packages-page">
      {/* Header */}
      <section className="packages-hero-section">
        <div className="packages-hero-container">
          <div className="packages-hero-content">
            <h1 className="packages-hero-title">{slotDetails.slotName}</h1>
            <div className="packages-hero-meta">
              <span className="packages-meta-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="currentColor"/>
                </svg>
                Trip Date: {new Date(slotDetails.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="packages-meta-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
                {slotDetails.destinationName}
              </span>
              <span className={`packages-slot-status packages-slot-status-${slotDetails.status}`}>
                {slotDetails.status === 'available' ? 'AVAILABLE' : slotDetails.status === 'full' ? 'FULL' : 'CLOSED'}
              </span>
            </div>
            {packageDetails?.overview && (
              <p className="packages-hero-description">{packageDetails.overview}</p>
            )}
          </div>
        </div>
      </section>

      {/* Slot Details */}
      <section className="packages-details-section">
        <div className="packages-details-container">
          <Grid container spacing={4}>
            {/* Left Column */}
            <Grid size={{ xs: 12, md: 8 }}>


            <div className="packages-booking-card" style={{ marginBottom: '1.5rem' }}>
                  <h2 className="packages-booking-title">Trip Details</h2>
                  {packageDetails?.title && (
                    <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Package Name</span>
                      <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1a1a1a', margin: '0.5rem 0 0 0' }}>{packageDetails.title}</p>
                    </div>
                  )}
                  <div className="packages-trip-details-list">
                    <div className="packages-trip-detail-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="#6b7280"/>
                        <path d="M7 13h5v5H7z" fill="#6b7280"/>
                      </svg>
                      <div>
                        <span className="packages-trip-detail-label">Start date/time</span>
                        <span className="packages-trip-detail-value">
                          {new Date(slotDetails.startDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at {new Date(slotDetails.startDateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="packages-trip-detail-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="#6b7280"/>
                        <path d="M7 13h5v5H7z" fill="#6b7280"/>
                      </svg>
                      <div>
                        <span className="packages-trip-detail-label">End date/time</span>
                        <span className="packages-trip-detail-value">
                          {new Date(slotDetails.endDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at {new Date(slotDetails.endDateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="packages-trip-detail-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="2"/>
                        <polyline points="12 6 12 12 16 14" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <div>
                        <span className="packages-trip-detail-label">Duration</span>
                        <span className="packages-trip-detail-value">{slotDetails.duration}</span>
                      </div>
                    </div>
                    <div className="packages-trip-detail-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="none" stroke="#6b7280" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" fill="none" stroke="#6b7280" strokeWidth="2"/>
                      </svg>
                      <div>
                        <span className="packages-trip-detail-label">Pick up location</span>
                        <span className="packages-trip-detail-value">{slotDetails.pickupLocation}</span>
                      </div>
                    </div>
                    <div className="packages-trip-detail-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="none" stroke="#6b7280" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" fill="none" stroke="#6b7280" strokeWidth="2"/>
                      </svg>
                      <div>
                        <span className="packages-trip-detail-label">Drop location</span>
                        <span className="packages-trip-detail-value">{slotDetails.dropLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              {/* Groups List */}
              <div className="packages-detail-card">
                <h2 className="packages-section-title">{slotDetails.slotName} - Travel Companions ({totalGroups})</h2>
                <div className="packages-groups-list">
                  {slotDetails.groups?.map((group, index) => (
                    <div key={group.groupId || index} className="packages-group-card">
                      <div className="packages-group-header">
                        <div className="packages-group-leader">
                          <img 
                            src={group.groupLeaderAvatar} 
                            alt={group.groupLeader}
                            className="packages-group-leader-avatar"
                          />
                          <div>
                            <h4>
                              Group {index + 1} - {group.groupLeader}
                              {group.isCurrentUser && (
                                <span className="packages-member-badge">You</span>
                              )}
                            </h4>
                            <p className="packages-group-meta">
                              {group.totalMembers} {group.totalMembers === 1 ? 'member' : 'members'} • 
                              Joined: {new Date(group.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="packages-group-members">
                        <h5>Members:</h5>
                        <div className="packages-group-members-list">
                          {group.members.map((member, memberIndex) => (
                            <div key={memberIndex} className="packages-group-member-item">
                              <span className="packages-group-member-name">{member.name}</span>
                              <span className="packages-group-member-age">Age: {member.age}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Grid>

            {/* Right Column */}
            <Grid size={{ xs: 12, md: 4 }}>
              <div className="packages-sticky-sidebar">
           

                {/* Captain Details */}
                {slotDetails.captain && (
                  <div className="packages-booking-card">
                    <h2 className="packages-booking-title">Your Captain</h2>
                    <div className="packages-slot-creator-detail">
                      <img 
                        src={slotDetails.captain.avatar} 
                        alt={slotDetails.captain.name}
                        className="packages-slot-creator-detail-avatar"
                      />
                      <div className="packages-captain-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h3>{slotDetails.captain.name}</h3>
                          {slotDetails.captain.verified && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#1D4ED8"/>
                              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="7" r="1" fill="white"/>
                            </svg>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24"/>
                          </svg>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{slotDetails.captain.rating}</span>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>• {slotDetails.captain.experience}</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                          Languages: {slotDetails.captain.languages.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="packages-captain-expertise">
                      {slotDetails.captain.expertise.map((exp, idx) => (
                        <span key={idx} className="packages-captain-expertise-tag">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trip Details */}
             

                {/* Slot Information */}
                <div className="packages-booking-card" style={{ marginTop: '1.5rem' }}>
                  <h2 className="packages-booking-title">Slot Information</h2>
                  <div className="packages-slot-info-grid" style={{ marginBottom: '1.5rem' }}>
                    <div className="packages-slot-info-item">
                      <span className="packages-slot-info-label">Total Capacity</span>
                      <span className="packages-slot-info-value">{slotDetails.maxSlots} slots</span>
                    </div>
                    <div className="packages-slot-info-item">
                      <span className="packages-slot-info-label">Available Slots</span>
                      <span className="packages-slot-info-value">{slotDetails.availableSlots}</span>
                    </div>
                    <div className="packages-slot-info-item">
                      <span className="packages-slot-info-label">Total Groups</span>
                      <span className="packages-slot-info-value">{totalGroups}</span>
                    </div>
                    <div className="packages-slot-info-item">
                      <span className="packages-slot-info-label">Total People</span>
                      <span className="packages-slot-info-value">{totalPeople}</span>
                    </div>
                  </div>
                  <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#6b7280', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Slot Creator</h3>
                    <div className="packages-slot-creator-detail">
                      <img 
                        src={slotDetails.createdBy.avatar} 
                        alt={slotDetails.createdBy.name}
                        className="packages-slot-creator-detail-avatar"
                      />
                      <div>
                        <h3>{slotDetails.createdBy.name}</h3>
                        <p>Slot Creator</p>
                      </div>
                    </div>
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

