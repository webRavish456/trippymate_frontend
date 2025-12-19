'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Grid } from "@mui/material";
import { API_BASE_URL } from '@/lib/config';

export default function MyBookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const status = activeTab === 'upcoming' ? 'upcoming' : 'completed';
      const response = await fetch(`${API_BASE_URL}/api/user/bookings?status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.status && result.data) {
        setBookings(result.data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Static data for upcoming trips (fallback)
  const upcomingTrips = [
    {
      id: '1',
      packageName: 'Manali Adventure Escape',
      destination: 'Manali',
      tripDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '3N/4D',
      guests: 2,
      totalAmount: 17998,
      bookingId: 'BK001234',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      packageName: 'Goa Beach Paradise',
      destination: 'Goa',
      tripDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '4N/5D',
      guests: 3,
      totalAmount: 26997,
      bookingId: 'BK001235',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
    },
    {
      id: '4',
      packageName: 'Rajasthan Royal Heritage',
      destination: 'Rajasthan',
      tripDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '6N/7D',
      guests: 2,
      totalAmount: 29998,
      bookingId: 'BK001236',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      packageName: 'Kashmir Valley Tour',
      destination: 'Kashmir',
      tripDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '5N/6D',
      guests: 4,
      totalAmount: 34997,
      bookingId: 'BK001237',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop'
    },
    {
      id: '6',
      packageName: 'Darjeeling Hill Station',
      destination: 'Darjeeling',
      tripDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '4N/5D',
      guests: 2,
      totalAmount: 21998,
      bookingId: 'BK001238',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    },
    {
      id: '7',
      packageName: 'Ooty Nature Retreat',
      destination: 'Ooty',
      tripDate: new Date(Date.now() + 105 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '3N/4D',
      guests: 2,
      totalAmount: 18998,
      bookingId: 'BK001239',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop'
    },
    {
      id: '8',
      packageName: 'Andaman Island Paradise',
      destination: 'Andaman',
      tripDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '6N/7D',
      guests: 2,
      totalAmount: 39998,
      bookingId: 'BK001240',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop'
    },
    {
      id: '9',
      packageName: 'Shimla Snow Adventure',
      destination: 'Shimla',
      tripDate: new Date(Date.now() + 135 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '4N/5D',
      guests: 3,
      totalAmount: 24997,
      bookingId: 'BK001241',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop'
    },
    {
      id: '10',
      packageName: 'Munnar Tea Gardens',
      destination: 'Munnar',
      tripDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '3N/4D',
      guests: 2,
      totalAmount: 19998,
      bookingId: 'BK001242',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    },
    {
      id: '11',
      packageName: 'Rishikesh Adventure',
      destination: 'Rishikesh',
      tripDate: new Date(Date.now() + 165 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '4N/5D',
      guests: 2,
      totalAmount: 22998,
      bookingId: 'BK001243',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop'
    },
    {
      id: '12',
      packageName: 'Varanasi Spiritual Journey',
      destination: 'Varanasi',
      tripDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '3N/4D',
      guests: 2,
      totalAmount: 17998,
      bookingId: 'BK001244',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop'
    }
  ];

  // Static data for completed trips
  const completedTrips = [
    {
      id: '3',
      packageName: 'Kerala Backwaters',
      destination: 'Kerala',
      tripDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '5N/6D',
      guests: 2,
      totalAmount: 24998,
      bookingId: 'BK001200',
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1580619305218-8423a3d6d3f3?w=400&h=300&fit=crop',
      hasFeedback: false
    },
    {
      id: '13',
      packageName: 'Mysore Palace Tour',
      destination: 'Mysore',
      tripDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '2N/3D',
      guests: 2,
      totalAmount: 14998,
      bookingId: 'BK001199',
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop',
      hasFeedback: true
    },
    {
      id: '14',
      packageName: 'Pondicherry French Colony',
      destination: 'Pondicherry',
      tripDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      duration: '3N/4D',
      guests: 2,
      totalAmount: 19998,
      bookingId: 'BK001198',
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      hasFeedback: true
    }
  ];

  const allTrips = bookings.length > 0 ? bookings : (activeTab === 'upcoming' ? upcomingTrips : completedTrips);
  
  // Pagination logic
  const totalPages = Math.ceil(allTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrips = allTrips.slice(startIndex, endIndex);

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
    // Scroll to top when tab changes
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  // Function to handle page change with scroll
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="packages-page">
      {/* Bookings Header Section */}
      <div className="profile-page-header">
        <div className="profile-page-header-container">
          <h1 className="profile-page-title">My Orders</h1>
          <p className="profile-page-subtitle">Track and manage your orders</p>
        </div>
      </div>

      <section className="packages-details-section">
        <div className="packages-details-container">
          {/* Tabs */}
          <div className="packages-orders-tabs">
            <button
              className={`packages-order-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming Trips
            </button>
            <button
              className={`packages-order-tab ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed Trips
            </button>
          </div>

          {/* Trips List */}
          {loading ? (
            <div className="packages-orders-empty">
              <div className="packages-loading-spinner"></div>
              <p>Loading bookings...</p>
            </div>
          ) : allTrips.length > 0 ? (
            <>
              <div className="packages-orders-list">
                {currentTrips.map((trip) => (
                <div key={trip.id} className="packages-order-card" onClick={() => router.push(`/my-bookings/${trip.id}`)}>
                  <div className="packages-order-card-image">
                    <img src={trip.image} alt={trip.packageName} />
                  </div>
                  <div className="packages-order-card-content">
                    <div className={`packages-order-status packages-order-status-${trip.status}`}>
                      {trip.status === 'confirmed' ? 'Confirmed' : 'Completed'}
                    </div>
                    <h3 className="packages-order-card-title">{trip.packageName}</h3>
                    <div className="packages-order-card-meta">
                      <span className="packages-order-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                        </svg>
                        {trip.destination}
                      </span>
                      <span className="packages-order-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="currentColor"/>
                        </svg>
                        {new Date(trip.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="packages-order-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" fill="currentColor"/>
                        </svg>
                        {trip.duration}
                      </span>
                    </div>
                    <div className="packages-order-card-footer">
                      <div className="packages-order-card-info">
                        <span className="packages-order-info-label">Booking ID:</span>
                        <span className="packages-order-info-value">{trip.bookingId}</span>
                      </div>
                      <div className="packages-order-card-amount">
                        <span className="packages-order-amount-label">Total:</span>
                        <span className="packages-order-amount-value">₹{trip.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="packages-pagination">
                  <button
                    className="packages-pagination-btn"
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Previous
                  </button>
                  
                  <div className="packages-pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            className={`packages-pagination-page ${currentPage === page ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="packages-pagination-dots">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    className="packages-pagination-btn"
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="packages-orders-empty">
              <div className="packages-orders-empty-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" fill="#9ca3af"/>
                </svg>
              </div>
              <h3 className="packages-orders-empty-title">No orders found</h3>
              <p className="packages-orders-empty-text">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming trips." 
                  : "You don't have any completed trips."}
              </p>
              <button 
                className="packages-orders-empty-btn"
                onClick={() => router.push('/packages')}
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

