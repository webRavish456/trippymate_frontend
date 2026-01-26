'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { API_BASE_URL } from '@/lib/config';

export default function HeritageDetailPage() {
  const params = useParams();
  const router = useRouter();
  // Decode URL-encoded characters (e.g., %26 becomes &)
  const heritageName = params.heritageName ? decodeURIComponent(params.heritageName) : '';
  
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
          const heritageNameFormatted = heritageName.replace(/-/g, ' ').toLowerCase().trim();
          const matchedHeritage = heritageData.data.find(h => {
            const heritageNameLower = (h.name || h.title || '').toLowerCase().trim();
            // Try exact match first
            if (heritageNameLower === heritageNameFormatted) return true;
            // Try matching by replacing special characters and spaces
            const normalizedUrl = heritageNameLower.replace(/[&\s]+/g, ' ').replace(/\s+/g, ' ').trim();
            const normalizedFormatted = heritageNameFormatted.replace(/[&\s]+/g, ' ').replace(/\s+/g, ' ').trim();
            return normalizedUrl === normalizedFormatted;
          });

          if (matchedHeritage) {
            setHeritageData(matchedHeritage);
            
            // Check if placesDetails exists (similar to regions)
            if (matchedHeritage.placesDetails && Array.isArray(matchedHeritage.placesDetails) && matchedHeritage.placesDetails.length > 0) {
              // Convert placesDetails to destinations format
              const formattedDestinations = matchedHeritage.placesDetails.map((place, index) => {
                // Create composite ID: heritageId-placeName-index (same format as regions)
                // Use original placeName with spaces (Next.js will URL-encode automatically)
                const placeNameRaw = place.placeName || place.name || 'destination';
                const compositeId = place._id || place.id || `${matchedHeritage._id}-${placeNameRaw}-${index}`;
                return {
                  _id: compositeId,
                  id: compositeId,
                  name: place.placeName || place.name || 'Destination',
                  location: place.location || `${place.placeName || place.name}`,
                  rating: place.rating || 4.5,
                  description: place.description || '',
                  image: place.images?.[0] || place.image || '/explore-destination/default.png',
                  images: place.images || (place.image ? [place.image] : [])
                };
              });
              setDestinations(formattedDestinations);
            } else if (matchedHeritage.destinations && Array.isArray(matchedHeritage.destinations)) {
              setDestinations(matchedHeritage.destinations);
            } else {
              // Try to fetch destinations for this heritage (only if placesDetails not available)
              try {
                const destRes = await fetch(`${API_BASE_URL}/api/admin/destination/culture/${matchedHeritage._id}/destinations`);
                
                // Check if response is ok and content-type is JSON
                if (destRes.ok && destRes.headers.get('content-type')?.includes('application/json')) {
                  const destData = await destRes.json();
                  
                  if (destData.status && destData.data) {
                    setDestinations(destData.data.destinations || destData.data || []);
                  } else {
                    setDestinations(getDummyHeritageDestinations(heritageNameFormatted));
                  }
                } else {
                  // Response is not JSON (probably HTML error page)
                  setDestinations(getDummyHeritageDestinations(heritageNameFormatted));
                }
              } catch (error) {
                console.error('Error fetching destinations:', error);
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
    if (!destinationId) {
      console.error('Destination ID is missing');
      return;
    }
    // Skip navigation for dummy IDs (like 'her1', 'her2', etc.)
    if (String(destinationId).match(/^(adv|her)\d+$/)) {
      console.warn('Cannot navigate to dummy destination ID:', destinationId);
      return;
    }
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

