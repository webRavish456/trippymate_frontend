"use client"

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useRouter } from "next/navigation";
import { setUser, clearUser } from "@/store/actions/userActions";
import store from "@/store/store";

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  // Initialize loading state - always start with true for SSR consistency
  // This ensures server and client render the same initial HTML
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
  const bannerHeightRef = useRef(0);

  useEffect(() => {
    // Mark component as mounted (client-side only)
    setIsMounted(true);

    // Only run on client-side
    if (typeof window === 'undefined') {
      setIsCheckingAuth(false);
      return;
    }

    // Check if user is already loaded from store initialization
    const state = store.getState();
    if (state?.user?.user && state?.user?.isAuthenticated) {
      setIsCheckingAuth(false);
      return;
    }

    // Simple auth check - no event listeners
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Handle Google profile picture
        if (userData.picture && !userData.profilePicture) {
          userData.profilePicture = userData.picture;
        }
        // Set user in Redux from localStorage - NO API CALL
        dispatch(setUser(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
        dispatch(clearUser());
      }
    } else {
      dispatch(clearUser());
    }
    
    // Mark auth check as complete
    setIsCheckingAuth(false);
  }, [dispatch]);

  // Detect banner/hero section height and handle scroll
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectBannerHeight = () => {
      // Try multiple selectors to find banner/hero sections
      const selectors = [
        'section:first-of-type',
        '.hero-section',
        '.banner-section',
        '.blog-hero-section',
        '.companion-banner-section-dummy',
        '.unforgettable-journey-hero',
        '.region-detail-header',
        '.destination-hero-header',
        '[class*="hero"]',
        '[class*="banner"]',
        '[id*="hero"]',
        '[id*="banner"]'
      ];

      let bannerElement = null;
      
      // Try each selector
      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            const rect = element.getBoundingClientRect();
            // Check if element is visible and has significant height
            if (rect.height > 200 && rect.top < window.innerHeight) {
              bannerElement = element;
              break;
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      // If no banner found, check first main content element and its children
      if (!bannerElement) {
        const main = document.querySelector('main');
        if (main) {
          // Check first child
          const firstChild = main.firstElementChild;
          if (firstChild) {
            // Check if first child has a large child (like blog hero div)
            const firstGrandChild = firstChild.firstElementChild;
            if (firstGrandChild) {
              const rect = firstGrandChild.getBoundingClientRect();
              if (rect.height > 300) {
                bannerElement = firstGrandChild;
              }
            }
            // Also check first child itself
            if (!bannerElement) {
              const rect = firstChild.getBoundingClientRect();
              if (rect.height > 300) {
                bannerElement = firstChild;
              }
            }
          }
        }
      }

      // Also check for divs with large heights directly in main
      if (!bannerElement) {
        const main = document.querySelector('main');
        if (main) {
          const allDivs = main.querySelectorAll('div');
          for (const div of allDivs) {
            const rect = div.getBoundingClientRect();
            // Check if it's a large div near the top (likely a hero/banner)
            if (rect.height > 400 && rect.top >= 0 && rect.top < 100) {
              bannerElement = div;
              break;
            }
          }
        }
      }

      if (bannerElement) {
        const rect = bannerElement.getBoundingClientRect();
        const scrollTop = window.scrollY || window.pageYOffset;
        // Calculate absolute position: distance from top of document to bottom of banner
        // rect.top is relative to viewport, so add scrollTop to get absolute position
        // Then add rect.height to get the bottom position
        const bannerTop = scrollTop + rect.top;
        const bannerBottom = bannerTop + rect.height;
        const height = Math.max(bannerBottom, 300); // Minimum 300px
        setBannerHeight(height);
        bannerHeightRef.current = height;
      } else {
        // No banner detected, use default threshold
        setBannerHeight(0);
        bannerHeightRef.current = 0;
      }
    };

    const handleScroll = () => {
      const scrollPosition = window.scrollY || window.pageYOffset;
      // If banner height is detected, use it; otherwise use 50px threshold
      if (bannerHeightRef.current > 0) {
        // When banner is detected, change header when scrolled past 80% of banner
        const threshold = bannerHeightRef.current * 0.8;
        setIsScrolled(scrollPosition > threshold);
      } else {
        // Default threshold for pages without detected banner
        setIsScrolled(scrollPosition > 50);
      }
    };

    // Initial detection after DOM is ready
    const initDetection = () => {
      detectBannerHeight();
      handleScroll();
    };

    // Run immediately
    initDetection();

    // Re-detect after a delay to ensure DOM is fully loaded
    const timeoutId1 = setTimeout(initDetection, 100);
    const timeoutId2 = setTimeout(initDetection, 500);

    // Re-detect on resize and scroll
    window.addEventListener('resize', detectBannerHeight, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Use MutationObserver to detect when banner content loads
    const observer = new MutationObserver(() => {
      detectBannerHeight();
    });

    const main = document.querySelector('main');
    if (main) {
      observer.observe(main, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('resize', detectBannerHeight);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      observer.disconnect();
    };
  }, []); // Empty dependency array - only run once on mount

  // Removed fetchUserData function - No API calls needed
  // User data is loaded directly from localStorage

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    dispatch(clearUser());
    setShowDropdown(false);
    router.push('/');
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    router.push('/profile');
  };

  const handleWishlistClick = () => {
    setShowDropdown(false);
    router.push('/wishlist');
  };

  const handleBookingClick = () => {
    setShowDropdown(false);
    router.push('/my-bookings');
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <header 
      className="header"
      style={{
        background: isScrolled 
          ? 'rgba(29, 78, 216, 0.95)' 
          : bannerHeight > 0 
            ? 'rgba(29, 78, 216, 0.1)' // More transparent when in banner area
            : 'rgba(29, 78, 216, 0.3)',
        backdropFilter: isScrolled ? 'blur(20px)' : 'blur(5px)',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
        boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
        borderBottom: isScrolled 
          ? '1px solid rgba(255, 255, 255, 0.2)' 
          : '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="header-container">

        {/* Logo */}
        <div className="header-left" onClick={() => router.push('/')}>
          <img src="/logo.png" alt="Logo" className="header-logo" />
         
        </div>

        {/* Menu */}
        <nav className="header-menu">
          <a href="/trippy-mates">Trippy Mates</a>
          <a href="/explore-destination">Explore Destinations <KeyboardArrowDownIcon size={16} /></a>
          <a href="/packages">Packages</a>
          <a href="/blog">Blog</a>
          <a href="/community">Community</a>
        </nav>

        {/* Right Side */}
        <div className="header-right">
          <div 
            className="help-dropdown"
            onClick={() => setShowSupportPopup(!showSupportPopup)}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <img src="/help.png" alt="Help" className="help-icon" />
            <KeyboardArrowDownIcon size={16} />
            
            {/* Support Popover */}
            {showSupportPopup && (
              <div 
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  minWidth: '320px',
                  zIndex: 1000,
                  padding: '1.25rem',
                  border: '1px solid #e5e7eb'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Call Support Section */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '0.9375rem',
                      fontWeight: '700',
                      color: '#1e293b',
                      marginBottom: '0.5rem'
                    }}>
                      Call Support
                    </h3>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: '#1D4ED8',
                      fontWeight: '600'
                    }}>
                      <a 
                        href="tel:+911143131313"
                        style={{
                          color: '#1D4ED8',
                          textDecoration: 'none',
                          fontWeight: '600',
                          transition: 'color 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#1e40af'}
                        onMouseLeave={(e) => e.target.style.color = '#1D4ED8'}
                      >
                        Tel: 011 - 43131313
                      </a>
                      <span style={{ color: '#64748b', margin: '0 0.25rem' }}>,</span>
                      <a 
                        href="tel:+911143030303"
                        style={{
                          color: '#1D4ED8',
                          textDecoration: 'none',
                          fontWeight: '600',
                          transition: 'color 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#1e40af'}
                        onMouseLeave={(e) => e.target.style.color = '#1D4ED8'}
                      >
                        43030303
                      </a>
                    </div>
                  </div>
                </div>

             
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '0.9375rem',
                      fontWeight: '700',
                      color: '#1e293b',
                      marginBottom: '0.5rem'
                    }}>
                      Mail Support
                    </h3>
                    <a 
                      href="mailto:Care@trippymates.com"
                      style={{
                        fontSize: '0.8125rem',
                        color: '#64748b',
                        textDecoration: 'none',
                        fontWeight: '600',
                        transition: 'color 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#475569'}
                      onMouseLeave={(e) => e.target.style.color = '#64748b'}
                    >
                      Care@trippymates.com
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isMounted || isCheckingAuth ? (
            // Show placeholder with same dimensions as login button to prevent layout shift
            // Only show during SSR or while checking auth
            <div style={{ 
              width: '120px', 
              height: '40px',
              display: 'inline-block'
            }} />
          ) : isAuthenticated && user ? (
            <div className="user-avatar-container" style={{ position: 'relative' }}>
              <div 
                className="user-avatar" 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#1D4ED8',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  flexShrink: 0
                }}
              >
                {(user?.profilePicture || user?.picture) ? (
                  <img 
                    src={user.profilePicture || user.picture} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      // If image fails to load, show initials instead
                      e.target.style.display = 'none';
                      e.target.parentElement.textContent = getUserInitials();
                    }}
                  />
                ) : (
                  getUserInitials()
                )}
              </div>
              
              {showDropdown && (
                <div 
                  className="user-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: '0',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '200px',
                    zIndex: 1000,
                    padding: '8px 0',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div
                    onClick={handleProfileClick}
                    style={{
                      padding: '12px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    My Profile
                  </div>
                  <div
                    onClick={handleWishlistClick}
                    style={{
                      padding: '12px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    My Wishlist
                  </div>
                  <div
                    onClick={handleBookingClick}
                    style={{
                      padding: '12px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    My Booking
                  </div>
                  <div
                    style={{
                      borderTop: '1px solid #e5e7eb',
                      margin: '4px 0'
                    }}
                  />
                  <div
                    onClick={handleLogout}
                    style={{
                      padding: '12px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#ef4444',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={() => router.push('/auth/login')}>Join / Log In</button>
          )}
        </div>

      </div>
      

      {showDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}

  
      {showSupportPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowSupportPopup(false)}
        />
      )}
    </header>
  );
}
