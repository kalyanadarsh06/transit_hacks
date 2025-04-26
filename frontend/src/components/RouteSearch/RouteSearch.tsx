import React, { useState, useEffect, useRef } from 'react';
import './RouteSearch.css';
import { transitService, RouteRequest } from '../../services/transitService';

interface GeocodedFeature {
  id: string;
  place_name: string;
  center: [number, number];
}

interface RouteSearchProps {
  onSearch: (origin: any, destination: any) => void;
}

const RouteSearch: React.FC<RouteSearchProps> = ({ onSearch }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [originSuggestions, setOriginSuggestions] = useState<GeocodedFeature[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<GeocodedFeature[]>([]);
  
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  
  const [selectedOriginCoords, setSelectedOriginCoords] = useState<{lat: number, lng: number} | null>(null);
  const [selectedDestinationCoords, setSelectedDestinationCoords] = useState<{lat: number, lng: number} | null>(null);
  
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  
    // Google Maps API Key for Geocoding
  const GOOGLE_MAPS_API_KEY = 'AIzaSyCG1GkdFgkusK1wOejV37IbrOxGRiIfKts';
  
  // Example Chicago locations for initial suggestions
  const chicagoLocations = [
    {
      id: 'wrigley',
      place_name: 'Wrigley Field, 1060 W Addison St, Chicago, IL 60613',
      center: [-87.6553, 41.9484] as [number, number]
    },
    {
      id: 'millennium',
      place_name: 'Millennium Park, Chicago, IL',
      center: [-87.6238, 41.8826] as [number, number]
    },
    {
      id: 'navy-pier',
      place_name: 'Navy Pier, 600 E Grand Ave, Chicago, IL 60611',
      center: [-87.6063, 41.8919] as [number, number]
    },
    {
      id: 'ohare',
      place_name: "O'Hare International Airport, Chicago, IL 60666",
      center: [-87.9073, 41.9742] as [number, number]
    },
    {
      id: 'midway',
      place_name: 'Midway International Airport, Chicago, IL 60638',
      center: [-87.7522, 41.7868] as [number, number]
    }
  ];
  
  // Function to geocode an address using Google Geocoding API
  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return [];
    
    try {
      // Add "Chicago, IL" to the query if not already included to focus on Chicago area
      const query = address.toLowerCase().includes('chicago') ? address : `${address}, Chicago, IL`;
      const encodedAddress = encodeURIComponent(query);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}&components=administrative_area:IL|locality:Chicago`;
      
      console.log('Geocoding address:', query);
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        // Convert Google Geocoding results to our format
        return data.results.map((result: any) => ({
          id: result.place_id,
          place_name: result.formatted_address,
          center: [result.geometry.location.lng, result.geometry.location.lat] as [number, number]
        }));
      }
      return [];
    } catch (error) {
      console.error('Error geocoding address:', error);
      return [];
    }
  };

  // Handle input changes for origin and destination
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'origin' | 'destination') => {
    const value = e.target.value;
    if (type === 'origin') {
      setOrigin(value);
      
      if (!value.trim()) {
        setSelectedOriginCoords(null);
        setShowOriginSuggestions(false);
      } else {
        // Get address suggestions based on input
        // No need to call here - it's handled by the useEffect
      }
    } else {
      setDestination(value);
      
      if (!value.trim()) {
        setSelectedDestinationCoords(null);
        setShowDestinationSuggestions(false);
      } else {
        // Get address suggestions based on input
        // No need to call here - it's handled by the useEffect
      }
    }
  };
  
  // Function to get address suggestions using Google Geocoding
  const showAddressSuggestions = async (query: string, type: 'origin' | 'destination') => {
    console.log(`Getting address suggestions for ${type} with query: "${query}"`);
    
    if (!query || query.length < 3) {
      // For short queries, show some Chicago landmarks as defaults
      const defaultSuggestions = chicagoLocations.filter(location => 
        location.place_name.toLowerCase().includes(query.toLowerCase())
      );
      
      if (type === 'origin') {
        setOriginSuggestions(defaultSuggestions);
        setShowOriginSuggestions(defaultSuggestions.length > 0);
      } else {
        setDestinationSuggestions(defaultSuggestions);
        setShowDestinationSuggestions(defaultSuggestions.length > 0);
      }
      return;
    }
    
    try {
      // Geocode the address to get suggestions
      const geocodedResults = await geocodeAddress(query);
      console.log(`Found ${geocodedResults.length} geocoded suggestions for ${type}:`, geocodedResults);
      
      if (type === 'origin') {
        setOriginSuggestions(geocodedResults);
        setShowOriginSuggestions(geocodedResults.length > 0);
      } else {
        setDestinationSuggestions(geocodedResults);
        setShowDestinationSuggestions(geocodedResults.length > 0);
      }
    } catch (error) {
      console.error(`Error getting suggestions for ${type}:`, error);
      // Fall back to Chicago landmarks if geocoding fails
      if (type === 'origin') {
        setOriginSuggestions(chicagoLocations);
        setShowOriginSuggestions(chicagoLocations.length > 0);
      } else {
        setDestinationSuggestions(chicagoLocations);
        setShowDestinationSuggestions(chicagoLocations.length > 0);
      }
    }
  };
  
  // Use a debounce function to avoid excessive API calls while typing
  const debounce = (func: Function, delay: number) => {
    let timerId: NodeJS.Timeout;
    return (...args: any) => {
      clearTimeout(timerId);
      timerId = setTimeout(() => func(...args), delay);
    };
  };

  // Create debounced versions of the geocoding function
  const debouncedShowOriginSuggestions = useRef(debounce((query: string) => {
    showAddressSuggestions(query, 'origin');
  }, 500)).current;

  const debouncedShowDestinationSuggestions = useRef(debounce((query: string) => {
    showAddressSuggestions(query, 'destination');
  }, 500)).current;

  // Handle input changes and show suggestions when the user types
  useEffect(() => {
    if (origin.length >= 2) {
      console.log('Origin changed, fetching suggestions');
      debouncedShowOriginSuggestions(origin);
    }
  }, [origin]);
  
  useEffect(() => {
    if (destination.length >= 2) {
      console.log('Destination changed, fetching suggestions');
      debouncedShowDestinationSuggestions(destination);
    }
  }, [destination]);
  
  // Handle clicks outside the suggestion lists to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originInputRef.current && !originInputRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false);
      }
      if (destinationInputRef.current && !destinationInputRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: GeocodedFeature, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setOrigin(suggestion.place_name);
      setShowOriginSuggestions(false);
      // Save coordinates for later use
      setSelectedOriginCoords({ lng: suggestion.center[0], lat: suggestion.center[1] });
    } else {
      setDestination(suggestion.place_name);
      setShowDestinationSuggestions(false);
      // Save coordinates for later use
      setSelectedDestinationCoords({ lng: suggestion.center[0], lat: suggestion.center[1] });
    }
  };

  const testMapboxToken = async () => {
    const mapboxToken = 'pk.eyJ1Ijoia2FseWFuYXRyYW5zaXQiLCJhIjoiY205eXFiaWNwMDYxbTJqcHlzMGdyeGF0ZSJ9.qjUVVJHLxuDGVVmeKzuYmA';
    try {
      console.log('Testing Mapbox token with direct API call');
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/Willis%20Tower.json?access_token=${mapboxToken}&country=US`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('Direct Mapbox API test response:', data);
      alert('Mapbox API test result: ' + (data.features ? 'Success!' : 'Failed!'));
    } catch (error) {
      console.error('Error testing Mapbox API:', error);
      alert('Mapbox API test error: ' + error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Try to use coordinates from selected suggestions first
      let originCoords = selectedOriginCoords;
      let destinationCoords = selectedDestinationCoords;

      // If addresses weren't selected from suggestions, try to geocode them directly
      if (!originCoords) {
        console.log('Geocoding origin address:', origin);
        const geocodedResults = await geocodeAddress(origin);
        if (geocodedResults.length > 0) {
          const firstResult = geocodedResults[0];
          originCoords = { lat: firstResult.center[1], lng: firstResult.center[0] };
          console.log('Successfully geocoded origin to:', originCoords);
        }
      }

      if (!destinationCoords) {
        console.log('Geocoding destination address:', destination);
        const geocodedResults = await geocodeAddress(destination);
        if (geocodedResults.length > 0) {
          const firstResult = geocodedResults[0];
          destinationCoords = { lat: firstResult.center[1], lng: firstResult.center[0] };
          console.log('Successfully geocoded destination to:', destinationCoords);
        }
      }

      // Check if we have valid coordinates now
      if (!originCoords || !destinationCoords) {
        throw new Error('Could not geocode one or both addresses. Please enter valid Chicago addresses.');
      }

      console.log('Submitting route request with coordinates:', { originCoords, destinationCoords });
      
      // Pass the coordinates to the parent component's search handler
      onSearch(originCoords, destinationCoords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find route. Please try again.');
      console.error('Route search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="route-search-container">
      <h2>Plan Your Trip</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="origin">Start</label>
          <div className="autocomplete-container" ref={originInputRef}>
            <input
              type="text"
              id="origin"
              placeholder="Enter any Chicago address"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              onFocus={() => showAddressSuggestions(origin, 'origin')}
              required
            />
            {/* Debugging info */}
            <div style={{ fontSize: '10px', color: '#999' }}>
              Input Length: {origin.length}, 
              Suggestions: {originSuggestions.length}, 
              Show: {showOriginSuggestions ? 'true' : 'false'}
            </div>
            
            {showOriginSuggestions && originSuggestions.length > 0 && (
              <ul className="suggestion-list" style={{ display: 'block', position: 'absolute', zIndex: 1000, width: '100%' }}>
                {originSuggestions.map(suggestion => (
                  <li 
                    key={suggestion.id} 
                    onClick={() => handleSelectSuggestion(suggestion, 'origin')}
                    style={{ padding: '8px', borderBottom: '1px solid #eee', backgroundColor: 'white', cursor: 'pointer' }}
                  >
                    {suggestion.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="input-group">
          <label htmlFor="destination">End</label>
          <div className="autocomplete-container" ref={destinationInputRef}>
            <input
              type="text"
              id="destination"
              placeholder="Enter any Chicago address"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => showAddressSuggestions(destination, 'destination')}
              required
            />
            {/* Debugging info */}
            <div style={{ fontSize: '10px', color: '#999' }}>
              Input Length: {destination.length}, 
              Suggestions: {destinationSuggestions.length}, 
              Show: {showDestinationSuggestions ? 'true' : 'false'}
            </div>
            
            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
              <ul className="suggestion-list" style={{ display: 'block', position: 'absolute', zIndex: 1000, width: '100%' }}>
                {destinationSuggestions.map(suggestion => (
                  <li 
                    key={suggestion.id} 
                    onClick={() => handleSelectSuggestion(suggestion, 'destination')}
                    style={{ padding: '8px', borderBottom: '1px solid #eee', backgroundColor: 'white', cursor: 'pointer' }}
                  >
                    {suggestion.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button type="submit" className="find-routes-btn">
          Find Routes
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default RouteSearch;
