'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { API_BASE_URL } from '@/lib/config';

// Dummy data for different regions
const getDummyStatesData = (regionName) => {
  const regionLower = regionName.toLowerCase();
  
  if (regionLower.includes('north')) {
    return [
      {
        name: 'Uttar Pradesh',
        state: 'Uttar Pradesh',
        destinations: [
          {
            _id: '1',
            id: '1',
            name: 'Taj Mahal, Agra',
            location: 'Agra, Uttar Pradesh',
            rating: 4.8,
            description: 'One of the Seven Wonders of the World, a magnificent white marble mausoleum.',
            image: '/explore-destination/taj-mahal.jpg',
            images: ['/explore-destination/taj-mahal.jpg']
          },
          {
            _id: '2',
            id: '2',
            name: 'Varanasi',
            location: 'Varanasi, Uttar Pradesh',
            rating: 4.6,
            description: 'The spiritual capital of India, known for its ghats and ancient temples.',
            image: '/explore-destination/varanasi.jpg',
            images: ['/explore-destination/varanasi.jpg']
          },
          {
            _id: '3',
            id: '3',
            name: 'Lucknow',
            location: 'Lucknow, Uttar Pradesh',
            rating: 4.5,
            description: 'City of Nawabs, famous for its rich culture and delicious cuisine.',
            image: '/explore-destination/lucknow.jpg',
            images: ['/explore-destination/lucknow.jpg']
          }
        ]
      },
      {
        name: 'Himachal Pradesh',
        state: 'Himachal Pradesh',
        destinations: [
          {
            _id: '4',
            id: '4',
            name: 'Manali',
            location: 'Manali, Himachal Pradesh',
            rating: 4.7,
            description: 'A beautiful hill station in the mountains, perfect for adventure and relaxation.',
            image: '/explore-destination/manali.jpg',
            images: ['/explore-destination/manali.jpg']
          },
          {
            _id: '5',
            id: '5',
            name: 'Shimla',
            location: 'Shimla, Himachal Pradesh',
            rating: 4.6,
            description: 'The Queen of Hills, a charming hill station with colonial architecture.',
            image: '/explore-destination/shimla.jpg',
            images: ['/explore-destination/shimla.jpg']
          }
        ]
      },
      {
        name: 'Uttarakhand',
        state: 'Uttarakhand',
        destinations: [
          {
            _id: '6',
            id: '6',
            name: 'Rishikesh',
            location: 'Rishikesh, Uttarakhand',
            rating: 4.5,
            description: 'Yoga capital of the world, located on the banks of the Ganges.',
            image: '/explore-destination/rishikesh.jpg',
            images: ['/explore-destination/rishikesh.jpg']
          },
          {
            _id: '7',
            id: '7',
            name: 'Mussoorie',
            location: 'Mussoorie, Uttarakhand',
            rating: 4.6,
            description: 'The Queen of Hills, a popular hill station with scenic beauty.',
            image: '/explore-destination/mussoorie.jpg',
            images: ['/explore-destination/mussoorie.jpg']
          }
        ]
      }
    ];
  } else if (regionLower.includes('south')) {
    return [
      {
        name: 'Kerala',
        state: 'Kerala',
        destinations: [
          {
            _id: '8',
            id: '8',
            name: 'Munnar',
            location: 'Munnar, Kerala',
            rating: 4.7,
            description: 'Beautiful hill station known for tea plantations and scenic landscapes.',
            image: '/explore-destination/munnar.jpg',
            images: ['/explore-destination/munnar.jpg']
          },
          {
            _id: '9',
            id: '9',
            name: 'Alleppey',
            location: 'Alleppey, Kerala',
            rating: 4.6,
            description: 'Famous for its backwaters and houseboat cruises.',
            image: '/explore-destination/alleppey.jpg',
            images: ['/explore-destination/alleppey.jpg']
          }
        ]
      },
      {
        name: 'Tamil Nadu',
        state: 'Tamil Nadu',
        destinations: [
          {
            _id: '10',
            id: '10',
            name: 'Ooty',
            location: 'Ooty, Tamil Nadu',
            rating: 4.5,
            description: 'Queen of Hill Stations, known for its tea gardens and pleasant weather.',
            image: '/explore-destination/ooty.jpg',
            images: ['/explore-destination/ooty.jpg']
          }
        ]
      }
    ];
  } else if (regionLower.includes('east')) {
    return [
      {
        name: 'West Bengal',
        state: 'West Bengal',
        destinations: [
          {
            _id: '11',
            id: '11',
            name: 'Darjeeling',
            location: 'Darjeeling, West Bengal',
            rating: 4.6,
            description: 'Famous for tea plantations and the Darjeeling Himalayan Railway.',
            image: '/explore-destination/darjeeling.jpg',
            images: ['/explore-destination/darjeeling.jpg']
          }
        ]
      }
    ];
  } else if (regionLower.includes('west')) {
    return [
      {
        name: 'Rajasthan',
        state: 'Rajasthan',
        destinations: [
          {
            _id: '12',
            id: '12',
            name: 'Jaipur',
            location: 'Jaipur, Rajasthan',
            rating: 4.7,
            description: 'The Pink City, known for its royal palaces and vibrant culture.',
            image: '/explore-destination/jaipur.jpg',
            images: ['/explore-destination/jaipur.jpg']
          },
          {
            _id: '13',
            id: '13',
            name: 'Udaipur',
            location: 'Udaipur, Rajasthan',
            rating: 4.8,
            description: 'City of Lakes, famous for its beautiful lakes and palaces.',
            image: '/explore-destination/udaipur.jpg',
            images: ['/explore-destination/udaipur.jpg']
          }
        ]
      },
      {
        name: 'Gujarat',
        state: 'Gujarat',
        destinations: [
          {
            _id: '14',
            id: '14',
            name: 'Ahmedabad',
            location: 'Ahmedabad, Gujarat',
            rating: 4.5,
            description: 'Historical city known for its rich heritage and delicious food.',
            image: '/explore-destination/ahmedabad.jpg',
            images: ['/explore-destination/ahmedabad.jpg']
          }
        ]
      }
    ];
  }
  
  // Default dummy data
  return [
    {
      name: 'Sample State',
      state: 'Sample State',
      destinations: [
        {
          _id: '15',
          id: '15',
            name: 'Sample Destination',
            location: 'Sample Location',
            rating: 4.5,
            description: 'A beautiful destination worth visiting.',
            image: '/explore-destination/default.png',
            images: ['/explore-destination/default.png']
        }
      ]
    }
  ];
};

