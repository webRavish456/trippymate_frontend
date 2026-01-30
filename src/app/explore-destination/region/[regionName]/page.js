'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { API_BASE_URL } from '@/lib/config';


export default function RegionDetailPage() {
  const params = useParams();
  const router = useRouter();
  // Decode URL-encoded characters (e.g., %26 becomes &)
  const regionName = params.regionName ? decodeURIComponent(params.regionName) : '';
  
  const [regionData, setRegionData] = useState(null);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent multiple calls if regionName is empty or already fetched
    if (!regionName) {
      setLoading(false);
      return;
    }

    let isCancelled = false; // Flag to prevent state updates if component unmounts

    const fetchRegionData = async () => {
      try {
        setLoading(true);
        
        // First, get all regions to find the matching one
        const regionsRes = await fetch(`${API_BASE_URL}/api/admin/destination/region`);
        if (isCancelled) return;
        
        const regionsData = await regionsRes.json();
        
        if (regionsData.status && regionsData.data) {
          // Find the region by matching the name (case-insensitive, handle spaces/dashes)
          const regionNameFormatted = regionName.replace(/-/g, ' ').toLowerCase();
          
          // Extract the main region keyword (north, south, east, west)
          const mainRegionKeywords = ['north', 'south', 'east', 'west'];
          const regionKeyword = mainRegionKeywords.find(keyword => 
            regionNameFormatted.includes(keyword)
          );
          
          // IMPORTANT:
          // Backend may return multiple docs for same region (e.g. "North India" per state).
          // So we aggregate ALL matching docs instead of picking only the first.
          const matchedRegions = (regionsData.data || []).filter((r) => {
            if (!r || r.status !== 'active') return false;
            const regionNameLower = (r.region || r.name || '').toLowerCase();
            if (regionKeyword) return regionNameLower.includes(regionKeyword);
            return regionNameLower === regionNameFormatted;
          });

          if (matchedRegions.length > 0) {
            // Use first doc for header image/title, but states are aggregated from all docs.
            setRegionData(matchedRegions[0]);

            const statesMap = new Map(); // key: state name
            const destinationsSet = new Set(); // Track unique destinations by composite key

            // Helper to merge "states" arrays coming from API into our map
            const mergeStatesArray = (statesArr) => {
              if (!Array.isArray(statesArr)) return;
              statesArr.forEach((st) => {
                const stateName = st?.name || st?.state || 'Unknown State';
                if (!statesMap.has(stateName)) {
                  statesMap.set(stateName, { name: stateName, state: stateName, destinations: [] });
                }
                const dests = Array.isArray(st?.destinations) ? st.destinations : [];
                if (dests.length > 0) {
                  dests.forEach(dest => {
                    // Create unique key: stateName-placeName
                    const uniqueKey = `${stateName}-${dest.name || dest.placeName || dest._id || dest.id}`;
                    if (!destinationsSet.has(uniqueKey)) {
                      destinationsSet.add(uniqueKey);
                      statesMap.get(stateName).destinations.push(dest);
                    }
                  });
                }
              });
            };

            // OPTIMIZATION: Check if placesDetails exists first (most common case)
            // If placesDetails exists, use it directly without API calls
            let hasPlacesDetails = false;
            for (const mr of matchedRegions) {
              if (mr.placesDetails && Array.isArray(mr.placesDetails) && mr.placesDetails.length > 0) {
                hasPlacesDetails = true;
                const convertedStates = convertPlacesDetailsToStates(mr.placesDetails, mr._id, mr.state);
                convertedStates.forEach(state => {
                  const stateName = state.name || state.state || 'Unknown State';
                  if (!statesMap.has(stateName)) {
                    statesMap.set(stateName, { name: stateName, state: stateName, destinations: [] });
                  }
                  // Add destinations with deduplication
                  state.destinations.forEach(dest => {
                    const uniqueKey = `${stateName}-${dest.name || dest.placeName || dest._id || dest.id}`;
                    if (!destinationsSet.has(uniqueKey)) {
                      destinationsSet.add(uniqueKey);
                      statesMap.get(stateName).destinations.push(dest);
                    }
                  });
                });
              }
            }

            // Only make API calls if placesDetails is not available
            if (!hasPlacesDetails) {
              // Fetch/convert data for each matched doc and merge
              await Promise.all(
                matchedRegions.map(async (mr) => {
                  // 1) Try states API for each region doc id (only if placesDetails not found)
                  try {
                    const statesRes = await fetch(`${API_BASE_URL}/api/admin/destination/region/${mr._id}/states`);
                    const statesData = await statesRes.json();
                    if (statesData?.status && statesData?.data?.states) {
                      mergeStatesArray(statesData.data.states);
                      return;
                    }
                  } catch (e) {
                    // ignore and fallback below
                  }

                  // 2) Fallback: states field directly on doc
                  if (mr.states && Array.isArray(mr.states) && mr.states.length > 0) {
                    mergeStatesArray(mr.states);
                    return;
                  }

                  // 3) Last fallback: if backend is "per-state doc" and only `state` is present,
                  // create an empty state section so UI doesn't show 0.
                  if (mr.state) {
                    const stateName = mr.state;
                    if (!statesMap.has(stateName)) {
                      statesMap.set(stateName, { name: stateName, state: stateName, destinations: [] });
                    }
                  }
                })
              );
            }

            if (!isCancelled) {
              setStates(Array.from(statesMap.values()));
            }
          } else {
            if (!isCancelled) {
              setStates([]);
              setRegionData(null);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching region data:', error);
        if (!isCancelled) {
          setStates([]);
          setRegionData(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchRegionData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isCancelled = true;
    };
  }, [regionName]);

  // Helper function to convert placesDetails to states format
  const convertPlacesDetailsToStates = (placesDetails, regionId, regionState) => {
    if (!placesDetails || !Array.isArray(placesDetails)) return [];
    
    // Group places by state (use place.state if available, otherwise use region.state)
    const statesMap = new Map();
    const placeSet = new Set(); // Track unique places by name+state
    
    placesDetails.forEach((place, index) => {
      const stateName = place.state || regionState || 'Unknown State';
      const placeName = place.placeName || 'Destination';
      
      // Create unique key to avoid duplicates
      const uniqueKey = `${stateName}-${placeName}`;
      if (placeSet.has(uniqueKey)) {
        return; // Skip duplicate places
      }
      placeSet.add(uniqueKey);
      
      if (!statesMap.has(stateName)) {
        statesMap.set(stateName, {
          name: stateName,
          state: stateName,
          destinations: []
        });
      }
      
      // Create composite ID: regionId-placeName-index
      const compositeId = `${regionId}-${placeName}-${index}`;
      
      const destination = {
        _id: place._id || place.id || compositeId,
        id: place._id || place.id || compositeId,
        name: placeName,
        location: place.location || `${placeName}, ${stateName}`,
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

