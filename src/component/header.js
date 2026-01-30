"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import { useRouter } from "next/navigation";
import { setUser, clearUser } from "@/store/actions/userActions";
import { useMediaQuery } from "@mui/material";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const isSmScreen = useMediaQuery("(max-width: 768px)");

  /* ---------- AUTH CHECK ---------- */
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsCheckingAuth(false);
      return;
    }

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Ensure profilePicture is set from picture if available
        if (userData && userData.picture && !userData.profilePicture) {
          userData.profilePicture = userData.picture;
        }
        // Ensure profilePicture URL is valid (not empty string)
        if (userData && userData.profilePicture === '') {
          userData.profilePicture = null;
        }
        dispatch(setUser(userData));
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        dispatch(clearUser());
      }
    } else {
      dispatch(clearUser());
    }

    setIsCheckingAuth(false);
  }, [dispatch]);

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  const getProfilePictureUrl = () => {
    const picUrl = user?.profilePicture || user?.picture;
    if (!picUrl || picUrl.trim() === '') return null;

    try {
      new URL(picUrl);
      return picUrl;
    } catch {

      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(clearUser());
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <header className="header">
      <div className="header-container">

        <div className="header-left-section">
          {isSmScreen && (
            <button
              className="hamburger-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          )}

          <div className="header-left" onClick={() => router.push("/")}>
            <img src="/logo.png" alt="Logo" className="header-logo" />
          </div>
        </div>


        {!isSmScreen && (
          <nav className="header-menu">
            <a href="/trippy-mates">Trippy Mates</a>
            <a href="/explore-destination">
              Explore Destinations <KeyboardArrowDownIcon size={16} />
            </a>
            <a href="/packages">Packages</a>
            <a href="/blog">Blog</a>
            <a href="/community">Community</a>
          </nav>
        )}


        <div className="header-right">
          {isCheckingAuth ? null : (
            <>
       
              {!isSmScreen && (
                <div
                  className="help-dropdown"
                  onClick={() => setShowSupportPopup((p) => !p)}
                  style={{ position: "relative" }}
                >
                  <img src="/help.png" alt="Help" className="help-icon" />

         
                  {showSupportPopup && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        top: "45px",
                        right: 0,
                        background: "var(--primary-blue)",
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        minWidth: "320px",
                        padding: "1.25rem",
                        zIndex: 1000,
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      {/* CALL */}
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          paddingBottom: "16px",
                          marginBottom: "16px",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <div style={{ fontSize: "22px" }}>📞</div>
                        <div>
                          <div style={{ fontWeight: 700, marginBottom: "6px", color: "#fff" }}>
                            Call Support
                          </div>
                          <a
                            href="tel:+911143131313"
                            style={{
                              display: "block",
                              color: "#fff",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            Tel : 011 - 43131313
                          </a>
                          <a
                            href="tel:+911143030303"
                            style={{
                              display: "block",
                              color: "#fff",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            43030303
                          </a>
                        </div>
                      </div>

                      {/* MAIL */}
                      <div style={{ display: "flex", gap: "12px" }}>
                        <div style={{ fontSize: "22px" }}>✉️</div>
                        <div>
                          <div style={{ fontWeight: 700, marginBottom: "6px", color: "#fff" }}>
                            Mail Support
                          </div>
                          <a
                            href="mailto:Care@trippymates.com"
                            style={{
                              color: "#fff",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            Care@trippymates.com
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

        
              {isAuthenticated ? (
                <div style={{ position: 'relative' }}>
                  <button
                    className="header-user-icon"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="User menu"
                  >
                    {getProfilePictureUrl() ? (
                      <>
                        <Image
                          fill
                          src={getProfilePictureUrl()}
                          alt={user?.name || 'User'}
                          className="header-avatar-image"
                          sizes="96px"
                        />
                      </>
                    ) : (
                      <span className="header-avatar-initials">
                        {getUserInitials()}
                      </span>
                    )}
                  </button>

                  {showUserMenu && (
                    <>
                      <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          position: 'fixed',
                          inset: 0,
                          zIndex: 999,
                          cursor: 'default',
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          width: '100%',
                          height: '100%',
                        }}
                      />
                      <div
                        style={{
                        position: "absolute",
                        top: "50px",
                        right: 0,
                        background: "rgba(245, 245, 247, 0.98)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        minWidth: "200px",
                        padding: "0.5rem",
                        zIndex: 1000,
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      {/* User Info */}
                      <div
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #e5e7eb",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <div style={{ 
                          fontWeight: 600, 
                          fontSize: "0.9375rem",
                          color: "#1f2937",
                          marginBottom: "0.25rem"
                        }}>
                          {user?.name || 'User'}
                        </div>
                        <div style={{ 
                          fontSize: "0.8125rem",
                          color: "#6b7280"
                        }}>
                          {user?.email || ''}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <button
                        onClick={() => {
                          router.push("/profile");
                          setShowUserMenu(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          background: "transparent",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.9375rem",
                          color: "#374151",
                          fontWeight: 500,
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                        }}
                      >
                        My Account
                      </button>

                      <button
                        onClick={() => {
                          router.push("/my-bookings");
                          setShowUserMenu(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          background: "transparent",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.9375rem",
                          color: "#374151",
                          fontWeight: 500,
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                        }}
                      >
                        My Booking
                      </button>

                      <button
                        onClick={() => {
                          router.push("/my-rewards");
                          setShowUserMenu(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          background: "transparent",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.9375rem",
                          color: "#374151",
                          fontWeight: 500,
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                        }}
                      >
                        My Rewards
                      </button>

                      <button
                        onClick={() => {
                          router.push("/wishlist");
                          setShowUserMenu(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          background: "transparent",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.9375rem",
                          color: "#374151",
                          fontWeight: 500,
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                        }}
                      >
                        My Wishlist
                      </button>

                      <div
                        style={{
                          height: "1px",
                          background: "#e5e7eb",
                          margin: "0.5rem 0",
                        }}
                      />

                      <button
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          background: "transparent",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.9375rem",
                          color: "#dc2626",
                          fontWeight: 600,
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#fee2e2";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                        }}
                      >
                        Logout
                      </button>
                    </div>
                    </>
                  )}
                </div>
              ) : isSmScreen ? (
                <button
                  className="header-user-icon"
                  onClick={() => router.push("/auth/login")}
                >
                  <PersonIcon style={{ color: "white", fontSize: 28 }} />
                </button>
              ) : (
                <button
                  className="login-btn"
                  onClick={() => router.push("/auth/login")}
                >
                  Join / Login
                </button>
              )}
            </>
          )}
        </div>
      </div>


      {isSmScreen && mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-menu-nav">
            <a href="/trippy-mates" onClick={() => setMobileMenuOpen(false)}>
              Trippy Mates
            </a>
            <a
              href="/explore-destination"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore Destinations <KeyboardArrowDownIcon size={16} />
            </a>
            <a href="/packages" onClick={() => setMobileMenuOpen(false)}>
              Packages
            </a>
            <a href="/blog" onClick={() => setMobileMenuOpen(false)}>
              Blog
            </a>
            <a href="/community" onClick={() => setMobileMenuOpen(false)}>
              Community
            </a>
          </nav>
        </div>
      )}


      {(mobileMenuOpen || showSupportPopup || showUserMenu) && (
        <div
          className="mobile-menu-overlay"
          onClick={() => {
            setMobileMenuOpen(false);
            setShowSupportPopup(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}
