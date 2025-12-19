'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BusinessPartnerPage() {
  const router = useRouter();
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleVendorClick = () => {
    setShowVendorModal(true);
  };

  const handleGuideClick = () => {
    setShowGuideModal(true);
  };

  const handleVendorRegister = () => {
    setShowVendorModal(false);
    router.push('/business-partner/vendor');
  };

  const handleGuideRegister = () => {
    setShowGuideModal(false);
    router.push('/business-partner/guide');
  };

  return (
    <div className="packages-page">
      {/* Hero Section */}
      <section className="business-hero-section">
        <div className="business-hero-container">
          <div className="business-hero-content">
            <h1 className="business-hero-title">Join TrippyMates as a Business Partner</h1>
            <p className="business-hero-subtitle">
              Join us to grow your business and start earning. Become a Vendor or a Guide (Captain) and connect with travelers worldwide.
            </p>
            <div className="business-hero-stats">
              <div className="business-stat-item">
                <div className="business-stat-number">10K+</div>
                <div className="business-stat-label">Active Partners</div>
              </div>
              <div className="business-stat-item">
                <div className="business-stat-number">50K+</div>
                <div className="business-stat-label">Travelers Served</div>
              </div>
              <div className="business-stat-item">
                <div className="business-stat-number">₹2Cr+</div>
                <div className="business-stat-label">Revenue Generated</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Types Section */}
      <section className="business-partners-section">
        <div className="business-container">
          <div className="business-section-header">
            <h2 className="business-section-title">Choose Your Partner Type</h2>
            <p className="business-section-description">
              Select the option that best describes your business and start your journey with TrippyMates
            </p>
          </div>
          <div className="business-partners-grid">
            {/* Vendor Card */}
            <div className="business-partner-card">
              <div className="business-partner-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" stroke="#1D4ED8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="business-partner-title">Vendor/Business Owner</h3>
              <p className="business-partner-description">
                List rooms, vehicles, restaurants, and more. Pick a service type and the form adapts automatically. Manage your listings easily and reach thousands of travelers.
              </p>
              <div className="business-partner-features">
                <div className="business-feature-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#059669"/>
                  </svg>
                  <span>Easy Listing Management</span>
                </div>
                <div className="business-feature-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#059669"/>
                  </svg>
                  <span>Real-time Booking Updates</span>
                </div>
                <div className="business-feature-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#059669"/>
                  </svg>
                  <span>Secure Payment Processing</span>
                </div>
              </div>
              <button className="business-partner-btn" onClick={handleVendorClick}>
                Continue
              </button>
            </div>

            {/* Guide Card */}
            <div className="business-partner-card">
              <div className="business-partner-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#1D4ED8" strokeWidth="2" fill="none"/>
                  <path d="M12 6v6l4 2" stroke="#1D4ED8" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="business-partner-title">Guide/Captain</h3>
              <p className="business-partner-description">
                Offer guiding/captain services and define your service area. Vehicle renters can also register here if applicable. Share your local expertise with travelers.
              </p>
              <div className="business-partner-features">
                <div className="business-feature-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#059669"/>
                  </svg>
                  <span>Flexible Service Areas</span>
                </div>
                <div className="business-feature-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#059669"/>
                  </svg>
                  <span>Direct Traveler Connection</span>
                </div>
                <div className="business-feature-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#059669"/>
                  </svg>
                  <span>Competitive Earnings</span>
                </div>
              </div>
              <button className="business-partner-btn" onClick={handleGuideClick}>
                Continue
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Business Opportunities Section */}
      <section className="business-opportunities-section">
        <div className="business-container">
          <div className="business-section-header">
            <h2 className="business-section-title">Business Opportunities</h2>
            <p className="business-section-description">
              Explore diverse ways to grow your local business through our platform. Connect with travelers worldwide and expand your reach.
            </p>
          </div>
          
          {/* Category Tabs */}
          <div className="business-category-tabs">
            <button className="business-category-tab active">Vehicle owners</button>
            <button className="business-category-tab">Guide</button>
            <button className="business-category-tab">Restaurants</button>
            <button className="business-category-tab">Vendor</button>
            <button className="business-category-tab">Adventure</button>
          </div>

          {/* Room Rentals Feature */}
          <div className="business-feature-card">
            <div className="business-feature-content">
              <h3 className="business-feature-title">Maximize your property potential</h3>
              <p className="business-feature-description">
                Turn your spare rooms into profitable travel accommodations. Easy listing and management with real-time availability updates.
              </p>
              <div className="business-feature-benefits">
                <div className="business-benefit-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
                  </svg>
                  <span>Instant Booking Notifications</span>
                </div>
                <div className="business-benefit-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
                  </svg>
                  <span>Automated Calendar Management</span>
                </div>
                <div className="business-benefit-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
                  </svg>
                  <span>Secure Payment Gateway</span>
                </div>
              </div>
              <div className="business-feature-actions">
                <button className="business-feature-btn-primary" onClick={handleVendorClick}>
                  List now
                </button>
                <button className="business-feature-link" onClick={handleVendorClick}>
                  Learn more &gt;
                </button>
              </div>
            </div>
            <div className="business-feature-image">
              <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop" alt="Room rental" />
            </div>
          </div>
        </div>
      </section>

      {/* Guide Opportunities Section */}
      <section className="business-guide-section">
        <div className="business-container">
          <div className="business-section-header">
            <h2 className="business-section-title">Guide Opportunities</h2>
            <p className="business-section-description">
              Share your expertise and earn by helping travelers discover amazing destinations
            </p>
          </div>
          <div className="business-guide-grid">
            <div className="business-guide-opportunities">
              <div className="business-guide-item">
                <div className="business-guide-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#1D4ED8"/>
                  </svg>
                </div>
                <div className="business-guide-content">
                  <h4 className="business-guide-title">Local guides</h4>
                  <p className="business-guide-description">
                    Share your local knowledge and help travelers discover hidden gems in your area. Build your reputation and earn competitive rates.
                  </p>
                  <ul className="business-guide-list">
                    <li>Set your own rates</li>
                    <li>Choose your availability</li>
                    <li>Get verified badge</li>
                  </ul>
                  <button className="business-guide-btn" onClick={handleGuideClick}>
                    Become guide &gt;
                  </button>
                </div>
              </div>

              <div className="business-guide-item">
                <div className="business-guide-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 21h18v-2H3v2zM3 8v2l4-2-4-2zm0 4v2h18V12H3zm0 4v2h18v-2H3z" fill="#1D4ED8"/>
                  </svg>
                </div>
                <div className="business-guide-content">
                  <h4 className="business-guide-title">Community tours</h4>
                  <p className="business-guide-description">
                    Create and lead unique local experiences for travelers seeking authentic connections. Design custom tours that showcase your expertise.
                  </p>
                  <ul className="business-guide-list">
                    <li>Create custom tour packages</li>
                    <li>Group booking management</li>
                    <li>Marketing support</li>
                  </ul>
                  <button className="business-guide-btn" onClick={handleGuideClick}>
                    Design tour &gt;
                  </button>
                </div>
              </div>
            </div>

            <div className="business-guide-opportunities">
              <div className="business-guide-item">
                <div className="business-guide-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" fill="#1D4ED8"/>
                  </svg>
                </div>
                <div className="business-guide-content">
                  <h4 className="business-guide-title">Vehicle guides</h4>
                  <p className="business-guide-description">
                    Offer transportation and local insights for travelers exploring your region. Combine vehicle rental with expert guidance.
                  </p>
                  <ul className="business-guide-list">
                    <li>Vehicle + Guide packages</li>
                    <li>Flexible pricing options</li>
                    <li>Insurance coverage</li>
                  </ul>
                  <button className="business-guide-btn" onClick={handleGuideClick}>
                    Register now &gt;
                  </button>
                </div>
              </div>

              <div className="business-guide-item">
                <div className="business-guide-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="#1D4ED8"/>
                  </svg>
                </div>
                <div className="business-guide-content">
                  <h4 className="business-guide-title">Expert support</h4>
                  <p className="business-guide-description">
                    Access training and resources to help you become a successful local guide. Get certified and boost your credibility.
                  </p>
                  <ul className="business-guide-list">
                    <li>Free training materials</li>
                    <li>Certification programs</li>
                    <li>24/7 support</li>
                  </ul>
                  <button className="business-guide-btn" onClick={handleGuideClick}>
                    Get started &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="business-why-section">
        <div className="business-container">
          <div className="business-section-header">
            <h2 className="business-section-title">Why Choose TrippyMates?</h2>
            <p className="business-section-description">
              Join thousands of successful partners earning with our platform
            </p>
          </div>
          <div className="business-why-grid">
            <div className="business-why-item">
              <div className="business-why-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#1D4ED8" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h4 className="business-why-title">Easy Setup</h4>
              <p className="business-why-description">Get started in minutes with our simple registration process</p>
            </div>
            <div className="business-why-item">
              <div className="business-why-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="#1D4ED8" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h4 className="business-why-title">Fast Payments</h4>
              <p className="business-why-description">Receive payments quickly and securely through our platform</p>
            </div>
            <div className="business-why-item">
              <div className="business-why-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#1D4ED8" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h4 className="business-why-title">Wide Reach</h4>
              <p className="business-why-description">Connect with travelers from across the globe</p>
            </div>
            <div className="business-why-item">
              <div className="business-why-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#1D4ED8" strokeWidth="2" fill="none"/>
                  <path d="M22 4L12 14.01l-3-3" stroke="#1D4ED8" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h4 className="business-why-title">24/7 Support</h4>
              <p className="business-why-description">Get help whenever you need it from our dedicated team</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor Modal */}
      {showVendorModal && (
        <div className="business-modal-overlay" onClick={() => setShowVendorModal(false)}>
          <div className="business-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="business-modal-header">
              <h3>Register as Vendor</h3>
              <button className="business-modal-close" onClick={() => setShowVendorModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div className="business-modal-body">
              <p>Are you ready to start listing your services as a vendor? Fill in your business details and start earning today.</p>
              <div className="business-modal-actions">
                <button className="business-modal-cancel" onClick={() => setShowVendorModal(false)}>
                  Cancel
                </button>
                <button className="business-modal-confirm" onClick={handleVendorRegister}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <div className="business-modal-overlay" onClick={() => setShowGuideModal(false)}>
          <div className="business-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="business-modal-header">
              <h3>Register as Guide/Captain</h3>
              <button className="business-modal-close" onClick={() => setShowGuideModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div className="business-modal-body">
              <p>Are you ready to start offering guide services? Share your expertise and help travelers discover amazing destinations.</p>
              <div className="business-modal-actions">
                <button className="business-modal-cancel" onClick={() => setShowGuideModal(false)}>
                  Cancel
                </button>
                <button className="business-modal-confirm" onClick={handleGuideRegister}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

