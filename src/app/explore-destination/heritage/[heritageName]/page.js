'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { API_BASE_URL } from '@/lib/config';

export default function HeritageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const heritageName = params.heritageName;
  
  const [heritageData, setHeritageData] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeritageData = async () => {
      try {
        setLoading(true);
        
        // Fetch all heritage destinations to find the matching one
        const heritageRes = await fetch(`${API_BASE_URL}/api/admin/destination/culture`);
        const heritageData = await heritageRes.json();
        
        if (heritageData.status && heritageData.data) {
          const heritageNameFormatted = heritageName.replace(/-/g, ' ').toLowerCase();
          const matchedHeritage = heritageData.data.find(h => {
            const heritageNameLower = (h.name || h.title || '').toLowerCase();
            return heritageNameLower === heritageNameFormatted;
          });

          if (matchedHeritage) {
            setHeritageData(matchedHeritage);
            
            // Try to fetch destinations for this heritage
            try {
              const destRes = await fetch(`${API_BASE_URL}/api/admin/destination/culture/${matchedHeritage._id}/destinations`);
              const destData = await destRes.json();
              
              if (destData.status && destData.data) {
                setDestinations(destData.data.destinations || destData.data || []);
              } else if (matchedHeritage.destinations && Array.isArray(matchedHeritage.destinations)) {
                setDestinations(matchedHeritage.destinations);
              } else {
                // Use dummy data
                setDestinations(getDummyHeritageDestinations(heritageNameFormatted));
              }
            } catch (error) {
              console.error('Error fetching destinations:', error);
              if (matchedHeritage.destinations && Array.isArray(matchedHeritage.destinations)) {
                setDestinations(matchedHeritage.destinations);
              } else {
                setDestinations(getDummyHeritageDestinations(heritageNameFormatted));
              }
            }
          } else {
            setDestinations(getDummyHeritageDestinations(heritageNameFormatted));
          }
        }
      } catch (error) {
        console.error('Error fetching heritage data:', error);
        setDestinations(getDummyHeritageDestinations(heritageName.replace(/-/g, ' ').toLowerCase()));
      } finally {
        setLoading(false);
      }
    };

    if (heritageName) {
      fetchHeritageData();
    }
  }, [heritageName]);

  const getDummyHeritageDestinations = (heritageName) => {
    return [
      {
        _id: 'her1',
        id: 'her1',
        name: 'Taj Mahal',
        location: 'Agra, Uttar Pradesh',
        rating: 4.9,
        description: 'A magnificent white marble mausoleum and one of the Seven Wonders of the World, built by Emperor Shah Jahan.',
        image: '/explore-destination/taj-mahal.jpg',
        images: ['/explore-destination/taj-mahal.jpg']
      },
      {
        _id: 'her2',
        id: 'her2',
        name: 'Red Fort',
        location: 'Delhi',
        rating: 4.7,
        description: 'A historic fort complex that served as the main residence of the Mughal emperors.',
        image: '/explore-destination/red-fort.jpg',
        images: ['/explore-destination/red-fort.jpg']
      },
      {
        _id: 'her3',
        id: 'her3',
        name: 'Hampi',
        location: 'Karnataka',
        rating: 4.8,
        description: 'A UNESCO World Heritage Site with ancient ruins and temples from the Vijayanagara Empire.',
        image: '/explore-destination/hampi.jpg',
        images: ['/explore-destination/hampi.jpg']
      },
      {
        _id: 'her4',
        id: 'her4',
        name: 'Khajuraho Temples',
        location: 'Madhya Pradesh',
        rating: 4.6,
        description: 'Famous for their intricate sculptures and architectural beauty, a UNESCO World Heritage Site.',
        image: '/explore-destination/khajuraho.jpg',
        images: ['/explore-destination/khajuraho.jpg']
      }
    ];
  };

  const formatHeritageName = (name) => {
    if (!name) return '';
    return name
      .split(/[\s-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleDestinationClick = (destinationId) => {
    router.push(`/explore-destination/${destinationId}`);
  };

  const heritageDisplayName = heritageData 
    ? formatHeritageName(heritageData.name || heritageData.title || '')
    : formatHeritageName(heritageName);

  return (
    <div className="region-detail-page">
      {/* Header with Background Image */}
      <div 
        className="region-detail-header"
        style={{
          backgroundImage: heritageData?.image 
            ? `url(${heritageData.image})` 
            : `url(/explore-destination/heritage/default.png)`
        }}
      >
        <div className="region-detail-header-overlay">
          <div className="region-detail-container">
            <h1 className="region-detail-title">{heritageDisplayName}</h1>
          </div>
        </div>
      </div>

      <div className="region-detail-container">
        {loading ? (
          <div className="region-detail-loading">
            <p>Loading destinations...</p>
          </div>
        ) : destinations.length > 0 ? (
          <div className="region-destinations-grid">
            {destinations.map((destination, index) => (
              <div 
                key={index} 
                className="region-destination-card"
              >
                <div className="region-destination-image-wrapper">
                  <img 
                    src={destination.image || destination.images?.[0] || '/explore-destination/default.png'} 
                    alt={destination.name || 'Destination'}
                  />
                  <div className="region-destination-image-overlay"></div>
                  {destination.rating && (
                    <div className="region-destination-rating-wrapper">
                      <div className="region-destination-rating">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 1L10.5 5.5L15.5 6.5L12 10L12.5 15L8 12.5L3.5 15L4 10L0.5 6.5L5.5 5.5L8 1Z" fill="#FBBF24" stroke="#FBBF24"/>
                        </svg>
                        <span>{destination.rating}</span>
                      </div>
                    </div>
                  )}
                  <div className="region-destination-image-content">
                    <h3 className="region-destination-name">{destination.name || 'Destination'}</h3>
                    <p className="region-destination-location">{destination.location || ''}</p>
                  </div>
                </div>
                <div className="region-destination-content">
                  {destination.description && (
                    <p className="region-destination-description">{destination.description}</p>
                  )}
                  <button 
                    className="region-destination-explore-btn"
                    onClick={() => handleDestinationClick(destination._id || destination.id)}
                  >
                    Explore Now
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 14L12 9L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="region-detail-empty">
            <p>No destinations available for this heritage site</p>
          </div>
        )}
      </div>
    </div>
  );
}

