'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from '@/lib/config';

export default function MyRewardsPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchRewards();
  }, [router]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/user/rewards/active`);

      const result = await response.json();

      if (result.status && result.data) {
        setRewards(result.data);
      } else {
        setRewards([]);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDiscountText = (reward) => {
    if (reward.discountType === 'percentage') {
      return `${reward.discountValue}% off`;
    }
    return `₹${reward.discountValue} off`;
  };

  return (
    <div className="my-rewards-page">
      <div className="my-rewards-container">
        <div className="my-rewards-header">
          <h1 className="my-rewards-title">My Rewards</h1>
          <p className="my-rewards-subtitle">
            Use these reward codes at checkout to get discounts on your bookings.
          </p>
        </div>

        {loading ? (
          <div className="my-rewards-loading">
            <div className="my-rewards-spinner" />
          </div>
        ) : rewards.length === 0 ? (
          <div className="my-rewards-empty-card">
            <p className="my-rewards-empty-text">No active reward codes at the moment.</p>
            <p className="my-rewards-empty-hint">Check back later for new rewards!</p>
          </div>
        ) : (
          <div className="my-rewards-list">
            {rewards.map((reward) => (
              <div key={reward._id} className="my-rewards-card">
                <div className="my-rewards-card-inner">
                  <div className="my-rewards-card-body">
                    <div className="my-rewards-card-meta">
                      <span className="my-rewards-code">{reward.code}</span>
                      <span className="my-rewards-discount">{getDiscountText(reward)}</span>
                    </div>
                    <h3 className="my-rewards-card-title">{reward.title}</h3>
                    {reward.description && (
                      <p className="my-rewards-card-desc">{reward.description}</p>
                    )}
                    <div className="my-rewards-card-footer">
                      Valid till {formatDate(reward.validUntil)}
                      {reward.minBookingAmount > 0 && (
                        <span> • Min. booking ₹{reward.minBookingAmount}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
