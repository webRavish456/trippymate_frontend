'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { API_BASE_URL } from '@/lib/config';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params.id;
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [shares, setShares] = useState(0);
  const [views, setViews] = useState(0);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blog data from API
  useEffect(() => {
    if (blogId) {
      fetchBlogData();
    }
  }, [blogId]);

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/user/blog/${blogId}`);
      const data = await response.json();
      
      if (data.status && data.data) {
        setBlog(data.data);
        setLikes(data.data.likes || 0);
        setShares(data.data.shares || 0);
        setViews(data.data.views || 0);
      } else {
        setError(data.message || 'Blog not found');
      }
    } catch (err) {
      console.error('Error fetching blog:', err);
      setError('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Static blog data - Fallback (not used if API works)
  const staticBlogData = {
    1: {
      id: 1,
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&h=600&fit=crop',
      category: 'Travel',
      readTime: '5 min read',
      title: '10 Must-Visit Destinations in India for Adventure Seekers',
      description: 'Discover the most thrilling adventure destinations across India, from the snow-capped peaks of Leh Ladakh to the pristine beaches of Andaman.',
      author: 'Sarah Johnson',
      authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      date: 'Jan 24, 2024',
      tags: ['Adventure', 'Travel Tips', 'India', 'Mountains'],
      views: 1250,
      likes: 89,
      shares: 23,
      content: `
        <p>India is a land of diverse landscapes and incredible adventures waiting to be explored. From the majestic Himalayas in the north to the pristine beaches in the south, adventure seekers have countless options to choose from.</p>
        
        <h2>1. Leh Ladakh - The Ultimate Adventure Destination</h2>
        <p>Leh Ladakh offers some of the most breathtaking landscapes in the world. With its high-altitude passes, crystal-clear lakes, and ancient monasteries, it's a paradise for adventure enthusiasts. Whether you're into trekking, biking, or simply exploring, Ladakh has something for everyone.</p>
        
        <h2>2. Andaman and Nicobar Islands</h2>
        <p>The Andaman Islands are perfect for water sports enthusiasts. From scuba diving to snorkeling, the clear blue waters offer incredible marine life experiences. The pristine beaches and untouched coral reefs make it a must-visit destination.</p>
        
        <h2>3. Rishikesh - The Yoga and Adventure Capital</h2>
        <p>Known as the gateway to the Himalayas, Rishikesh is famous for white water rafting, bungee jumping, and yoga retreats. The Ganges River flowing through the town adds to its spiritual and adventurous charm.</p>
        
        <h2>4. Spiti Valley - The Cold Desert</h2>
        <p>Spiti Valley is one of the most remote and beautiful places in India. With its stark landscapes, ancient monasteries, and challenging roads, it's perfect for those seeking an offbeat adventure.</p>
        
        <h2>5. Goa - Beyond the Beaches</h2>
        <p>While Goa is famous for its beaches, it also offers water sports, trekking in the Western Ghats, and exploring Portuguese heritage. The state has a unique blend of relaxation and adventure.</p>
      `
    },
    2: {
      id: 2,
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=1200&h=600&fit=crop',
      category: 'Culture',
      readTime: '7 min read',
      title: 'Exploring the Rich Heritage of Rajasthan',
      description: 'Immerse yourself in the royal history and vibrant culture of Rajasthan, from majestic palaces to colorful festivals.',
      author: 'Rajesh Kumar',
      authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      date: 'Jan 22, 2024',
      tags: ['Culture', 'Heritage', 'Rajasthan', 'History'],
      views: 2100,
      likes: 156,
      shares: 42,
      content: `
        <p>Rajasthan, the Land of Kings, is a treasure trove of history, culture, and architectural marvels. From the golden sands of Jaisalmer to the pink city of Jaipur, every corner tells a story of royal grandeur.</p>
        
        <h2>The Majestic Palaces</h2>
        <p>Rajasthan is home to some of the most magnificent palaces in the world. The City Palace in Udaipur, the Hawa Mahal in Jaipur, and the Mehrangarh Fort in Jodhpur are architectural masterpieces that showcase the opulence of the Rajput era.</p>
        
        <h2>Vibrant Festivals</h2>
        <p>The state is known for its colorful festivals like Pushkar Fair, Desert Festival, and Teej. These festivals offer a glimpse into the rich cultural heritage and traditions of Rajasthan.</p>
      `
    }
  };

  // Use blog from API or fallback
  const displayBlog = blog || null;

  // If no blog data, show loading or error
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading blog...</p>
      </div>
    );
  }

  if (error || !displayBlog) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error || 'Blog not found'}</p>
        <Link href="/blog" style={{ color: '#1D4ED8', textDecoration: 'underline' }}>Back to Blog</Link>
      </div>
    );
  }

  const handleLike = async () => {
    const action = isLiked ? 'unlike' : 'like';
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/blog/${blogId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (data.status) {
        setLikes(data.data.likes);
        setIsLiked(!isLiked);
      }
    } catch (err) {
      console.error('Error updating like:', err);
      // Update locally even if API fails
      if (isLiked) {
        setLikes(prev => prev - 1);
      } else {
        setLikes(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    }
  };

  const handleShare = async (platform) => {
    // Update share count via API
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/blog/${blogId}/share`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.status) {
        setShares(data.data.shares);
      }
    } catch (err) {
      console.error('Error updating share:', err);
      setShares(prev => prev + 1);
    }

    const url = window.location.href;
    const title = displayBlog.title;
    const text = displayBlog.description || displayBlog.content?.substring(0, 150);

    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: title,
            text: text,
            url: url
          });
        } else {
          navigator.clipboard.writeText(url);
          alert('Link copied to clipboard!');
        }
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Hero Image Section */}
      <div 
        className="blog-hero-section"
        style={{
          position: 'relative',
          width: '100%',
          height: '500px',
          overflow: 'hidden'
        }}
      >
        <img 
          src={displayBlog.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop'} 
          alt={displayBlog.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)'
        }} />
      </div>

      {/* Content Section */}
      <article style={{ maxWidth: '100%', margin: '0 auto', padding: '80px 6rem' }}>
        {/* Category and Read Time */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <span style={{
            backgroundColor: '#1D4ED8',
            color: 'white',
            padding: '0.5rem 1.25rem',
            borderRadius: '50px',
            fontSize: '0.875rem',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>
            {displayBlog.category || 'Travel'}
          </span>
          <span style={{
            fontSize: '1rem',
            color: '#64748b',
            fontWeight: '500'
          }}>
            {displayBlog.readTime || '5 min read'}
          </span>
        </div>

        {/* Title and Share Icons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          gap: '2rem'
        }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            color: '#0f172a',
            lineHeight: '1.2',
            letterSpacing: '-1px',
            flex: 1,
            margin: 0
          }}>
            {displayBlog.title}
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexShrink: 0
          }}>
            {/* Share Icon */}
            <button
              onClick={() => handleShare('native')}
              style={{
                padding: '0.75rem',
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                width: '44px',
                height: '44px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#1D4ED8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
            </button>
            {/* WhatsApp Icon */}
            <button
              onClick={() => handleShare('whatsapp')}
              style={{
                padding: '0.75rem',
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                width: '44px',
                height: '44px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#25D366';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </button>
            {/* Facebook Icon */}
            <button
              onClick={() => handleShare('facebook')}
              style={{
                padding: '0.75rem',
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                width: '44px',
                height: '44px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#1877F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            {/* Twitter Icon */}
            <button
              onClick={() => handleShare('twitter')}
              style={{
                padding: '0.75rem',
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                width: '44px',
                height: '44px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#1DA1F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Author Info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '2rem',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <img 
            src={displayBlog.authorImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'} 
            alt={displayBlog.author || 'Author'}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '1.125rem', 
              fontWeight: '700', 
              color: '#1e293b',
              marginBottom: '0.25rem'
            }}>
              {displayBlog.author || 'Anonymous'}
            </div>
            <div style={{ 
              fontSize: '0.9375rem', 
              color: '#64748b',
              marginBottom: '0.75rem'
            }}>
              {formatDate(displayBlog.publishedDate) || 'Recent'}
            </div>
            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {views} views
              </span>
              <button
                onClick={handleLike}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: 'none',
                  border: 'none',
                  color: isLiked ? '#ef4444' : '#64748b',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.875rem',
                  transition: 'color 0.2s'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {likes} likes
              </button>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                {shares} shares
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {displayBlog.tags && displayBlog.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '3rem'
          }}>
            {displayBlog.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#eff6ff',
                  color: '#1D4ED8',
                  padding: '0.5rem 1rem',
                  borderRadius: '50px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  border: '1px solid #dbeafe'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Blog Content */}
        <div 
          style={{ 
            fontSize: '1.125rem',
            color: '#475569',
            lineHeight: '1.8',
            marginBottom: '3rem'
          }}
          dangerouslySetInnerHTML={{ __html: displayBlog.content || '' }}
        />
        
        {/* Content Styling */}
        <style>{`
          article h2 {
            font-size: 2rem;
            font-weight: 700;
            color: #0f172a;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            line-height: 1.3;
          }
          article p {
            margin-bottom: 1.5rem;
          }
        `}</style>

      </article>
    </div>
  );
}

