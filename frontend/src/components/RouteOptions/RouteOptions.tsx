import React, { useState, useEffect } from 'react';
import './RouteOptions.css';
import { transitService } from '../../services/transitService';

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
  
  useEffect(() => {
    const fetchRouteOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Format origin and destination as coordinates
        let originParam, destinationParam;
        
        console.log('Origin in RouteOptions:', origin);
        console.log('Destination in RouteOptions:', destination);
        
        if (typeof origin === 'string') {
          originParam = origin;
        } else {
          // Make sure we have lng and lat properties
          originParam = `${origin.lng},${origin.lat}`;
        }
        
        if (typeof destination === 'string') {
          destinationParam = destination;
        } else {
          // Make sure we have lng and lat properties
          destinationParam = `${destination.lng},${destination.lat}`;
        }
        
        console.log('Final origin param:', originParam);
        console.log('Final destination param:', destinationParam);
        
        const data = await transitService.getRouteOptions(originParam, destinationParam);
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
  }, [origin, destination]);
  
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
                    <div className="route-summary">
                      <div className="route-info">
                        <div className="route-duration">
                          {formatDuration(route.duration)}
                        </div>
                        <div className="route-distance">
                          {formatDistance(route.distance)}
                        </div>
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
