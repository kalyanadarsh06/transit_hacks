import React, { useState, useEffect } from 'react';
import './MapComponent.css';

// Google Maps API key provided by the user
const GOOGLE_MAPS_API_KEY = 'AIzaSyCG1GkdFgkusK1wOejV37IbrOxGRiIfKts';

// Default map container style
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  border: 'none',
  flex: '1 1 auto',
  display: 'block'
};

// Default center on Chicago
const defaultCenter = {
  lat: 41.8781,
  lng: -87.6298
};

// Define the interface for the component props
interface MapComponentProps {
  center?: { lat: number, lng: number };
  zoom?: number;
  routes?: any[];
  busMarkers?: any[];
  trainMarkers?: any[];
  origin?: { lat: number, lng: number };
  destination?: { lat: number, lng: number };
}

// Create Google Maps URL with markers and route information
const createGoogleMapsUrl = (
  origin?: { lat: number, lng: number },
  destination?: { lat: number, lng: number },
  routes: any[] = [],
  busMarkers: any[] = [],
  trainMarkers: any[] = []
): string => {
  // Base URL for Chicago
  let url = `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=41.8781,-87.6298&zoom=12`;

  // If we have origin and destination, show directions instead
  if (origin && destination) {
    url = `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}`;
    url += `&origin=${origin.lat},${origin.lng}`;
    url += `&destination=${destination.lat},${destination.lng}`;
    
    // Always use transit mode - the Embed API doesn't support transit_mode parameter
    // so we'll just use the general transit mode which will show the best option
    url += `&mode=transit`;
    
    // Check if we have a selected route and add any waypoints
    if (routes && routes.length > 0) {
      const selectedRoute = routes[0];
      
      // Add waypoints if available to guide the route
      if (selectedRoute.via) {
        url += `&waypoints=${selectedRoute.via}`;
      }
      
      // Add avoid options if specified
      if (selectedRoute.avoid) {
        url += `&avoid=${selectedRoute.avoid}`;
      }
    }
  }

  // If we have bus or train markers to display on the map
  // Unfortunately Google Maps Embed API doesn't support custom markers
  // but we're still showing the real-time transit directions

  return url;
};

// Main Map Component
const MapComponent: React.FC<MapComponentProps> = ({
  center = defaultCenter,
  zoom = 12,
  routes = [],
  busMarkers = [],
  trainMarkers = [],
  origin,
  destination
}) => {
  const [mapUrl, setMapUrl] = useState<string>('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapKey, setMapKey] = useState(0); // Key to force iframe refresh
  
  // Force refresh the map when routes change
  useEffect(() => {
    if (routes && routes.length > 0) {
      console.log('Routes changed, refreshing map with:', routes[0]);
      // Increment the key to force the iframe to reload
      setMapKey(prevKey => prevKey + 1);
    }
  }, [routes]);
  
  const handleMapLoad = () => {
    setIsMapLoaded(true);
  };
  
  const handleMapError = () => {
    setLoadError('Failed to load the map. Please check your internet connection.');
  };

  useEffect(() => {
    // Create map URL based on current props
    const url = createGoogleMapsUrl(origin, destination, routes, busMarkers, trainMarkers);
    setMapUrl(url);
    
    // Show loading for a short time
    setIsMapLoaded(false);
    const timer = setTimeout(() => setIsMapLoaded(true), 500);
    
    return () => clearTimeout(timer);
  }, [origin, destination, routes, busMarkers, trainMarkers]);
  
  // Render loading state
  if (!isMapLoaded) {
    return (
      <div className="map-container">
        <div className="map-loading">
          <div className="map-loading-spinner"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="map-container">
      <iframe 
        title="Google Maps"
        className="map-iframe"
        style={mapContainerStyle}
        src={mapUrl}
        allowFullScreen
      />
      {!mapUrl && (
        <div className="map-error">
          <p>Unable to load map</p>
          <p>Please ensure you have entered a valid origin and destination</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
