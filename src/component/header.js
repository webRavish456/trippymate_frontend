"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import { useRouter, usePathname } from "next/navigation";
import { setUser, clearUser } from "@/store/actions/userActions";
import store from "@/store/store";
import { useMediaQuery } from "@mui/material";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  
  // Check if we're on homepage
  const isHomepage = pathname === '/';

  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const bannerHeightRef = useRef(0);
  const isSmScreen = useMediaQuery("(max-width: 768px)");

  /* ---------- AUTH CHECK ---------- */
  useEffect(() => {
    setIsMounted(true);

    if (typeof window === "undefined") {
      setIsCheckingAuth(false);
      return;
    }

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        dispatch(setUser(JSON.parse(storedUser)));
      } catch {
        dispatch(clearUser());
      }
    } else {
      dispatch(clearUser());
    }

    setIsCheckingAuth(false);
  }, [dispatch]);

  /* ---------- SCROLL EFFECT ---------- */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Determine background based on homepage and scroll
  const getHeaderBackground = () => {
    if (isHomepage) {
      // Fully transparent on homepage
      return isScrolled ? "rgba(29, 78, 216, 0.95)" : "transparent";
    }
    // Other pages keep original behavior
    return isScrolled
      ? "rgba(29, 78, 216, 0.95)"
      : "rgba(29, 78, 216, 0.3)";
  };

  return (
    <header
      className={`header ${isHomepage && !isScrolled ? 'header-transparent' : ''}`}
      style={{
        background: getHeaderBackground(),
        borderBottom: isHomepage && !isScrolled ? 'none' : undefined,
      }}
    >
      <div className="header-container">
        {/* LEFT */}
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

        {/* DESKTOP MENU */}
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

        {/* RIGHT */}
        <div className="header-right">
          {!isMounted || isCheckingAuth ? null : (
            <>
              {/* HELP ICON (DESKTOP) */}
              {!isSmScreen && (
                <div
                  className="help-dropdown"
                  onClick={() => setShowSupportPopup((p) => !p)}
                  style={{ position: "relative" }}
                >
                  <img src="/help.png" alt="Help" className="help-icon" />

                  {/* CALL SUPPORT POPUP */}
                  {showSupportPopup && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        top: "45px",
                        right: 0,
                        background: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        minWidth: "320px",
                        padding: "1.25rem",
                        zIndex: 1000,
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      {/* CALL */}
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          paddingBottom: "16px",
                          marginBottom: "16px",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <div style={{ fontSize: "22px" }}>📞</div>
                        <div>
                          <div style={{ fontWeight: 700, marginBottom: "6px" }}>
                            Call Support
                          </div>
                          <a
                            href="tel:+911143131313"
                            style={{
                              display: "block",
                              color: "#1D4ED8",
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
                              color: "#1D4ED8",
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
                          <div style={{ fontWeight: 700, marginBottom: "6px" }}>
                            Mail Support
                          </div>
                          <a
                            href="mailto:Care@trippymates.com"
                            style={{
                              color: "#64748b",
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

              {/* USER / LOGIN */}
              {isAuthenticated ? (
                <button
                  className="header-user-icon"
                  onClick={() => router.push("/profile")}
                >
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} />
                  ) : (
                    <span>{getUserInitials()}</span>
                  )}
                </button>
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

      {/* MOBILE MENU */}
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

      {/* OVERLAY */}
      {(mobileMenuOpen || showSupportPopup) && (
        <div
          className="mobile-menu-overlay"
          onClick={() => {
            setMobileMenuOpen(false);
            setShowSupportPopup(false);
          }}
        />
      )}
    </header>
  );
}
