'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Grid } from '@mui/material';
import { API_BASE_URL } from '@/lib/config';

const DEFAULT_REVIEWS = [
  { userName: 'Priya Sharma', rating: 5, comment: 'Amazing experience! The place was beautiful and the trip was well organized. Highly recommend this destination for a peaceful getaway.', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { userName: 'Rahul Kumar', rating: 4, comment: 'Great destination with stunning views. The accommodations were comfortable and the local food was delicious. Would visit again!', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { userName: 'Anjali Patel', rating: 5, comment: 'Perfect for solo travelers! Felt safe throughout the trip. The guides were knowledgeable and friendly. Made some great memories here.', date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() },
  { userName: 'Vikram Singh', rating: 4, comment: 'Beautiful location with rich culture. The activities were engaging and the overall experience was memorable. Worth every penny!', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
];

const isCompositeId = (id) => {
  const idParts = String(id).split('-');
  return idParts.length >= 2 && idParts[0].length === 24;
};

const parseCompositeId = (id) => {
  const idParts = String(id).split('-');
  const parentId = idParts[0];
  const lastPart = idParts[idParts.length - 1];
  const isLastPartIndex = /^\d+$/.test(lastPart);
  const placeNameRaw = isLastPartIndex ? idParts.slice(1, -1).join('-') : idParts.slice(1).join('-');
  const placeName = decodeURIComponent(placeNameRaw);
  return { parentId, placeName };
};

const findPlaceInDetails = (placesDetails, placeName) => {
  if (!Array.isArray(placesDetails)) return null;
  const searchName = placeName.trim().toLowerCase();
  return placesDetails.find((p) => {
    if (!p?.placeName) return false;
    const pName = p.placeName.trim().toLowerCase();
    if (pName === searchName) return true;
    const normalizedPName = pName.replace(/[-\s]+/g, ' ').trim();
    const normalizedSearchName = searchName.replace(/[-\s]+/g, ' ').trim();
    return normalizedPName === normalizedSearchName;
  });
};

const transformPlaceToDestination = (place, parent, destinationId) => ({
  _id: place._id || destinationId,
  id: place._id || destinationId,
  name: place.placeName,
  reviews: (place.reviews && place.reviews.length > 0) ? place.reviews : DEFAULT_REVIEWS,
});

const addDefaultReviews = (d) => {
  if (!d.reviews || d.reviews.length === 0) d.reviews = DEFAULT_REVIEWS;
  return d;
};

function formatReviewTime(dateIso) {
  if (!dateIso) return 'Recently';
  const reviewDate = new Date(dateIso);
  const now = new Date();
  const monthsDiff = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24 * 30));
  if (monthsDiff < 1) return 'Recently';
  if (monthsDiff === 1) return '1 month ago';
  return `${monthsDiff} months ago`;
}

export default function CustomerReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const destinationId = params.id;

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && selectedReview) setSelectedReview(null);
    };
    globalThis.addEventListener('keydown', onKeyDown);
    return () => globalThis.removeEventListener('keydown', onKeyDown);
  }, [selectedReview]);

  useEffect(() => {
    const fetchDestination = async () => {
      if (!destinationId) return;
      setLoading(true);
      try {
        if (isCompositeId(destinationId)) {
          const { parentId, placeName } = parseCompositeId(destinationId);
          const parentRes = await fetch(`${API_BASE_URL}/api/admin/destination/${parentId}`);
          const parentData = await parentRes.json();
          if (parentData.status && parentData.data?.placesDetails) {
            const place = findPlaceInDetails(parentData.data.placesDetails, placeName);
            if (place) {
              setDestination(transformPlaceToDestination(place, parentData.data, destinationId));
              setLoading(false);
              return;
            }
          }
        }
        const res = await fetch(`${API_BASE_URL}/api/admin/destination/${destinationId}`.replace(/\?+$/, ''));
        const data = await res.json();
        if (data.status && data.data) setDestination(addDefaultReviews(data.data));
      } catch (e) {
        console.error('Error fetching destination:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDestination();
  }, [destinationId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="destination-details-loading">
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="destination-details-error">
          <p>Destination not found</p>
          <button type="button" onClick={() => router.push('/explore-destination')}>Go Back</button>
        </div>
      </div>
    );
  }

  const reviews = destination.reviews || [];
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;
  const maxCount = Math.max(...[5, 4, 3, 2, 1].map((r) => reviews.filter((rev) => Math.round(rev.rating || 0) === r).length), 1);

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-white" style={{ width: '100%', maxWidth: '100%' }}>
      <main className="flex w-full flex-col items-center bg-white dark:bg-white" style={{ width: '100%', maxWidth: '100%' }}>
        <div className="destination-details-content" style={{ width: '100%', paddingTop: '4rem' }}>
          <section className="destination-details-section customer-reviews-page-section" style={{ paddingInline: '6rem' }}>
            <div className="destination-reviews-header customer-reviews-page-header">
              <div className="customer-reviews-page-title-wrap">
                <h1 className="destination-details-section-title">Customer Reviews</h1>
                <div className="customer-reviews-page-divider" />
              </div>
              <Link href={`/explore-destination/${destinationId}`} className="destination-reviews-view-all">
                Back to {destination.name}
              </Link>
            </div>
            <div className="destination-reviews-container">
              {reviews.length > 0 ? (
                <>
                  <Grid container spacing={{ xs: 3, md: 4 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <div className="destination-reviews-summary">
                        <div className="destination-reviews-average">
                          <div className="destination-reviews-average-rating">{avgRating.toFixed(1)}</div>
                          <div className="destination-reviews-average-stars">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const filled = star <= Math.floor(avgRating);
                              const halfFilled = star === Math.ceil(avgRating) && avgRating % 1 >= 0.3 && avgRating % 1 < 0.8;
                              return (
                                <svg key={star} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                    fill={filled || halfFilled ? '#22c55e' : '#e5e7eb'}
                                    stroke={filled || halfFilled ? '#22c55e' : '#e5e7eb'}
                                    strokeWidth="1"
                                    opacity={halfFilled ? '0.5' : '1'}
                                  />
                                </svg>
                              );
                            })}
                          </div>
                        </div>
                        <div className="destination-reviews-distribution">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = reviews.filter((r) => Math.round(r.rating || 0) === rating).length;
                            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
                            return (
                              <div key={rating} className="destination-reviews-distribution-item">
                                <span className="destination-reviews-distribution-rating">{rating} star</span>
                                <div className="destination-reviews-distribution-bar-wrapper">
                                  <div
                                    className="destination-reviews-distribution-bar"
                                    style={{
                                      width: `${barWidth}%`,
                                      backgroundColor: rating >= 4 ? '#22c55e' : rating >= 3 ? '#f59e0b' : '#ef4444',
                                    }}
                                  />
                                </div>
                                <span className="destination-reviews-distribution-count">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Grid>
                  </Grid>

                  <Grid container spacing={{ xs: 3, md: 4 }} className="destination-reviews-list-desktop destination-reviews-list-all">
                    {reviews.map((review, index) => (
                      <Grid key={index} size={{ xs: 12, md: 6 }}>
                        <div className="destination-review-card">
                          <div className="destination-review-card-header">
                            <h3 className="destination-review-title">
                              {review.comment?.substring(0, 60) || 'Customer review'}
                              {(review.comment?.length || 0) > 60 ? '...' : ''}
                            </h3>
                            <div className="destination-review-rating-badge">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" />
                              </svg>
                              <span>{review.rating ?? 4.5}</span>
                            </div>
                          </div>
                          <p className="destination-review-text">
                            {review.comment || 'No review text.'}
                            <button type="button" className="destination-review-read-more" onClick={() => setSelectedReview(review)}>
                              ....Read more
                            </button>
                          </p>
                          <div className="destination-review-images">
                            {[1, 2, 3, 4, 5].map((img) => (
                              <div key={img} className="destination-review-image">
                                <img
                                  src="https://images.unsplash.com/photo-1556912172-45b7abe8b7c4?w=100&h=100&fit=crop&q=80"
                                  alt={`Review ${index + 1} image ${img}`}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="destination-review-footer">
                            <span className="destination-review-time">{formatReviewTime(review.date)}</span>
                            <span className="destination-review-separator">–</span>
                            <span className="destination-review-author">{review.userName || 'Guest'}</span>
                            <span className="destination-review-location">(Bhubaneswar)</span>
                          </div>
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                </>
              ) : (
                <div className="destination-reviews-empty">
                  <p>No reviews yet. Be the first to review this destination!</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {selectedReview && (
        <div
          className="review-popup-overlay"
          onClick={(e) => e.target === e.currentTarget && setSelectedReview(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-popup-title"
        >
          <div className="review-popup">
            <button type="button" className="review-popup-close" onClick={() => setSelectedReview(null)} aria-label="Close review">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="review-popup-header">
              <h2 id="review-popup-title" className="review-popup-title">
                {selectedReview.comment?.substring(0, 60) || 'Customer review'}
                {(selectedReview.comment?.length || 0) > 60 ? '...' : ''}
              </h2>
              <div className="review-popup-rating">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" />
                </svg>
                <span>{selectedReview.rating ?? 4.5}</span>
              </div>
            </div>
            <p className="review-popup-text">
              {selectedReview.comment || 'No review text.'}
            </p>
            <div className="review-popup-images">
              {[1, 2, 3, 4, 5].map((img) => (
                <div key={img} className="review-popup-image">
                  <img src="https://images.unsplash.com/photo-1556912172-45b7abe8b7c4?w=100&h=100&fit=crop&q=80" alt={`Review image ${img}`} />
                </div>
              ))}
            </div>
            <div className="review-popup-footer">
              <span className="review-popup-time">{formatReviewTime(selectedReview.date)}</span>
              <span className="review-popup-sep">–</span>
              <span className="review-popup-author">{selectedReview.userName || 'Guest'}</span>
              <span className="review-popup-location">(Bhubaneswar)</span>
            </div>
            <button type="button" className="review-popup-close-btn" onClick={() => setSelectedReview(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
