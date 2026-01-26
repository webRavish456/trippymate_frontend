'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { API_BASE_URL } from '@/lib/config';

export default function AdventureDetailPage() {
  const params = useParams();
  const router = useRouter();
  // Decode URL-encoded characters (e.g., %26 becomes &)
  const activityName = params.activityName ? decodeURIComponent(params.activityName) : '';
  
  const [activityData, setActivityData] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        
        // Fetch all activities to find the matching one
        const activitiesRes = await fetch(`${API_BASE_URL}/api/admin/destination/adventure`);
        const activitiesData = await activitiesRes.json();
        
        if (activitiesData.status && activitiesData.data) {
          const activityNameFormatted = activityName.replace(/-/g, ' ').toLowerCase().trim();
          const matchedActivity = activitiesData.data.find(a => {
            const activityNameLower = (a.name || a.title || '').toLowerCase().trim();
            // Try exact match first
            if (activityNameLower === activityNameFormatted) return true;
            // Try matching by replacing special characters and spaces
            const normalizedUrl = activityNameLower.replace(/[&\s]+/g, ' ').replace(/\s+/g, ' ').trim();
            const normalizedFormatted = activityNameFormatted.replace(/[&\s]+/g, ' ').replace(/\s+/g, ' ').trim();
            return normalizedUrl === normalizedFormatted;
          });

          if (matchedActivity) {
            setActivityData(matchedActivity);
            
            // Check if placesDetails exists (similar to regions)
            if (matchedActivity.placesDetails && Array.isArray(matchedActivity.placesDetails) && matchedActivity.placesDetails.length > 0) {
              // Convert placesDetails to destinations format
              const formattedDestinations = matchedActivity.placesDetails.map((place, index) => {
                // Create composite ID: activityId-placeName-index (same format as regions)
                // Use original placeName with spaces (Next.js will URL-encode automatically)
                const placeNameRaw = place.placeName || place.name || 'destination';
                const compositeId = place._id || place.id || `${matchedActivity._id}-${placeNameRaw}-${index}`;
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
            } else if (matchedActivity.destinations && Array.isArray(matchedActivity.destinations)) {
              setDestinations(matchedActivity.destinations);
            } else {
              // Try to fetch destinations for this activity (only if placesDetails not available)
              try {
                const destRes = await fetch(`${API_BASE_URL}/api/admin/destination/adventure/${matchedActivity._id}/destinations`);
                
                // Check if response is ok and content-type is JSON
                if (destRes.ok && destRes.headers.get('content-type')?.includes('application/json')) {
                  const destData = await destRes.json();
                  
                  if (destData.status && destData.data) {
                    setDestinations(destData.data.destinations || destData.data || []);
                  } else {
                    setDestinations(getDummyAdventureDestinations(activityNameFormatted));
                  }
                } else {
                  // Response is not JSON (probably HTML error page)
                  setDestinations(getDummyAdventureDestinations(activityNameFormatted));
                }
              } catch (error) {
                console.error('Error fetching destinations:', error);
                setDestinations(getDummyAdventureDestinations(activityNameFormatted));
              }
            }
          } else {
            setDestinations(getDummyAdventureDestinations(activityNameFormatted));
          }
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
        setDestinations(getDummyAdventureDestinations(activityName.replace(/-/g, ' ').toLowerCase()));
      } finally {
        setLoading(false);
      }
    };

    if (activityName) {
      fetchActivityData();
    }
  }, [activityName]);

  const getDummyAdventureDestinations = (activityName) => {
    return [
      {
        _id: 'adv1',
        id: 'adv1',
        name: 'Rafting in Rishikesh',
        location: 'Rishikesh, Uttarakhand',
        rating: 4.7,
        description: 'Experience thrilling white water rafting in the Ganges river with professional guides.',
        image: '/explore-destination/rafting.jpg',
        images: ['/explore-destination/rafting.jpg']
      },
      {
        _id: 'adv2',
        id: 'adv2',
        name: 'Paragliding in Bir',
        location: 'Bir, Himachal Pradesh',
        rating: 4.8,
        description: 'Soar through the skies with paragliding adventures in the beautiful Bir valley.',
        image: '/explore-destination/paragliding.jpg',
        images: ['/explore-destination/paragliding.jpg']
      },
      {
        _id: 'adv3',
        id: 'adv3',
        name: 'Trekking in Manali',
        location: 'Manali, Himachal Pradesh',
        rating: 4.6,
        description: 'Explore scenic mountain trails and enjoy breathtaking views on guided treks.',
        image: '/explore-destination/trekking.jpg',
        images: ['/explore-destination/trekking.jpg']
      }
    ];
  };

  const formatActivityName = (name) => {
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
    // Skip navigation for dummy IDs (like 'adv1', 'adv2', etc.)
    if (String(destinationId).match(/^(adv|her)\d+$/)) {
      console.warn('Cannot navigate to dummy destination ID:', destinationId);
      return;
    }
    router.push(`/explore-destination/${destinationId}`);
  };

  const activityDisplayName = activityData 
    ? formatActivityName(activityData.name || activityData.title || '')
    : formatActivityName(activityName);

  return (
    <div className="region-detail-page">
      {/* Header with Background Image */}
      <div 
        className="region-detail-header"
        style={{
          backgroundImage: activityData?.image 
            ? `url(${activityData.image})` 
            : `url(/explore-destination/adventure/default.png)`
        }}
      >
        <div className="region-detail-header-overlay">
          <div className="region-detail-container">
            <h1 className="region-detail-title">{activityDisplayName}</h1>
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
            <p>No destinations available for this activity</p>
          </div>
        )}
      </div>
    </div>
  );
}

