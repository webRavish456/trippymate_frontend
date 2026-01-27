'use client';

import { useEffect, useState } from "react";
import AOS from "aos";
import { Skeleton } from "@mui/material";
import { API_BASE_URL } from '@/lib/config';
import 'aos/dist/aos.css';

export default function AdventurePage() {
  const [adventurePosts, setAdventurePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
      offset: 100
    });
    fetchAdventurePosts();
  }, []);

  const fetchAdventurePosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/user/adventure-post/all?page=${pageNum}&limit=20`);
      const data = await response.json();
      
      if (data.status && data.data) {
        if (pageNum === 1) {
          setAdventurePosts(data.data.adventurePosts || []);
        } else {
          setAdventurePosts(prev => [...prev, ...(data.data.adventurePosts || [])]);
        }
        setHasMore(data.data.pagination.page < data.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching adventure posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAdventurePosts(nextPage);
  };

  return (
    <div className="flex items-center justify-center bg-zinc-50 font-sans dark:bg-white" style={{ width: '100%', maxWidth: '100%' }}>
      <main className="flex w-full flex-col items-center bg-white dark:bg-white" style={{ width: '100%', maxWidth: '100%' }}>
        {/* Trippy Darshan Section */}
        <section className="trippy-darshan-section">
          <div className="trippy-darshan-container">
            {/* Header */}
            <div className="trippy-darshan-header">
              <h2 className="trippy-darshan-title" data-aos="fade-up">
                <span className="trippy-text">Trippy</span>
                <span className="darshan-text"> Darshan</span>
              </h2>
              <p className="trippy-darshan-subtitle" data-aos="fade-up" data-aos-delay="100">
                Real moments from our travellers across India — every picture tells a story of friendship and <span className="adventure-text">adventure</span>.
              </p>
              <div className="trippy-darshan-separator" data-aos="fade-up" data-aos-delay="200"></div>
            </div>

            {/* Image Grid */}
            {loading && adventurePosts.length === 0 ? (
              <div className="trippy-darshan-grid">
                {[...new Array(8)].reverse().map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    width="100%"
                    sx={{
                      aspectRatio: '1',
                      borderRadius: '16px',
                      bgcolor: '#e2e8f0',
                    }}
                    animation="wave"
                  />
                ))}
              </div>
            ) : adventurePosts.length > 0 ? (
              <>
                <div className="trippy-darshan-grid">
                  {[...adventurePosts].reverse().map((post, index) => (
                    <img
                      key={post._id || index}
                      src={post.image || '/trippy-darshan/trippy-darshan-1.png'}
                      alt={post.title || `Travel moment ${index + 1}`}
                      className="trippy-darshan-image"
                      data-aos="zoom-in"
                      data-aos-delay={(index % 4) * 100 + 100}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {!loading && hasMore && (
                  <div className="trippy-darshan-cta" style={{ marginTop: '3rem' }}>
                    <button
                      className="home-btn trippy-darshan-button"
                      onClick={loadMore}
                      type="button"
                      disabled={loading}
                    >
                      Load More Adventures
                    </button>
                  </div>
                )}

                {/* Loading More Indicator */}
                {loading && adventurePosts.length > 0 && (
                  <div className="trippy-darshan-grid" style={{ marginTop: '2rem' }}>
                    {[...new Array(4)].reverse().map((_, index) => (
                      <Skeleton
                        key={`loading-${index}`}
                        variant="rectangular"
                        width="100%"
                        sx={{
                          aspectRatio: '1',
                          borderRadius: '16px',
                          bgcolor: '#e2e8f0',
                        }}
                        animation="wave"
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="trippy-darshan-grid" style={{ 
                gridColumn: '1 / -1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3rem 2rem',
                minHeight: '400px'
              }}>
                <div style={{
                  maxWidth: '500px',
                  textAlign: 'center',
                  padding: '3rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '20px',
                  border: '2px dashed #d1d5db'
                }}>
                  <svg 
                    width="80" 
                    height="80" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ margin: '0 auto 1.5rem', display: 'block', opacity: 0.6 }}
                  >
                    <path 
                      d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" 
                      stroke="#6b7280" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-family-sans-serif)'
                  }}>
                    No Adventures Yet
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: 0,
                    fontFamily: 'var(--font-family-sans-serif)'
                  }}>
                    We're collecting amazing travel moments from our community. Check back soon for inspiring adventures!
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
