import React, { useState, useEffect } from 'react';
import './MapComponent.css';

// Google Maps API key provided by the user
const GOOGLE_MAPS_API_KEY = 'AIzaSyCG1GkdFgkusK1wOejV37IbrOxGRiIfKts';

// Default map container style
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  border: 'none'
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

// Create Google Maps URL with markers
const createGoogleMapsUrl = (
  origin?: { lat: number, lng: number },
  destination?: { lat: number, lng: number },
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
    url += `&mode=transit`;
  }

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
  const [isLoading, setIsLoading] = useState(true);
  
  // Update map URL whenever props change
  useEffect(() => {
    // Create map URL based on current props
    const url = createGoogleMapsUrl(origin, destination, busMarkers, trainMarkers);
    setMapUrl(url);
    
    // Show loading for a short time
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    
    return () => clearTimeout(timer);
  }, [origin, destination, busMarkers, trainMarkers]);
  
  // Render loading state
  if (isLoading) {
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
