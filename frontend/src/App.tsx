import React, { useState, useEffect } from 'react';
import './App.css';
import MapComponent from './components/Map/MapComponent';
import RouteSearch from './components/RouteSearch/RouteSearch';
import RouteOptions from './components/RouteOptions/RouteOptions';
import { transitService } from './services/transitService';

function App() {
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [busMarkers, setBusMarkers] = useState<any[]>([]);
  const [trainMarkers, setTrainMarkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [showRouteOptions, setShowRouteOptions] = useState<boolean>(false);
  
  // Fetch real-time vehicle locations
  useEffect(() => {
    const fetchVehicleLocations = async () => {
      setIsLoading(true);
      try {
        // Common bus routes in Chicago
        const busRouteIds = ['22', '6', '147', '151', '8'];
        const trainRouteIds = ['RED', 'BLUE', 'G', 'BRN'];

        // Fetch bus locations
        const buses: any[] = [];
        for (const routeId of busRouteIds) {
          try {
            const response = await transitService.getBusVehicles(routeId);
            if (response.vehicles && response.vehicles.length > 0) {
              // Transform to map marker format
              const markers = response.vehicles.map(vehicle => ({
                id: vehicle.vid,
                latitude: parseFloat(vehicle.lat),
                longitude: parseFloat(vehicle.lon),
                route: vehicle.rt,
                direction: vehicle.des,
                delayed: vehicle.dly
              }));
              buses.push(...markers);
            }
          } catch (err) {
            console.error(`Error fetching buses for route ${routeId}:`, err);
          }
        }
        
        // Fetch train locations
        const trains: any[] = [];
        for (const routeId of trainRouteIds) {
          try {
            const response = await transitService.getTrainLocations(routeId);
            if (response.locations && response.locations.length > 0) {
              // Transform to map marker format
              const markers = response.locations.map(train => ({
                id: train.rn,
                latitude: parseFloat(train.lat),
                longitude: parseFloat(train.lon),
                line: routeId,
                destination: train.destNm,
                nextStation: train.nextStaNm
              }));
              trains.push(...markers);
            }
          } catch (err) {
            console.error(`Error fetching trains for route ${routeId}:`, err);
          }
        }
        
        setBusMarkers(buses);
        setTrainMarkers(trains);
      } catch (error) {
        console.error('Error fetching vehicle locations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchVehicleLocations();
    
    // Set up refresh interval (every 30 seconds)
    const interval = setInterval(fetchVehicleLocations, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);
  
  // Handle when route search is submitted
  const handleRouteSearch = (originCoords: any, destinationCoords: any) => {
    setIsLoading(true);
    console.log('Origin coords in App:', originCoords);
    console.log('Destination coords in App:', destinationCoords);
    
    // Set coordinates for routing
    setOrigin(originCoords);
    setDestination(destinationCoords);
    
    // Generate a basic route immediately to show on map
    const mockBusRoute = {
      duration: 1800, // 30 minutes
      distance: 10000, // 10km
      type: 'bus',
      color: '#1976D2', // Blue for bus routes
      coordinates: [
        [originCoords.lng, originCoords.lat],
        [originCoords.lng + 0.02, originCoords.lat + 0.01],
        [destinationCoords.lng - 0.02, destinationCoords.lat - 0.01],
        [destinationCoords.lng, destinationCoords.lat]
      ]
    };
    
    // Set as selected route to display on map immediately
    setSelectedRoute(mockBusRoute);
    
    // Show route options panel
    setShowRouteOptions(true);
    setIsLoading(false);
  };
  
  // Handle when a specific route is selected
  const handleRouteSelect = (route: any) => {
    console.log('Route selected:', route);
    
    // Extract route geometry if available
    let coordinates = [];
    
    // Check if the route has geometry
    if (route.geometry && route.geometry.coordinates) {
      coordinates = route.geometry.coordinates;
    } else if (route.coordinates) {
      coordinates = route.coordinates;
    } else {
      // Fallback route if no geometry
      coordinates = [
        [origin.lng, origin.lat], // Start
        [destination.lng, destination.lat]  // End
      ];
    }
    
    // Preserve route type for Google Maps
    const routeType = route.type || 'transit';
    
    // Update the selected route with all required properties
    setSelectedRoute({
      ...route,
      type: routeType,
      color: route.color || '#2196F3',
      coordinates: coordinates,
      // Make sure we keep origin and destination for the map
      origin: origin,
      destination: destination
    });
  };

  return (
    <div className="App">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading transit data...</div>
        </div>
      )}
      <header className="App-header">
        <h1>SafeTransit Chicago</h1>
      </header>
      
      <div className="App-main">
        <div className="left-panel">
          <RouteSearch onSearch={handleRouteSearch} />
          {showRouteOptions && origin && destination && (
            <RouteOptions 
              origin={origin}
              destination={destination}
              onRouteSelect={handleRouteSelect}
            />
          )}
        </div>
        <div className="map-panel">
          <MapComponent 
            routes={selectedRoute ? [selectedRoute] : []}
            busMarkers={busMarkers}
            trainMarkers={trainMarkers}
            center={origin ? {lat: origin.lat, lng: origin.lng} : undefined}
            origin={origin}
            destination={destination}
          />
        </div>
      </div>
      
      <footer className="App-footer">
        <p>Transit Hacks 2025 - SafeTransit Chicago</p>
      </footer>
    </div>
  );
}

export default App;
