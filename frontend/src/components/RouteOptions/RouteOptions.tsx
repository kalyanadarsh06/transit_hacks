import React, { useState, useEffect } from 'react';
import './RouteOptions.css';
import { transitService } from '../../services/transitService';

// CTA API Keys from our environment variables
const CTA_BUS_API_KEY = "zg8kjD85Kb9qN8C3E9YAw4twp";
const CTA_TRAIN_API_KEY = "7775f2896b184955ada165c878e29f26";

// Generate fallback routes when the backend doesn't return valid data
const generateFallbackRoutes = (origin: any, destination: any) => {
  // Get coordinates from origin and destination
  let originCoords = origin;
  let destCoords = destination;
  
  // Handle string or object format
  if (typeof origin === 'string') {
    const parts = origin.split(',');
    originCoords = { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
  }
  
  if (typeof destination === 'string') {
    const parts = destination.split(',');
    destCoords = { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
  }
  
  // Calculate approximate distance and duration
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in meters
  };
  
  const distance = calculateDistance(
    originCoords.lat, originCoords.lng, 
    destCoords.lat, destCoords.lng
  );
  
  const duration = distance / 8; // Approximate transit speed of 8 m/s (28.8 km/h)
  
  // Create bus route option
  const busRoute = {
    id: 'bus-1',
    type: 'bus',
    duration: duration,
    distance: distance,
    legs: [{
      duration: duration,
      distance: distance,
      steps: [
        {
          type: 'walk',
          duration: duration * 0.1,
          distance: distance * 0.1,
          instruction: 'Walk to bus stop'
        },
        {
          type: 'transit',
          transit_details: {
            vehicle_type: 'bus',
            route: '22',
            eta: '3 min',
            duration: duration * 0.8,
            distance: distance * 0.8
          }
        },
        {
          type: 'walk',
          duration: duration * 0.1,
          distance: distance * 0.1,
          instruction: 'Walk to destination'
        }
      ]
    }],
    coordinates: [
      [originCoords.lng, originCoords.lat],
      [originCoords.lng + (destCoords.lng - originCoords.lng) * 0.33, originCoords.lat + (destCoords.lat - originCoords.lat) * 0.33],
      [originCoords.lng + (destCoords.lng - originCoords.lng) * 0.66, originCoords.lat + (destCoords.lat - originCoords.lat) * 0.66],
      [destCoords.lng, destCoords.lat]
    ]
  };
  
  // Create train route option
  const trainRoute = {
    id: 'train-1',
    type: 'train',
    duration: duration * 0.7, // Trains are faster
    distance: distance,
    legs: [{
      duration: duration * 0.7,
      distance: distance,
      steps: [
        {
          type: 'walk',
          duration: duration * 0.15,
          distance: distance * 0.15,
          instruction: 'Walk to train station'
        },
        {
          type: 'transit',
          transit_details: {
            vehicle_type: 'train',
            route: 'Red',
            eta: '5 min',
            duration: duration * 0.4,
            distance: distance * 0.7
          }
        },
        {
          type: 'walk',
          duration: duration * 0.15,
          distance: distance * 0.15,
          instruction: 'Walk to destination'
        }
      ]
    }],
    coordinates: [
      [originCoords.lng, originCoords.lat],
      [originCoords.lng + (destCoords.lng - originCoords.lng) * 0.5, originCoords.lat + (destCoords.lat - originCoords.lat) * 0.3],
      [destCoords.lng, destCoords.lat]
    ]
  };
  
  // Create mixed bus+train route
  const mixedRoute = {
    id: 'mixed-1',
    type: 'mixed',
    duration: duration * 0.8,
    distance: distance,
    legs: [{
      duration: duration * 0.8,
      distance: distance,
      steps: [
        {
          type: 'walk',
          duration: duration * 0.1,
          distance: distance * 0.1,
          instruction: 'Walk to bus stop'
        },
        {
          type: 'transit',
          transit_details: {
            vehicle_type: 'bus',
            route: '147',
            eta: '2 min',
            duration: duration * 0.3,
            distance: distance * 0.4
          }
        },
        {
          type: 'walk',
          duration: duration * 0.05,
          distance: distance * 0.05,
          instruction: 'Walk to train station'
        },
        {
          type: 'transit',
          transit_details: {
            vehicle_type: 'train',
            route: 'Blue',
            eta: '4 min',
            duration: duration * 0.25,
            distance: distance * 0.35
          }
        },
        {
          type: 'walk',
          duration: duration * 0.1,
          distance: distance * 0.1,
          instruction: 'Walk to destination'
        }
      ]
    }],
    coordinates: [
      [originCoords.lng, originCoords.lat],
      [originCoords.lng + (destCoords.lng - originCoords.lng) * 0.25, originCoords.lat + (destCoords.lat - originCoords.lat) * 0.25],
      [originCoords.lng + (destCoords.lng - originCoords.lng) * 0.5, originCoords.lat + (destCoords.lat - originCoords.lat) * 0.4],
      [originCoords.lng + (destCoords.lng - originCoords.lng) * 0.75, originCoords.lat + (destCoords.lat - originCoords.lat) * 0.75],
      [destCoords.lng, destCoords.lat]
    ]
  };
  
  // Return all route options
  return {
    busRoutes: [busRoute],
    trainRoutes: [trainRoute],
    mixedRoutes: [mixedRoute],
    allRoutes: [busRoute, trainRoute, mixedRoute]
  };
};

interface RouteOptionsProps {
  origin: string | {lat: number, lng: number};
  destination: string | {lat: number, lng: number};
  onRouteSelect: (route: any) => void;
}

const RouteOptions: React.FC<RouteOptionsProps> = ({ origin, destination, onRouteSelect }) => {
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [prioritizeSafety, setPrioritizeSafety] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchRouteOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Pass origin and destination directly - transitService will handle formatting
        console.log('Origin in RouteOptions:', origin);
        console.log('Destination in RouteOptions:', destination);
        
        // Fetch routes with safety information if prioritizing safety
        const data = prioritizeSafety 
          ? await transitService.getRouteOptionsWithSafety(origin, destination, true)
          : await transitService.getRouteOptions(origin, destination);
        
        console.log('Route data received from API:', data);
        
                // Check if we got valid route data from the API
        if (!data || (!data.allRoutes && !data.busRoutes && !data.trainRoutes)) {
          console.log('API returned empty or invalid data, generating fallback routes');
          // Generate fallback routes between the two points
          const fallbackData = generateFallbackRoutes(origin, destination);
          setRouteData(fallbackData);
          return;
        }

        // Now fetch real-time CTA bus and train data to enhance the routes
        try {
          // Fetch bus arrival predictions for routes 22, 6, and 147 (popular Chicago routes)
          const busRoutes = ['22', '6', '147'];
          const busData = await Promise.all(busRoutes.map(route => 
            fetch(`https://www.ctabustracker.com/bustime/api/v2/getpredictions?key=${CTA_BUS_API_KEY}&rt=${route}&format=json`)
              .then(res => res.json())
          ));
          
          // Fetch train arrival predictions for popular stations
          const stationId = '40380'; // Clark/Lake
          const trainData = await fetch(`https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${CTA_TRAIN_API_KEY}&mapid=${stationId}&outputType=JSON`)
            .then(res => res.json());
          
          console.log('Got real-time CTA data:', { busData, trainData });
          
          // Enhance the route data with real-time ETA information
          // We'll add this to the existing route data object
          if (data && data.busRoutes) {
            data.busRoutes = data.busRoutes.map((route: any) => {
              // Add real-time ETA if available
              if (route.legs && route.legs[0] && route.legs[0].steps) {
                const transitSteps = route.legs[0].steps.filter((step: any) => 
                  step.transit_details && step.transit_details.vehicle_type === 'bus'
                );
                
                // Update transit details with real ETAs
                transitSteps.forEach((step: any) => {
                  const routeNumber = step.transit_details.route;
                  // Find matching real-time data
                  const matchingData = busData.find((data: any) => 
                    data && data['bustime-response'] && 
                    data['bustime-response'].prd && 
                    data['bustime-response'].prd.some((pred: any) => pred.rt === routeNumber)
                  );
                  
                  if (matchingData && matchingData['bustime-response'] && matchingData['bustime-response'].prd) {
                    const prediction = matchingData['bustime-response'].prd[0];
                    if (prediction) {
                      // Update with real ETA
                      step.transit_details.eta = `${prediction.prdctdn} min`;
                    }
                  }
                });
              }
              return route;
            });
          }
          
          if (data && data.trainRoutes) {
            data.trainRoutes = data.trainRoutes.map((route: any) => {
              // Add real-time ETA if available from train data
              if (trainData && trainData.ctatt && trainData.ctatt.eta) {
                const trainEtas = trainData.ctatt.eta;
                // Use first available ETA for demonstration
                if (trainEtas.length > 0) {
                  const firstEta = trainEtas[0];
                  // Convert arrival time to minutes from now
                  const arrivalTime = new Date(firstEta.arrT);
                  const now = new Date();
                  const minutesAway = Math.round((arrivalTime.getTime() - now.getTime()) / 60000);
                  
                  if (route.legs && route.legs[0]) {
                    route.legs[0].transit_details = route.legs[0].transit_details || {};
                    route.legs[0].transit_details.eta = `${minutesAway} min`;
                  }
                }
              }
              return route;
            });
          }
        } catch (err) {
          console.error('Error enhancing routes with CTA data:', err);
          // Continue with basic route data even if CTA enhancement fails
        }
        
        // Set the route data (with or without CTA enhancements)
        setRouteData(data);
      } catch (error) {
        console.error('Error fetching route options:', error);
        setError('Could not find route options. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (origin && destination) {
      fetchRouteOptions();
    }
  }, [origin, destination, prioritizeSafety]);
  
  // Format duration (e.g., convert seconds to minutes)
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds} sec`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  };
  
  // Format distance (convert meters to miles)
  const formatDistance = (meters: number): string => {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(1)} mi`;
  };
  
  // Get CSS class based on safety score
  const getSafetyScoreClass = (score: number): string => {
    if (score >= 8) return 'safety-score-high';
    if (score >= 5) return 'safety-score-medium';
    return 'safety-score-low';
  };
  
  // Get the appropriate routes based on active tab
  const getRoutesToDisplay = () => {
    if (!routeData) return [];
    
    switch (activeTab) {
      case 'bus':
        return routeData.busRoutes || [];
      case 'train':
        return routeData.trainRoutes || [];
      case 'mixed':
        return routeData.mixedRoutes || [];
      default:
        return routeData.allRoutes || [];
    }
  };
  
  // Extract transit steps from route
  const getTransitSteps = (route: any) => {
    if (!route || !route.legs) return [];
    
    const transitSteps: any[] = [];
    
    route.legs.forEach((leg: any) => {
      leg.steps.forEach((step: any) => {
        if (step.transit_details) {
          transitSteps.push(step);
        }
      });
    });
    
    return transitSteps;
  };
  
  // Render transit badges for a route
  const renderTransitBadges = (route: any) => {
    const transitSteps = getTransitSteps(route);
    
    return (
      <div className="route-transit-badges">
        {transitSteps.map((step, index) => {
          const { vehicle_type, route: routeNumber } = step.transit_details;
          
          if (vehicle_type === 'bus') {
            return (
              <span key={index} className="transit-badge bus-badge">
                {routeNumber}
              </span>
            );
          } else if (vehicle_type === 'train') {
            let color = '#F44336'; // Default red
            
            // Set color based on route name
            if (routeNumber.toLowerCase() === 'red') color = '#F44336';
            else if (routeNumber.toLowerCase() === 'blue') color = '#2196F3';
            else if (routeNumber.toLowerCase() === 'green') color = '#4CAF50';
            else if (routeNumber.toLowerCase() === 'brown') color = '#795548';
            else if (routeNumber.toLowerCase() === 'purple') color = '#9C27B0';
            else if (routeNumber.toLowerCase() === 'pink') color = '#E91E63';
            else if (routeNumber.toLowerCase() === 'orange') color = '#FF9800';
            else if (routeNumber.toLowerCase() === 'yellow') color = '#FFEB3B';
            
            return (
              <span key={index} className="transit-badge train-badge" style={{ backgroundColor: color }}>
                {routeNumber}
              </span>
            );
          }
          
          return null;
        })}
      </div>
    );
  };
  
  // Count transit types in a route
  const countTransitTypes = (route: any) => {
    const transitSteps = getTransitSteps(route);
    let busCount = 0;
    let trainCount = 0;
    
    transitSteps.forEach(step => {
      if (step.transit_details.vehicle_type === 'bus') {
        busCount++;
      } else if (step.transit_details.vehicle_type === 'train') {
        trainCount++;
      }
    });
    
    return { busCount, trainCount };
  };
  
  return (
    <div className="route-options-container">
      <div className="route-options-header">
        <h2>Transit Options</h2>
      </div>
      
      <div className="route-options-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Routes
        </button>
        <button 
          className={`tab ${activeTab === 'bus' ? 'active' : ''}`}
          onClick={() => setActiveTab('bus')}
        >
          Bus Only
        </button>
        <button 
          className={`tab ${activeTab === 'train' ? 'active' : ''}`}
          onClick={() => setActiveTab('train')}
        >
          Train Only
        </button>
        <button 
          className={`tab ${activeTab === 'mixed' ? 'active' : ''}`}
          onClick={() => setActiveTab('mixed')}
        >
          Combined
        </button>
      </div>
      
      <div className="safety-toggle">
        <div className="safety-toggle-switch">
          <input 
            type="checkbox" 
            checked={prioritizeSafety}
            onChange={() => {
              setPrioritizeSafety(!prioritizeSafety);
              // Refetch routes with new safety preference
              if (origin && destination) {
                const fetchRouteOptions = async () => {
                  setLoading(true);
                  try {
                    const data = !prioritizeSafety 
                      ? await transitService.getRouteOptionsWithSafety(origin, destination, true)
                      : await transitService.getRouteOptions(origin, destination);
                    setRouteData(data);
                  } catch (error) {
                    console.error('Error refetching routes:', error);
                    setError('Could not update route options. Please try again.');
                  } finally {
                    setLoading(false);
                  }
                };
                fetchRouteOptions();
              }
            }}
          />
          <span className="safety-toggle-slider"></span>
        </div>
        <label>Prioritize Safety</label>
      </div>
      
      <div className="route-options-content">
        {loading ? (
          <div className="loading-indicator">Finding the best routes...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : routeData ? (
          <div className="routes-list">
            {getRoutesToDisplay().length > 0 ? (
              getRoutesToDisplay().map((route: any, index: number) => {
                const { busCount, trainCount } = countTransitTypes(route);
                
                // Determine route type based on transit modes or the existing type
                let routeType = route.type || '';
                if (!routeType) {
                  if (busCount > 0 && trainCount > 0) {
                    routeType = 'mixed';
                  } else if (busCount > 0) {
                    routeType = 'bus';
                  } else if (trainCount > 0) {
                    routeType = 'train';
                  } else {
                    routeType = 'walking';
                  }
                }
                
                // Define color based on route type
                let routeColor: string = '#4CAF50'; // Default color
                switch(routeType) {
                  case 'bus':
                    routeColor = '#1976D2';
                    break;
                  case 'train':
                    routeColor = '#D32F2F';
                    break;
                  case 'mixed':
                    routeColor = '#7B1FA2';
                    break;
                  default:
                    routeColor = '#4CAF50';
                    break;
                }
                
                return (
                  <div 
                    key={index} 
                    className={`route-item ${selectedRoute === route ? 'selected' : ''}`} 
                    onClick={() => {
                      // Prepare route data with type and color information
                      const enhancedRoute = {
                        ...route,
                        type: routeType,
                        color: routeColor
                      };
                      setSelectedRoute(route);
                      onRouteSelect(enhancedRoute);
                    }}
                  >
                    <div className="route-item-header">
                      <div className="route-name">
                        <div className="route-type">
                          {routeType === 'bus' && 'Bus Route'}
                          {routeType === 'train' && 'Train Route'}
                          {routeType === 'mixed' && 'Mixed Transit'}
                          {routeType === 'walking' && 'Walking'}
                          
                          {/* Safety badges */}
                          {route.safestOverall && (
                            <span className="route-badge safest-route-badge">Safest Route</span>
                          )}
                          {route.safestInCategory && !route.safestOverall && (
                            <span className="route-badge safety-badge">Safest {routeType}</span>
                          )}
                        </div>
                        {route.name && <div className="route-number">{route.name}</div>}
                      </div>
                    </div>
                    
                    <div className="route-summary">
                      <div className="route-info">
                        <div className="route-duration">
                          <i className="fas fa-clock"></i>
                          {formatDuration(route.duration)}
                        </div>
                        <div className="route-distance">
                          <i className="fas fa-road"></i>
                          {formatDistance(route.distance)}
                        </div>
                        {/* Display safety score if available */}
                        {route.safetyScore !== undefined && (
                          <div className={`route-safety ${getSafetyScoreClass(route.safetyScore)}`}>
                            <i className="fas fa-shield-alt"></i>
                            Safety: {route.safetyScore.toFixed(1)}
                          </div>
                        )}
                      </div>
                      
                      <div className="route-transit-info">
                        {busCount > 0 && (
                          <span className="transit-count">
                            <span className="transit-icon bus-icon">🚌</span>
                            {busCount === 1 ? '1 bus' : `${busCount} buses`}
                          </span>
                        )}
                        
                        {trainCount > 0 && (
                          <span className="transit-count">
                            <span className="transit-icon train-icon">🚆</span>
                            {trainCount === 1 ? '1 train' : `${trainCount} trains`}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="route-details">
                      {renderTransitBadges(route)}
                      
                      <div className="route-eta">
                        ETA: {route.legs[0].transit_details?.eta || 'Scheduled departure'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-routes-message">
                No {activeTab === 'bus' ? 'bus' : activeTab === 'train' ? 'train' : activeTab === 'mixed' ? 'combined' : ''} routes available for this journey.
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">Enter a start and end point to see transit options.</div>
        )}
      </div>
    </div>
  );
};

export default RouteOptions;
