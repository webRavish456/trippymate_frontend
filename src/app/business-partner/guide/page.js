'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GuideRegistrationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    guideName: '',
    guideType: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    serviceArea: '',
    experience: '',
    languages: [],
    vehicleOwned: false,
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: '',
    aadharNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    specialties: [],
    description: '',
    hourlyRate: '',
    availability: []
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLanguageToggle = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleAvailabilityToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.guideName || !formData.guideType || !formData.email || 
        !formData.phone || !formData.address || !formData.serviceArea) {
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
      // const response = await fetch('/api/guide/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // For now, simulate success
      showToast('Guide registration successful! We will contact you soon.', 'success');
      
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
            <h1 className="packages-hero-title">Guide/Captain Registration</h1>
            <p className="packages-hero-subtitle">Fill in your guide details to start offering services to travelers</p>
          </div>
        </div>
      </section>

      <section className="packages-details-section">
        <div className="packages-details-container">
          <div className="packages-detail-card">
            <form className="business-registration-form" onSubmit={handleSubmit}>
              <h2 className="business-form-section-title">Personal Information</h2>
              <div className="business-form-grid">
                <div className="packages-form-group">
                  <label>Guide Name *</label>
                  <input
                    type="text"
                    name="guideName"
                    value={formData.guideName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="packages-form-group">
                  <label>Guide Type *</label>
                  <select
                    name="guideType"
                    value={formData.guideType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select guide type</option>
                    <option value="local">Local Guide</option>
                    <option value="vehicle">Vehicle Guide/Captain</option>
                    <option value="adventure">Adventure Guide</option>
                    <option value="tour">Tour Guide</option>
                    <option value="cultural">Cultural Guide</option>
                  </select>
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

                <div className="packages-form-group">
                  <label>Aadhar Number *</label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    placeholder="Enter 12-digit Aadhar number"
                    maxLength="12"
                    required
                  />
                </div>
              </div>

              <h2 className="business-form-section-title">Service Details</h2>
              <div className="business-form-grid">
                <div className="packages-form-group packages-form-group-full">
                  <label>Service Area *</label>
                  <input
                    type="text"
                    name="serviceArea"
                    value={formData.serviceArea}
                    onChange={handleChange}
                    placeholder="Enter cities/areas where you provide services"
                    required
                  />
                </div>

                <div className="packages-form-group">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Enter years"
                    min="0"
                  />
                </div>

                <div className="packages-form-group">
                  <label>Hourly Rate (₹)</label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    placeholder="Enter hourly rate"
                    min="0"
                  />
                </div>

                <div className="packages-form-group packages-form-group-full">
                  <label>Languages Spoken *</label>
                  <div className="business-services-grid">
                    {['Hindi', 'English', 'Local Language', 'Other'].map(lang => (
                      <label key={lang} className="business-service-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={() => handleLanguageToggle(lang)}
                        />
                        <span>{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="packages-form-group packages-form-group-full">
                  <label>Specialties</label>
                  <div className="business-services-grid">
                    {['Historical Tours', 'Adventure Sports', 'Food Tours', 'Photography', 'Wildlife', 'Trekking', 'Cultural Experiences'].map(specialty => (
                      <label key={specialty} className="business-service-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.specialties.includes(specialty)}
                          onChange={() => handleSpecialtyToggle(specialty)}
                        />
                        <span>{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="packages-form-group packages-form-group-full">
                  <label>Availability</label>
                  <div className="business-services-grid">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <label key={day} className="business-service-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.availability.includes(day)}
                          onChange={() => handleAvailabilityToggle(day)}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <h2 className="business-form-section-title">Vehicle Information</h2>
              <div className="business-form-grid">
                <div className="packages-form-group packages-form-group-full">
                  <label className="business-checkbox-label">
                    <input
                      type="checkbox"
                      name="vehicleOwned"
                      checked={formData.vehicleOwned}
                      onChange={handleChange}
                    />
                    <span>Do you own a vehicle?</span>
                  </label>
                </div>

                {formData.vehicleOwned && (
                  <>
                    <div className="packages-form-group">
                      <label>Vehicle Type</label>
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                      >
                        <option value="">Select vehicle type</option>
                        <option value="car">Car</option>
                        <option value="bike">Bike</option>
                        <option value="scooter">Scooter</option>
                        <option value="suv">SUV</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="packages-form-group">
                      <label>Vehicle Number</label>
                      <input
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        placeholder="Enter vehicle number"
                      />
                    </div>

                    <div className="packages-form-group">
                      <label>License Number</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="Enter driving license number"
                      />
                    </div>
                  </>
                )}
              </div>

              <h2 className="business-form-section-title">Additional Information</h2>
              <div className="business-form-grid">
                <div className="packages-form-group packages-form-group-full">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about your guiding experience, specialties, and what makes you unique..."
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