export default function RegionDetailPage() {
  const params = useParams();
  const router = useRouter();
  // Decode URL-encoded characters (e.g., %26 becomes &)
  const regionName = params.regionName ? decodeURIComponent(params.regionName) : '';
  
  const [regionData, setRegionData] = useState(null);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegionData = async () => {
      try {
        setLoading(true);
        
        // First, get all regions to find the matching one
        const regionsRes = await fetch(`${API_BASE_URL}/api/admin/destination/region`);
        const regionsData = await regionsRes.json();
        
        if (regionsData.status && regionsData.data) {
          // Find the region by matching the name (case-insensitive, handle spaces/dashes)
          const regionNameFormatted = regionName.replace(/-/g, ' ').toLowerCase();
          
          // Extract the main region keyword (north, south, east, west)
          const mainRegionKeywords = ['north', 'south', 'east', 'west'];
          const regionKeyword = mainRegionKeywords.find(keyword => 
            regionNameFormatted.includes(keyword)
          );
          
          // Find the region by checking if region name contains the keyword
          const matchedRegion = regionsData.data.find(r => {
            if (!r || r.status !== 'active') return false;
            const regionNameLower = (r.region || r.name || '').toLowerCase();
            
            // If we found a keyword, match by keyword
            if (regionKeyword) {
              return regionNameLower.includes(regionKeyword);
            }
            // Otherwise, exact match
            return regionNameLower === regionNameFormatted;
          });

          if (matchedRegion) {
            setRegionData(matchedRegion);
            
            // Try to fetch states and destinations
            try {
              const statesRes = await fetch(`${API_BASE_URL}/api/admin/destination/region/${matchedRegion._id}/states`);
              const statesData = await statesRes.json();
              
              console.log('States API Response:', statesData); // Debug log
              
              if (statesData.status && statesData.data && statesData.data.states) {
                setStates(statesData.data.states);
              } else if (matchedRegion.states && Array.isArray(matchedRegion.states)) {
                // Fallback to states from region data
                setStates(matchedRegion.states);
              } else if (matchedRegion.placesDetails && Array.isArray(matchedRegion.placesDetails) && matchedRegion.placesDetails.length > 0) {
                // Convert placesDetails to states format
                console.log('Converting placesDetails to states format');
                const convertedStates = convertPlacesDetailsToStates(matchedRegion.placesDetails, matchedRegion._id, matchedRegion.state);
                setStates(convertedStates);
              } else {
                // Use dummy data if no states found
                console.log('Using dummy data for:', regionNameFormatted);
                setStates(getDummyStatesData(regionNameFormatted));
              }
            } catch (error) {
              console.error('Error fetching states:', error);
              // Fallback to states from region data
              if (matchedRegion.states && Array.isArray(matchedRegion.states)) {
                setStates(matchedRegion.states);
              } else if (matchedRegion.placesDetails && Array.isArray(matchedRegion.placesDetails) && matchedRegion.placesDetails.length > 0) {
                // Convert placesDetails to states format
                console.log('Converting placesDetails to states format (fallback)');
                const convertedStates = convertPlacesDetailsToStates(matchedRegion.placesDetails, matchedRegion._id, matchedRegion.state);
                setStates(convertedStates);
              } else {
                // Use dummy data if no states found
                console.log('Using dummy data due to error:', regionNameFormatted);
                setStates(getDummyStatesData(regionNameFormatted));
              }
            }
          } else {
            // If region not found, use dummy data
            console.log('Region not found, using dummy data for:', regionNameFormatted);
            setStates(getDummyStatesData(regionNameFormatted));
          }
        }
      } catch (error) {
        console.error('Error fetching region data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (regionName) {
      fetchRegionData();
    }
  }, [regionName]);

  // Helper function to convert placesDetails to states format
  const convertPlacesDetailsToStates = (placesDetails, regionId, regionState) => {
    if (!placesDetails || !Array.isArray(placesDetails)) return [];
    
    // Group places by state (use place.state if available, otherwise use region.state)
    const statesMap = new Map();
    
    placesDetails.forEach((place, index) => {
      const stateName = place.state || regionState || 'Unknown State';
      
      if (!statesMap.has(stateName)) {
        statesMap.set(stateName, {
          name: stateName,
          state: stateName,
          destinations: []
        });
      }
      
      // Create composite ID: regionId-placeName-index
      const compositeId = `${regionId}-${place.placeName}-${index}`;
      
      const destination = {
        _id: place._id || place.id || compositeId,
        id: place._id || place.id || compositeId,
        name: place.placeName || 'Destination',
        location: place.location || `${place.placeName}, ${stateName}`,
        rating: place.rating || 4.5,
        description: place.description || '',
        image: place.images?.[0] || place.image || '/explore-destination/default.png',
        images: place.images || (place.image ? [place.image] : [])
      };
      
      statesMap.get(stateName).destinations.push(destination);
    });
    
    return Array.from(statesMap.values());
  };

  // Capitalize first letter of each word
  const formatRegionName = (name) => {
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
    // Ensure we're using only the ID, not a full path
    const cleanId = String(destinationId).split('/').pop();
    router.push(`/explore-destination/${cleanId}`);
  };

  // Get region display name - use from data if available, otherwise format from URL
  const regionDisplayName = regionData 
    ? formatRegionName(regionData.region || regionData.name || '')
    : formatRegionName(regionName);

  return (
    <div className="region-detail-page">
      {/* Header with Background Image */}
      <div 
        className="region-detail-header"
        style={{
          backgroundImage: regionData?.image 
            ? `url(${regionData.image})` 
            : `url(/explore-destination/region/default.png)`
        }}
      >
        <div className="region-detail-header-overlay">
          <div className="region-detail-container">
            <h1 className="region-detail-title">{regionDisplayName}</h1>
          </div>
        </div>
      </div>

      <div>

        {loading ? (
          <div className="region-detail-loading">
            <p>Loading destinations...</p>
          </div>
        ) : states.length > 0 ? (
          <div className="region-states-container">
            {states.map((state, stateIndex) => (
              <div key={stateIndex} className="region-state-section">
                <h2 className="region-state-name">{state.name || state.state}</h2>
                {state.destinations && state.destinations.length > 0 ? (
                  <div className="region-destinations-grid">
                    {state.destinations.map((destination, destIndex) => (
                      <div 
                        key={destIndex} 
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
                  <p className="region-no-destinations">No destinations available in this state</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="region-detail-empty">
            <p>No destinations available for this region</p>
          </div>
        )}
      </div>
    </div>
  );
}

