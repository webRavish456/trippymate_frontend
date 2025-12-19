'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Grid } from "@mui/material";
import { updateUser } from "@/store/actions/userActions";
import { API_BASE_URL } from '@/lib/config';

export default function MyProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user: reduxUser } = useSelector((state) => state.user);
  const user = reduxUser;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.status && result.data) {
        const userData = result.data;
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth || '',
          gender: userData.gender || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          pincode: userData.pincode || '',
        });
        
        // Update Redux store
        if (result.data.stats) {
          dispatch(updateUser({ ...userData, stats: result.data.stats }));
        }
      } else {
        // Fallback to Redux user data
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            dateOfBirth: user.dateOfBirth || '',
            gender: user.gender || '',
            address: user.address || '',
            city: user.city || '',
            state: user.state || '',
            pincode: user.pincode || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to Redux user data
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          dateOfBirth: user.dateOfBirth || '',
          gender: user.gender || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          pincode: user.pincode || '',
        });
      }
    }
  };

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

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (!formData.email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to update profile', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.status) {
        const updatedUser = { ...user, ...formData, ...result.data };
        dispatch(updateUser(updatedUser));
        setIsEditing(false);
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast(result.message || 'Failed to update profile. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    }
  };

  const getUserInitials = () => {
    if (formData.name) {
      return formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
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

      {/* Profile Header Section */}
      <div className="profile-page-header">
        <div className="profile-page-header-container">
          <h1 className="profile-page-title">My Profile</h1>
          <p className="profile-page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      <section className="packages-details-section">
        <div className="packages-details-container">
          <div className="profile-container">
            <Grid container spacing={3}>
          
              <Grid size={{xs: 12, md: 8}}>
                <div className="profile-header-card">
                  <div className="profile-avatar-section">
                    <div className="profile-avatar-large">
                      {user?.profilePicture || user?.picture ? (
                        <img 
                          src={user.profilePicture || user.picture} 
                          alt="Profile"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      {(!user?.profilePicture && !user?.picture) && (
                        <span>{getUserInitials()}</span>
                      )}
                    </div>
                    <button className="profile-upload-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                      Change Photo
                    </button>
                  </div>
                  <div className="profile-header-info">
                    <h2 className="profile-name">{formData.name || 'User Name'}</h2>
                    <p className="profile-email">{formData.email || 'user@example.com'}</p>
                    <div className="profile-stats">
                      <div className="profile-stat-item">
                        <span className="profile-stat-value">{user?.stats?.trips || 0}</span>
                        <span className="profile-stat-label">Trips</span>
                      </div>
                      <div className="profile-stat-item">
                        <span className="profile-stat-value">{user?.stats?.wishlist || 0}</span>
                        <span className="profile-stat-label">Wishlist</span>
                      </div>
                      <div className="profile-stat-item">
                        <span className="profile-stat-value">{user?.stats?.captainBookings || 0}</span>
                        <span className="profile-stat-label">Captain Bookings</span>
                      </div>
                      <div className="profile-stat-item">
                        <span className="profile-stat-value">{user?.stats?.reviews || 0}</span>
                        <span className="profile-stat-label">Reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
        

      

         
                <div className="packages-detail-card">
              <div className="profile-form-header">
                <h2 className="business-form-section-title">Personal Information</h2>
              </div>

              <form className="business-registration-form">
                <div className="business-form-grid">
                  <div className="packages-form-group">
                    <label>Full Name *</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />
                    ) : (
                      <div className="profile-readonly-field">{formData.name || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="packages-form-group">
                    <label>Email Address *</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    ) : (
                      <div className="profile-readonly-field">{formData.email || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="packages-form-group">
                    <label>Phone Number *</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        maxLength="10"
                        required
                      />
                    ) : (
                      <div className="profile-readonly-field">{formData.phone || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="packages-form-group">
                    <label>Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                    ) : (
                      <div className="profile-readonly-field">
                        {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="packages-form-group">
                    <label>Gender</label>
                    {isEditing ? (
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    ) : (
                      <div className="profile-readonly-field">
                        {formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <h2 className="business-form-section-title">Address Information</h2>
                <div className="business-form-grid">
                  <div className="packages-form-group packages-form-group-full">
                    <label>Address</label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your complete address"
                        rows={3}
                      />
                    ) : (
                      <div className="profile-readonly-field">{formData.address || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="packages-form-group">
                    <label>City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter your city"
                      />
                    ) : (
                      <div className="profile-readonly-field">{formData.city || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="packages-form-group">
                    <label>State</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter your state"
                      />
                    ) : (
                      <div className="profile-readonly-field">{formData.state || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="packages-form-group">
                    <label>Pincode</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="Enter pincode"
                        maxLength="6"
                      />
                    ) : (
                      <div className="profile-readonly-field">{formData.pincode || 'Not provided'}</div>
                    )}
                  </div>
                </div>

                </form>
                </div>

          
                <div className="packages-detail-card" style={{ marginTop: '1.5rem' }}>
                  <div className="profile-section-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#1a1a1a"/>
                    </svg>
                    <h2 className="business-form-section-title">My Reviews</h2>
                  </div>
                  <div className="reviews-subtitle">Reviews you've written</div>
                  <div className="reviews-empty-state">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#9ca3af" strokeWidth="1.5" fill="none"/>
                    </svg>
                    <h3 className="reviews-empty-title">No reviews yet</h3>
                    <p className="reviews-empty-text">Review products you've purchased</p>
                  </div>
                </div>
         
                </Grid>

        
              <Grid size={{xs: 12, md: 4}}>
                {/* Account Settings Card */}
                <div className="account-settings-wrapper">
                  <div className="account-settings-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="#6b7280"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.33 1.82l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#6b7280" strokeWidth="2" fill="none"/>
                    </svg>
                    <h2 className="account-settings-title business-form-section-title">Account Settings</h2>
                  </div>
                  <div className="account-settings-list">
                    <button className="account-setting-item" onClick={() => setIsEditing(true)}>
                      <span className="account-setting-text">Edit Profile</span>
                    </button>
                    <button className="account-setting-item">
                      <span className="account-setting-text">Change Password</span>
                    </button>
                    <div className="account-setting-divider"></div>
                    <button className="account-setting-item account-setting-delete">
                      <span className="account-setting-text account-setting-text-delete">Delete Account</span>
                    </button>
                  </div>
                </div>

                {/* Referral Stats Card */}
                <div className="packages-detail-card referral-stats-card" style={{ marginTop: '1.5rem' }}>
                  <div className="profile-section-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 5h4v2h-4V5zm8 14H6a1 1 0 0 1-1-1V9h14v9a1 1 0 0 1-1 1z" fill="white"/>
                      <path d="M12 11v6M9 14h6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                    <h2 className="business-form-section-title referral-stats-title">Referral Stats</h2>
                  </div>
                  <div className="referral-stats-content">
                    <div className="referral-stat-row">
                      <span className="referral-stat-label">Total Referred</span>
                      <span className="referral-stat-value">0</span>
                    </div>
                    <div className="referral-stat-row">
                      <span className="referral-stat-label">Active Referrals</span>
                      <span className="referral-stat-value">0</span>
                    </div>
                    <div className="referral-stat-row">
                      <span className="referral-stat-label">Points Earned</span>
                      <span className="referral-stat-value">0</span>
                    </div>
                    <button className="referral-friend-btn">
                      Refer a Friend
                    </button>
                  </div>
                </div>

                {/* Reward Points Card */}
                <div className="packages-detail-card" style={{ marginTop: '1.5rem' }}>
                  <div className="profile-section-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 5h4v2h-4V5zm8 14H6a1 1 0 0 1-1-1V9h14v9a1 1 0 0 1-1 1z" fill="#1a1a1a"/>
                      <path d="M12 11v6M9 14h6" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                    <h2 className="business-form-section-title">Reward Points</h2>
                  </div>
                  <div className="reward-points-content">
                    <div className="reward-points-display">
                      <div className="reward-points-value">0</div>
                      <div className="reward-points-label">Available Points</div>
                    </div>
                    <div className="reward-points-summary">
                      <div className="reward-points-row">
                        <span className="reward-points-label-small">Total Earned</span>
                        <span className="reward-points-value-small">0 points</span>
                      </div>
                      <div className="reward-points-row">
                        <span className="reward-points-label-small">Total Redeemed</span>
                        <span className="reward-points-value-small">0 points</span>
                      </div>
                    </div>
                    <button className="redeem-points-btn">
                      Redeem Points
                    </button>
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      </section>
    </div>
  );
}

