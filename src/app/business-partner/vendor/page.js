'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VendorRegistrationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    panNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    description: '',
    services: [],
    amenities: []
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.businessName || !formData.businessType || !formData.ownerName || 
        !formData.email || !formData.phone || !formData.address || !formData.city || 
        !formData.state || !formData.pincode) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (!formData.email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (formData.phone.length < 10) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }

    try {
      // Here you would call your backend API
      // const response = await fetch('/api/vendor/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // For now, simulate success
      showToast('Vendor registration successful! We will contact you soon.', 'success');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/business-partner');
      }, 2000);
    } catch (error) {
      showToast('Registration failed. Please try again.', 'error');
    }
  };

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

      <section className="packages-hero-section">
        <div className="packages-hero-container">
          <div className="packages-hero-content">
            <button 
              className="packages-back-btn"
              onClick={() => router.push('/trippy-mates')}
            >
              ← Back
            </button>
            <h1 className="packages-hero-title">Vendor Registration</h1>
            <p className="packages-hero-subtitle">Fill in your business details to get started as a vendor partner</p>
          </div>
        </div>
      </section>

      <section className="packages-details-section">
        <div className="packages-details-container">
          <div className="packages-detail-card">
            <form className="business-registration-form" onSubmit={handleSubmit}>
              <h2 className="business-form-section-title">Business Information</h2>
              <div className="business-form-grid">
                <div className="packages-form-group">
                  <label>Business Name *</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Enter business name"
                    required
                  />
                </div>

                <div className="packages-form-group">
                  <label>Business Type *</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select business type</option>
                    <option value="hotel">Hotel</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="vehicle">Vehicle Rental</option>
                    <option value="adventure">Adventure Activity</option>
                    <option value="homestay">Homestay</option>
                    <option value="resort">Resort</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="packages-form-group">
                  <label>Owner Name *</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Enter owner name"
                    required
                  />
                </div>

                <div className="packages-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="packages-form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    maxLength="10"
                    required
                  />
                </div>

                <div className="packages-form-group packages-form-group-full">
                  <label>Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    rows={3}
                    required
                  />
                </div>

                <div className="packages-form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div className="packages-form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                  />
                </div>

                <div className="packages-form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter pincode"
                    maxLength="6"
                    required
                  />
                </div>
              </div>

              <h2 className="business-form-section-title">Services & Amenities</h2>
              <div className="business-form-grid">
                <div className="packages-form-group packages-form-group-full">
                  <label>Services Offered *</label>
                  <div className="business-services-grid">
                    {['Room Rental', 'Vehicle Rental', 'Restaurant', 'Adventure Activities', 'Tour Packages', 'Local Experiences'].map(service => (
                      <label key={service} className="business-service-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service)}
                          onChange={() => handleServiceToggle(service)}
                        />
                        <span>{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="packages-form-group packages-form-group-full">
                  <label>Amenities Available</label>
                  <div className="business-services-grid">
                    {['WiFi', 'Parking', 'AC', 'Breakfast', 'Swimming Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Laundry'].map(amenity => (
                      <label key={amenity} className="business-service-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                        />
                        <span>{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <h2 className="business-form-section-title">Business Details</h2>
              <div className="business-form-grid">
                <div className="packages-form-group">
                  <label>GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="Enter GST number (optional)"
                  />
                </div>

                <div className="packages-form-group">
                  <label>PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    placeholder="Enter PAN number (optional)"
                    maxLength="10"
                  />
                </div>

                <div className="packages-form-group packages-form-group-full">
                  <label>Business Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your business, facilities, and what makes it special..."
                    rows={5}
                  />
                </div>
              </div>

              <h2 className="business-form-section-title">Banking Information</h2>
              <div className="business-form-grid">
                <div className="packages-form-group">
                  <label>Bank Account Number</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    placeholder="Enter account number (optional)"
                  />
                </div>

                <div className="packages-form-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    placeholder="Enter IFSC code (optional)"
                    maxLength="11"
                  />
                </div>
              </div>

              <div className="business-form-actions">
                <button
                  type="button"
                  className="business-form-cancel-btn"
                  onClick={() => router.push('/trippy-mates')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="business-form-submit-btn"
                >
                  Submit Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

