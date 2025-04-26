import React, { useState, useEffect, useRef } from 'react';
import './RouteSearch.css';
import { transitService, RouteRequest } from '../../services/transitService';

interface GeocodedFeature {
  id: string;
  place_name: string;
  center: [number, number];
}

interface RouteSearchProps {
  onRouteFound: (origin: any, destination: any) => void;
}

const RouteSearch: React.FC<RouteSearchProps> = ({ onRouteFound }) => {
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
  
  // Mock data instead of using Mapbox API which is having issues
  const chicagoLocations = [
    {
      id: 'wrigley',
      place_name: 'Wrigley Field, 1060 W Addison St, Chicago, IL 60613',
      center: [-87.6553, 41.9484] as [number, number]
    },
    {
      id: 'willis',
      place_name: 'Willis Tower, 233 S Wacker Dr, Chicago, IL 60606',
      center: [-87.6358, 41.8789] as [number, number]
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
      id: 'union-station',
      place_name: 'Union Station, 225 S Canal St, Chicago, IL 60606',
      center: [-87.6395, 41.8786] as [number, number]
    },
    {
      id: 'field-museum',
      place_name: 'Field Museum, 1400 S Lake Shore Dr, Chicago, IL 60605',
      center: [-87.6169, 41.8663] as [number, number]
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
    },
    {
      id: 'lincoln-park',
      place_name: 'Lincoln Park, Chicago, IL',
      center: [-87.6368, 41.9214] as [number, number]
    },
    {
      id: 'garfield-park',
      place_name: 'Garfield Park, Chicago, IL',
      center: [-87.7172, 41.8826] as [number, number]
    }
  ];

  // Handle input changes for origin and destination
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'origin' | 'destination') => {
    const value = e.target.value;
    if (type === 'origin') {
      setOrigin(value);
      
      if (!value.trim()) {
        setSelectedOriginCoords(null);
        setShowOriginSuggestions(false);
      } else {
        // Filter suggestions based on input
        showMockSuggestions(value, type);
      }
    } else {
      setDestination(value);
      
      if (!value.trim()) {
        setSelectedDestinationCoords(null);
        setShowDestinationSuggestions(false);
      } else {
        // Filter suggestions based on input
        showMockSuggestions(value, type);
      }
    }
  };
  
  // Function to filter and show mock suggestions
  const showMockSuggestions = (query: string, type: 'origin' | 'destination') => {
    console.log(`Showing mock suggestions for ${type} with query: "${query}"`);
    
    if (!query || query.length < 2) {
      if (type === 'origin') {
        setOriginSuggestions([]);
        setShowOriginSuggestions(false);
      } else {
        setDestinationSuggestions([]);
        setShowDestinationSuggestions(false);
      }
      return;
    }
    
    // Filter locations based on search query - even a partial match at the beginning of a word
    const queryLower = query.toLowerCase();
    const filteredLocations = chicagoLocations.filter(location => {
      // Check if any word in the place_name starts with the query
      const words = location.place_name.toLowerCase().split(/\s+/);
      return words.some(word => word.startsWith(queryLower)) || 
             location.place_name.toLowerCase().includes(queryLower);
    });
    
    // Log the actual filtering process
    console.log('Filtering locations with query:', queryLower);
    chicagoLocations.forEach(loc => {
      const matches = loc.place_name.toLowerCase().includes(queryLower);
      console.log(`- ${loc.place_name}: ${matches ? 'MATCH' : 'no match'}`);
    });
    
    console.log(`Found ${filteredLocations.length} suggestions for ${type}:`, filteredLocations);
    
    if (type === 'origin') {
      setOriginSuggestions(filteredLocations);
      setShowOriginSuggestions(filteredLocations.length > 0);
    } else {
      setDestinationSuggestions(filteredLocations);
      setShowDestinationSuggestions(filteredLocations.length > 0);
    }
  };
  
  // Handle input changes and show suggestions when the user types
  useEffect(() => {
    if (origin.length >= 2) {
      console.log('Origin changed, showing suggestions');
      showMockSuggestions(origin, 'origin');
    }
  }, [origin]);
  
  useEffect(() => {
    if (destination.length >= 2) {
      console.log('Destination changed, showing suggestions');
      showMockSuggestions(destination, 'destination');
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
      // Use the coordinates from selected suggestions if available
      const originCoords = selectedOriginCoords;
      const destinationCoords = selectedDestinationCoords;

      if (!originCoords || !destinationCoords) {
        throw new Error('Please select valid addresses from the dropdown suggestions');
      }

      // Create route request
      const routeRequest: RouteRequest = {
        origin: originCoords,
        destination: destinationCoords,
      };

      // Pass the coordinates to the parent component
      onRouteFound(originCoords, destinationCoords);
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
              placeholder="Enter origin address"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              onFocus={() => showMockSuggestions(origin, 'origin')}
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
              placeholder="Enter destination address"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => showMockSuggestions(destination, 'destination')}
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
