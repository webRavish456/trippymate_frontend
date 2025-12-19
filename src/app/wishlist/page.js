'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from '@/lib/config';

export default function MyWishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.status && result.data) {
        setWishlistItems(result.data);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleRemoveFromWishlist = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to remove from wishlist', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/wishlist/remove/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.status) {
        const updatedWishlist = wishlistItems.filter(item => item.id !== id);
        setWishlistItems(updatedWishlist);
        showToast('Removed from wishlist', 'success');
      } else {
        showToast(result.message || 'Failed to remove from wishlist', 'error');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast('Failed to remove from wishlist', 'error');
    }
  };

  const handleBookNow = (item) => {
    router.push(`/packages/${item.id}/book`);
  };

  const filteredItems = filter === 'all' 
    ? wishlistItems 
    : wishlistItems.filter(item => item.category.toLowerCase() === filter.toLowerCase());

  const categories = ['all', ...new Set(wishlistItems.map(item => item.category))];

  return (
    <div className="packages-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`packages-toast packages-toast-${toast.type}`}>
          <div className="packages-toast-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {toast.type === 'success' ? (
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
              ) : (
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
              )}
            </svg>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Wishlist Header Section */}
      <div className="profile-page-header">
        <div className="profile-page-header-container">
          <h1 className="profile-page-title">My Wishlist</h1>
          <p className="profile-page-subtitle">
            {wishlistItems.length > 0 
              ? `You have ${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist`
              : 'Save your favorite trips for later'}
          </p>
        </div>
      </div>

      <section className="packages-details-section">
        <div className="packages-details-container">
          {wishlistItems.length > 0 ? (
            <>
              {/* Filter Tabs */}
              <div className="wishlist-filters">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`wishlist-filter-btn ${filter === category ? 'active' : ''}`}
                    onClick={() => setFilter(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              {/* Wishlist Grid */}
              <div className="wishlist-grid">
                {filteredItems.map(item => (
                  <div key={item.id} className="wishlist-card">
                    <div className="wishlist-card-image">
                      <img src={item.image} alt={item.packageName} />
                      <div className="wishlist-image-overlay"></div>
                      <div className="wishlist-image-content">
                        <h3 className="wishlist-card-title-overlay">{item.packageName}</h3>
                        <div className="wishlist-overlay-details">
                          <div className="wishlist-overlay-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="3" y="4" width="18" height="18" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                              <path d="M16 2v4M8 2v4M3 10h18" stroke="white" strokeWidth="2"/>
                            </svg>
                            <span>{item.duration}</span>
                          </div>
                          <div className="wishlist-overlay-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" fill="none"/>
                              <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" fill="none"/>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2" fill="none"/>
                            </svg>
                            <span>{item.tripType || 'Group Trip'}</span>
                          </div>
                          <div className="wishlist-overlay-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
                            </svg>
                            <span>Local Captain</span>
                          </div>
                        </div>
                      </div>
                      <div className="wishlist-verified-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span>Verified Captain</span>
                      </div>
                      <button 
                        className="wishlist-remove-btn"
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        title="Remove from wishlist"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#1a1a1a"/>
                        </svg>
                      </button>
                    </div>
                    <div className="wishlist-card-content">
                      <p className="wishlist-card-description">
                        {item.category === 'Adventure' && 'Thrilling mountain adventures and scenic landscapes. Perfect for adventure seekers and nature lovers.'}
                        {item.category === 'Beach' && 'Pristine beaches and crystal-clear waters. Perfect getaway for beach lovers and relaxation seekers.'}
                        {item.category === 'Nature' && 'Serene backwaters and peaceful surroundings. Perfect getaway for nature lovers and peace seekers.'}
                        {item.category === 'Heritage' && 'Royal palaces and rich cultural heritage. Perfect for history enthusiasts and culture lovers.'}
                        {!['Adventure', 'Beach', 'Nature', 'Heritage'].includes(item.category) && 'Experience the best of this destination with our curated travel package.'}
                      </p>
                      <div className="wishlist-card-footer">
                        <div className="wishlist-price">
                          <span className="wishlist-price-current">₹{item.price.toLocaleString()}</span>
                          <span className="wishlist-price-per">/ person</span>
                          {item.originalPrice > item.price && (
                            <span className="wishlist-price-original">₹{item.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="wishlist-rating-badge">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className="wishlist-rating-value">{item.rating}</span>
                          <span className="wishlist-rating-reviews">({item.reviews})</span>
                        </div>
                      </div>
                      <div className="wishlist-card-actions">
                        <button 
                          className="wishlist-view-details-btn"
                          onClick={() => router.push(`/packages/${item.id}`)}
                        >
                          View Details
                        </button>
                        <button 
                          className="wishlist-book-btn"
                          onClick={() => handleBookNow(item)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="wishlist-empty-state">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" stroke="#9ca3af" strokeWidth="2" fill="none"/>
                  </svg>
                  <h3>No items found in this category</h3>
                  <p>Try selecting a different filter</p>
                </div>
              )}
            </>
          ) : (
            <div className="wishlist-empty-state">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" stroke="#9ca3af" strokeWidth="2" fill="none"/>
              </svg>
              <h3>Your wishlist is empty</h3>
              <p>Start exploring amazing destinations and add them to your wishlist</p>
              <button 
                className="wishlist-explore-btn"
                onClick={() => router.push('/packages')}
              >
                Explore Packages
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

