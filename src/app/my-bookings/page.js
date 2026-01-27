'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@mui/material";
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

  const normalizeBookingForUI = (raw) => {
    const id = raw?.id || raw?._id || raw?.bookingId || raw?.bookingReference;

    const captainName =
      raw?.captain?.name ||
      raw?.captainName ||
      raw?.captain_details?.name ||
      raw?.captainDetails?.name;

    const packageName =
      raw?.packageName ||
      raw?.package?.name ||
      raw?.package?.title ||
      (captainName ? `Captain - ${captainName}` : (raw?.isCaptainBooking ? 'Captain' : 'Booking'));

    const isCaptainBooking = raw?.isCaptainBooking || (!raw?.packageId && raw?.captainId);
    const destination =
      raw?.destination ||
      raw?.location ||
      raw?.tripLocation ||
      raw?.guestDetails?.[0]?.guestAddress ||
      raw?.guestDetails?.[0]?.address ||
      raw?.contactAddress ||
      raw?.captain?.location ||
      raw?.captain_details?.location ||
      raw?.captainDetails?.location ||
      (isCaptainBooking ? 'Custom' : 'Unknown');

    const tripDate = raw?.tripDate || raw?.startDate || raw?.date || raw?.createdAt;
    const bookingDate = raw?.bookingDate || raw?.createdAt || tripDate;

    const duration =
      raw?.duration ||
      raw?.tripDuration ||
      (isCaptainBooking 
        ? 'Custom'
        : (raw?.startDate && raw?.endDate
          ? `${Math.ceil((new Date(raw.endDate) - new Date(raw.startDate)) / (1000 * 60 * 60 * 24)) + 1}D`
          : 'Custom'));

    const totalAmount = raw?.totalAmount ?? raw?.amount ?? raw?.price ?? raw?.totalPrice ?? 0;

    const bookingId = raw?.bookingId || raw?.bookingReference || raw?.reference || raw?.orderId || id;

    const status =
      raw?.status === 'confirmed' || raw?.status === 'completed'
        ? raw.status
        : raw?.status
          ? String(raw.status).toLowerCase()
          : 'confirmed';

    const image =
      raw?.image ||
      raw?.package?.image ||
      raw?.package?.coverImage ||
      raw?.captain?.backgroundImage ||
      raw?.captain?.image ||
      raw?.captain_details?.backgroundImage ||
      raw?.captainDetails?.backgroundImage ||
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop';

    return {
      ...raw,
      id,
      packageName,
      destination,
      tripDate,
      bookingDate,
      duration,
      totalAmount,
      bookingId,
      status,
      image,
      isCaptainBooking,
      captainId: raw?.captainId || null
    };
  };

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
        const normalized = Array.isArray(result.data)
          ? result.data.map(normalizeBookingForUI)
          : [];
        setBookings(normalized);
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

  // Booking Card Skeleton Component
  const BookingCardSkeleton = () => (
    <div className="packages-order-card" style={{ pointerEvents: 'none' }}>
      <div className="packages-order-card-image">
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height="100%" 
          sx={{ bgcolor: '#e2e8f0' }} 
          animation="wave" 
        />
      </div>
      <div className="packages-order-card-content">
        <div style={{ position: 'absolute', top: 0, right: 0 }}>
          <Skeleton 
            variant="rectangular" 
            width={100} 
            height={32} 
            sx={{ borderRadius: '0.5rem', bgcolor: '#e2e8f0' }} 
            animation="wave" 
          />
        </div>
        <Skeleton 
          variant="text" 
          width="70%" 
          height={36} 
          sx={{ mb: 1, bgcolor: '#e2e8f0' }} 
          animation="wave" 
        />
        <div className="packages-order-card-meta">
          <Skeleton 
            variant="text" 
            width={120} 
            height={24} 
            sx={{ bgcolor: '#e2e8f0' }} 
            animation="wave" 
          />
          <Skeleton 
            variant="text" 
            width={140} 
            height={24} 
            sx={{ bgcolor: '#e2e8f0' }} 
            animation="wave" 
          />
          <Skeleton 
            variant="text" 
            width={100} 
            height={24} 
            sx={{ bgcolor: '#e2e8f0' }} 
            animation="wave" 
          />
        </div>
        <div className="packages-order-card-footer">
          <div className="packages-order-card-info">
            <Skeleton 
              variant="text" 
              width={150} 
              height={20} 
              sx={{ bgcolor: '#e2e8f0' }} 
              animation="wave" 
            />
          </div>
          <div className="packages-order-card-amount">
            <Skeleton 
              variant="text" 
              width={100} 
              height={24} 
              sx={{ bgcolor: '#e2e8f0' }} 
              animation="wave" 
            />
          </div>
        </div>
      </div>
    </div>
  );

  const allTrips = bookings;
  
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
          <h1 className="profile-page-title">My Bookings</h1>
          <p className="profile-page-subtitle">Track and manage your bookings</p>
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
            <div className="packages-orders-list">
              {Array.from({ length: 6 }).map((_, index) => (
                <BookingCardSkeleton key={index} />
              ))}
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
                        {new Date(trip.bookingDate || trip.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="packages-order-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" fill="currentColor"/>
                        </svg>
                        {trip.isCaptainBooking && trip.duration === 'Custom' ? 'Custom' : trip.duration}
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

