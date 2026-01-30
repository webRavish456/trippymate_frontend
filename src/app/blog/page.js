'use client';

import { useState, useEffect, Suspense } from "react";
import { Grid, Skeleton } from "@mui/material";
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { useRouter, useSearchParams } from 'next/navigation';
import 'swiper/css';
import 'swiper/css/navigation';

import { API_BASE_URL } from '@/lib/config';

function BlogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [blogPosts, setBlogPosts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFAQId, setExpandedFAQId] = useState(null);

  // Sync selected category with URL (e.g. on back/forward or direct link)
  useEffect(() => {
    setSelectedCategory(categoryFromUrl || 'all');
  }, [categoryFromUrl]);

  // Fetch data from API
  useEffect(() => {
    fetchBlogData();
  }, []);

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch main blog posts
      const mainPostsResponse = await fetch(`${API_BASE_URL}/api/user/blog/main-posts?limit=9`);
      const mainPostsData = await mainPostsResponse.json();
      if (mainPostsData.status) {
        setBlogPosts(mainPostsData.data || []);
      }

      // Fetch article posts
      const articlePostsResponse = await fetch(`${API_BASE_URL}/api/user/blog/article-posts?limit=9`);
      const articlePostsData = await articlePostsResponse.json();
      if (articlePostsData.status) {
        setArticles(articlePostsData.data || []);
      }

      // Fetch testimonials
      const testimonialsResponse = await fetch(`${API_BASE_URL}/api/user/blog/testimonials?limit=5`);
      const testimonialsData = await testimonialsResponse.json();
      if (testimonialsData.status) {
        setTestimonials(testimonialsData.data || []);
      }

      // Fetch categories
      const categoriesResponse = await fetch(`${API_BASE_URL}/api/user/blog/categories`);
      const categoriesData = await categoriesResponse.json();
      if (categoriesData.status) {
        setCategories(categoriesData.data || []);
      }

      // Fetch FAQs
      const faqsResponse = await fetch(`${API_BASE_URL}/api/user/faq/all`);
      const faqsData = await faqsResponse.json();
      if (faqsData.status) {
        setFaqs(faqsData.data || []);
      }
    } catch (err) {
      console.error('Error fetching blog data:', err);
      setError('Failed to load blog data');
      // Set default categories if API fails
      setCategories([
        { value: 'all', label: 'View all', count: 0 },
        { value: 'travel', label: 'Travel', count: 0 },
        { value: 'adventure', label: 'Adventure', count: 0 },
        { value: 'culture', label: 'Culture', count: 0 },
        { value: 'nature', label: 'Nature', count: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Static data for blog posts (top section - 9 cards) - Fallback
  const staticBlogPosts = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop',
      category: 'Travel',
      readTime: '5 min read',
      title: '10 Must-Visit Destinations in India for Adventure Seekers',
      description: 'Discover the most thrilling adventure destinations across India, from the snow-capped peaks of Leh Ladakh to the pristine beaches of Andaman.'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800&h=600&fit=crop',
      category: 'Culture',
      readTime: '7 min read',
      title: 'Exploring the Rich Heritage of Rajasthan',
      description: 'Immerse yourself in the royal history and vibrant culture of Rajasthan, from majestic palaces to colorful festivals.'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      category: 'Nature',
      readTime: '6 min read',
      title: 'Best Hill Stations for a Perfect Summer Getaway',
      description: 'Escape the heat and explore the serene beauty of India\'s most beautiful hill stations nestled in the mountains.'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
      category: 'Adventure',
      readTime: '8 min read',
      title: 'Complete Guide to Trekking in the Himalayas',
      description: 'Everything you need to know about planning your first Himalayan trek, from gear to permits and safety tips.'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop',
      category: 'Beach',
      readTime: '5 min read',
      title: 'Top Beach Destinations for Your Next Vacation',
      description: 'From Goa to Kerala, discover the most beautiful beaches in India perfect for relaxation and water sports.'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
      category: 'Wildlife',
      readTime: '6 min read',
      title: 'Wildlife Safari Guide: Best National Parks in India',
      description: 'Experience the incredible biodiversity of India through these amazing wildlife sanctuaries and national parks.'
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      category: 'Travel',
      readTime: '6 min read',
      title: 'Spiritual Journey: Top Temples and Religious Sites in India',
      description: 'Embark on a spiritual journey through India\'s most sacred temples and religious destinations that offer peace and enlightenment.'
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1580619305218-8423a3d6d3f3?w=800&h=600&fit=crop',
      category: 'Nature',
      readTime: '7 min read',
      title: 'Kerala Backwaters: A Serene Escape into Nature',
      description: 'Experience the tranquil beauty of Kerala\'s backwaters, where nature meets culture in the most peaceful way possible.'
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      category: 'Adventure',
      readTime: '5 min read',
      title: 'Water Sports and Adventure Activities in Goa',
      description: 'Dive into the thrilling world of water sports and adventure activities that make Goa a paradise for adrenaline junkies.'
    }
  ];

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Use data from API or fallback to empty arrays
  const displayBlogPosts = blogPosts.length > 0 ? blogPosts : [];
  const displayArticles = articles.length > 0 ? articles : [];
  const displayTestimonials = testimonials.length > 0 ? testimonials : [];
  const displayFAQs = faqs.length > 0 ? faqs : [];
  const displayCategories = categories.length > 0 ? categories : [
    { value: 'all', label: 'View all', count: 0 }
  ];

  // Filter blog posts by selected category (case-insensitive)
  const filteredBlogPosts =
    selectedCategory === 'all'
      ? displayBlogPosts
      : displayBlogPosts.filter((post) => {
          const postCategory = (post.category || '').toString().toLowerCase();
          const selected = (selectedCategory || '').toString().toLowerCase();
          return postCategory === selected;
        });

  const toggleFAQ = (id) => {
    setExpandedFAQId(expandedFAQId === id ? null : id);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <section>
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '3rem'
        }}>
          {/* Background Image with Gradient Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }} />
          
          {/* Gradient Overlay for better text readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(29, 78, 216, 0.4) 0%, rgba(30, 64, 175, 0.3) 50%, rgba(124, 58, 237, 0.2) 100%)',
            zIndex: 1
          }} />
          
          {/* Decorative Bottom Border */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'white',
            clipPath: 'polygon(0 60%, 5% 50%, 10% 55%, 15% 45%, 20% 50%, 25% 40%, 30% 45%, 35% 35%, 40% 40%, 45% 30%, 50% 35%, 55% 25%, 60% 30%, 65% 20%, 70% 25%, 75% 15%, 80% 20%, 85% 10%, 90% 15%, 95% 5%, 100% 10%, 100% 100%, 0 100%)',
            zIndex: 2
          }} />
          
          <div style={{ 
            position: 'relative', 
            zIndex: 2, 
            maxWidth: '900px',
            textAlign: 'center',
            padding: '0 2rem'
          }}>
            <h1 style={{ 
              fontSize: '5rem', 
              fontWeight: '800', 
              marginBottom: '1.5rem',
              textShadow: '0 4px 20px rgba(0,0,0,0.4)',
              letterSpacing: '-2px',
              lineHeight: '1.1',
              color: 'white'
            }}>
              TRAVEL BLOG
            </h1>
            <p style={{ 
              fontSize: '1.75rem', 
              color: 'white',
              maxWidth: '700px',
              margin: '0 auto 1.5rem auto',
              letterSpacing: '3px',
              lineHeight: '1.6',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              fontWeight: '300'
            }}>
              Explore . Experience . Share
            </p>
            <p style={{ 
              fontSize: '1.125rem', 
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.8',
              textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              fontWeight: '400'
            }}>
              Discover amazing destinations, travel tips, and inspiring stories from adventurers around the world. Your journey to unforgettable experiences starts here.
            </p>
          </div>
        </div>
      </section>

      {/* Category Chips - Only show if there are blog posts */}
      {!loading && displayBlogPosts.length > 0 && (
        <section style={{ padding: '0 6rem 3rem 6rem' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
          justifyContent: 'center',
            width: '100%',
          }}>

            {/* Category Bar */}
            <div
              id="category-scroll-container"
              style={{ 
                display: 'flex', 
                gap: '0',
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                backgroundColor: '#1D4ED8',
                borderRadius: '50px',
                padding: '0.5rem',
                boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)',
                width: 'fit-content',
                maxWidth: '100%'
              }}
            >
            {displayCategories.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              
              return (
                <div
                  key={cat.value}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCategory(cat.value);
                    const params = new URLSearchParams(searchParams.toString());
                    if (cat.value === 'all') {
                      params.delete('category');
                    } else {
                      params.set('category', cat.value);
                    }
                    const newUrl = `/blog?${params.toString()}`;
                    window.history.pushState({ ...window.history.state }, '', newUrl);
                  }}
                  style={{
                    background: isSelected ? 'white' : 'transparent',
                    color: isSelected ? '#1D4ED8' : 'white',
                    padding: '0.875rem 1.75rem',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span>{cat.label}</span>
                </div>
              );
            })}
          </div>

          </div>
        </section>
      )}

      {/* Top Blog Posts Section */}
      <section id="blog-posts-section" style={{ padding: '0 6rem 4rem 6rem' }}>
        {loading && (
          <Grid container spacing={4}>
            {[...new Array(9)].map((_, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={idx}>
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  minHeight: '500px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'white'
                }}>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={250}
                    sx={{
                      bgcolor: '#e2e8f0',
                    }}
                    animation="wave"
                  />
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="text" width="100%" height={32} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5, bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1.5, bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="text" width="40%" height={20} sx={{ mt: 'auto', bgcolor: '#e2e8f0' }} animation="wave" />
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && filteredBlogPosts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#1e293b',
              margin: 0
            }}>
              {selectedCategory !== 'all'
                ? `No blog posts in this category yet.`
                : 'No blog posts available yet.'}
            </p>
          </div>
        )}
        {!loading && !error && filteredBlogPosts.length > 0 && (
          <Grid container spacing={4}>
            {filteredBlogPosts.map((post) => (
            <Grid size={{ xs: 12, md: 4 }} key={post._id || post.id}>
              <Link href={`/blog/${post._id || post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minHeight: '500px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                }}
                >
                  {/* Background Image */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                    minHeight: '500px'
                  }}>
                    <img 
                      src={post.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'} 
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        minHeight: '500px',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  </div>
                  
                  {/* Category and Read Time Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    right: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 2
                  }}>
                    <span style={{
                      backgroundColor: '#1D4ED8',
                      color: 'white',
                      padding: '0.375rem 1rem',
                      borderRadius: '50px',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      textTransform: 'uppercase'
                    }}>
                      {post.category || 'Travel'}
                    </span>
                    <span style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(8px)',
                      color: 'white',
                      padding: '0.375rem 1rem',
                      borderRadius: '50px',
                      fontSize: '0.8125rem',
                      fontWeight: '500'
                    }}>
                      {post.readTime || '5 min read'}
                    </span>
                  </div>

                  {/* Content Section - White Background */}
                  <div style={{ 
                    padding: '1.5rem',
                    backgroundColor: 'white',
                    borderRadius: '36px 36px 0px 0px',
                    marginTop: 'auto',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#0f172a',
                      marginBottom: '1rem',
                      lineHeight: '1.3'
                    }}>
                      {post.title}
                    </h3>
                    <p style={{
                      fontSize: '1rem',
                      color: '#64748b',
                      lineHeight: '1.6',
                      marginBottom: '1.5rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {post.description || post.content?.substring(0, 150) + '...' || ''}
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center'
                    }}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/blog/${post._id || post.id}`;
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1D4ED8',
                          fontSize: '0.9375rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: 0,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#1e40af';
                          e.currentTarget.style.gap = '0.75rem';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#1D4ED8';
                          e.currentTarget.style.gap = '0.5rem';
                        }}
                      >
                        Read more
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </Grid>
          ))}
        </Grid>
        )}
      </section>

      {/* Articles Section - Middle 9 Cards */}
      <section style={{ padding: '80px 6rem', backgroundColor: '#f8fafc' }}>
        {loading && (
          <Grid container spacing={3}>
            {[...new Array(9)].map((_, idx) => (
              <Grid size={{xs:12, sm:6, md:4}} key={idx}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  height: '100%'
                }}>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={200}
                    sx={{
                      bgcolor: '#e2e8f0',
                    }}
                    animation="wave"
                  />
                  <div style={{ padding: '1.5rem' }}>
                    <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="text" width="100%" height={28} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5, bgcolor: '#e2e8f0' }} animation="wave" />
                    <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        )}
        {!loading && displayArticles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#1e293b',
              margin: 0
            }}>
              No articles available yet.
            </p>
          </div>
        )}
        {!loading && displayArticles.length > 0 && (
          <Grid container spacing={3}>
            {displayArticles.map((article) => (
            <Grid size={{xs:12, sm:6, md:4}} key={article._id || article.id}>
              <Link href={`/blog/${article._id || article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  border: '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  e.currentTarget.style.borderColor = '#1D4ED8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
                >
                {/* Article Image */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <img 
                    src={article.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'} 
                    alt={article.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>

                {/* Article Content */}
                <div style={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  {/* Title */}
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                    color: '#1e293b',
                    marginBottom: '0.75rem',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {article.title}
                  </h4>

                  {/* Author and Date */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <img 
                      src={article.authorImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'} 
                      alt={article.author || 'Author'}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        color: '#1e293b'
                      }}>
                        {article.author || 'Anonymous'}
                      </div>
                      <div style={{ 
                        fontSize: '0.8125rem', 
                        color: '#64748b' 
                      }}>
                        {formatDate(article.publishedDate) || formatDate(article.date) || 'Recent'}
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </Link>
            </Grid>
          ))}
        </Grid>
        )}
      </section>

      {/* Testimonials Section - Carousel */}
      <section style={{ 
        padding: '80px 6rem 0 6rem', 
        background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.05) 0%, rgba(30, 64, 175, 0.05) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Bubbles */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.1) 0%, rgba(30, 64, 175, 0.1) 100%)',
          filter: 'blur(60px)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.08) 0%, rgba(30, 64, 175, 0.08) 100%)',
          filter: 'blur(80px)',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            color: '#1D4ED8',
            textAlign: 'center',
           
          }}>
            What everyone says
          </h2>

          <div style={{ position: 'relative', padding: '0 3rem 4rem 3rem' }}>
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              navigation={displayTestimonials.length > 3 ? {
                nextEl: '.swiper-button-next-testimonial',
                prevEl: '.swiper-button-prev-testimonial',
              } : false}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
            loop={true}
            style={{ paddingBottom: '3rem', paddingTop: '3rem', height: 'auto' }}
          >
            {loading && (
              <>
                {[...new Array(3)].map((_, idx) => (
                  <SwiperSlide key={idx} style={{ height: 'auto', display: 'flex', alignItems: 'stretch' }}>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '28px',
                      padding: '2.75rem',
                      minHeight: '300px',
                      height: '100%',
                      width: '100%',
                      marginTop: '3rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-50px', marginBottom: '1.5rem' }}>
                        <Skeleton variant="circular" width={100} height={100} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                      </div>
                      <Skeleton variant="text" width="80%" height={24} sx={{ mx: 'auto', mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                      <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5, bgcolor: '#e2e8f0' }} animation="wave" />
                      <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                      <Skeleton variant="text" width="60%" height={20} sx={{ mx: 'auto', bgcolor: '#e2e8f0' }} animation="wave" />
                    </div>
                  </SwiperSlide>
                ))}
              </>
            )}
            {displayTestimonials.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#1e293b',
                  margin: 0
                }}>
                  No testimonials available yet.
                </p>
              </div>
            )}
            {!loading && displayTestimonials.map((testimonial) => (
                <SwiperSlide key={testimonial.id || testimonial._id} style={{ height: 'auto', display: 'flex', alignItems: 'stretch' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                    borderRadius: '28px',
                    padding: '2.75rem',
                    boxShadow: '0 8px 32px rgba(29, 78, 216, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',
                    minHeight: '300px',
                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                    position: 'relative',
                    overflow: 'visible',
                    marginTop: '3rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-12px) scale(1.02) rotate(2deg)';
                    e.currentTarget.style.boxShadow = '0 20px 48px rgba(29, 78, 216, 0.2), 0 4px 16px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1) rotate(0deg)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(29, 78, 216, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  }}
                  >

                    {/* Single Star with Rating - Right Top Corner */}
                    <div style={{
                      position: 'absolute',
                      top: '1.5rem',
                      right: '1.5rem',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '1.125rem',
                        fontWeight: '800',
                        color: '#1e293b',
                        letterSpacing: '-0.3px'
                      }}>
                        {testimonial.rating || 5}
                      </span>
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="#fbbf24" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ 
                          filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.4))'
                        }}
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24"/>
                      </svg>
                    </div>

                    {/* Avatar - Half above, half below */}
                    <div style={{
                      position: 'absolute',
                      top: '-50px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '4px solid rgba(255, 255, 255, 0.6)',
                      boxShadow: '0 8px 24px rgba(29, 78, 216, 0.25)',
                      zIndex: 10,
                      backgroundColor: 'white',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(29, 78, 216, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(29, 78, 216, 0.25)';
                    }}
                    >
                      <img 
                        src={testimonial.authorImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'} 
                        alt={testimonial.author || 'User'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>

                    <div style={{ position: 'relative', zIndex: 1, marginTop: '3rem' }}>
                      {/* Title */}
                      <h3 style={{ 
                        fontSize: '1.500rem', 
                        fontWeight: '800', 
                        color: '#0f172a',
                        lineHeight: '1.25',
                        marginBottom: '1.5rem',
                      }}>
                        {testimonial.title}
                      </h3>

                      {/* Description */}
                      <p style={{ 
                        fontSize: '1.0625rem',
                        color: '#475569',
                        lineHeight: '1.75',
                        marginBottom: '1.5rem',
                        flex: 1,
                        fontWeight: '400',
                        marginTop: '0'
                      }}>
                        "{testimonial.description}"
                      </p>
                    </div>

                    {/* Author Info - Centered */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      marginTop: 'auto',
                      borderTop: '1.5px solid rgba(255, 255, 255, 0.3)',
                      position: 'relative',
                      zIndex: 1,
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '800', 
                        color: '#0f172a',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.3px'
                      }}>
                        {testimonial.author}
                      </div>
                      <div style={{ 
                        fontSize: '0.9375rem', 
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontWeight: '500'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.7 }}>
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                        </svg>
                        {testimonial.location || 'India'}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

          {/* Custom Navigation Buttons - Only show if more than 3 testimonials */}
          {displayTestimonials.length > 3 && (
            <>
              <button 
                className="swiper-button-prev-testimonial"
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: '2px solid #1D4ED8',
                  color: '#1D4ED8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#1D4ED8';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className="swiper-button-next-testimonial"
                style={{
                  position: 'absolute',
                  right: '0',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: '2px solid #1D4ED8',
                  color: '#1D4ED8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#1D4ED8';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}
        </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ 
        padding: '80px 6rem 4rem 6rem', 
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            color: '#1D4ED8',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Frequently Asked Questions
          </h2>

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...new Array(5)].map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '2px solid #e5e7eb',
                    padding: '1.5rem'
                  }}
                >
                  <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1, bgcolor: '#e2e8f0' }} animation="wave" />
                  <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5, bgcolor: '#e2e8f0' }} animation="wave" />
                  <Skeleton variant="text" width="90%" height={20} sx={{ bgcolor: '#e2e8f0' }} animation="wave" />
                </div>
              ))}
            </div>
          )}
          {displayFAQs.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1e293b',
                margin: 0
              }}>
                No FAQs available yet.
              </p>
            </div>
          )}

          {!loading && displayFAQs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {displayFAQs.map((faq) => (
                <div
                  key={faq._id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '2px solid',
                    borderColor: expandedFAQId === faq._id ? '#1D4ED8' : '#e5e7eb',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: expandedFAQId === faq._id 
                      ? '0 8px 24px rgba(29, 78, 216, 0.15)' 
                      : '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={(e) => {
                    if (expandedFAQId !== faq._id) {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = '#1D4ED8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (expandedFAQId !== faq._id) {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <button
                    onClick={() => toggleFAQ(faq._id)}
                    style={{
                      width: '100%',
                      padding: '1.5rem 2rem',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#1e293b',
                      margin: 0,
                      flex: 1,
                      lineHeight: '1.4'
                    }}>
                      {faq.question}
                    </h3>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1D4ED8"
                      strokeWidth="2.5"
                      style={{
                        transform: expandedFAQId === faq._id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        flexShrink: 0
                      }}
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {expandedFAQId === faq._id && (
                    <div style={{
                      padding: '0 2rem 1.5rem 2rem',
                      borderTop: '1px solid #e5e7eb',
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      <p style={{
                        fontSize: '1.0625rem',
                        color: '#64748b',
                        lineHeight: '1.8',
                        margin: '1rem 0 0 0'
                      }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    }>
      <BlogPageContent />
    </Suspense>
  );
}

