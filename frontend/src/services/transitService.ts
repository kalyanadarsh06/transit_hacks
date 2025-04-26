import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://Safe-Transit-Chicago.onrender.com/api'
    : 'http://localhost:3001/api';

// Types for API responses
export interface BusRoute {
  rt: string;       // Route number
  rtnm: string;     // Route name
  rtclr: string;    // Route color
  rtdd: string;     // Route display designation
}

export interface BusRouteResponse {
  routes: BusRoute[];
}

export interface BusPrediction {
  vid: string;      // Vehicle ID
  tmstmp: string;   // Timestamp of prediction
  rt: string;       // Route
  des: string;      // Destination
  prdtm: string;    // Predicted time of arrival/departure
  dly: boolean;     // Delayed boolean
  dstp: number;     // Distance to stop in feet
  stpnm: string;    // Stop name
  stpid: string;    // Stop ID
  rtdir: string;    // Route direction
}

export interface BusPredictionResponse {
  predictions: BusPrediction[];
}

export interface BusVehicle {
  vid: string;      // Vehicle ID
  tmstmp: string;   // Timestamp
  lat: string;      // Latitude
  lon: string;      // Longitude
  hdg: string;      // Heading
  rt: string;       // Route
  des: string;      // Destination
  pdist: number;    // Pattern distance
  dly: boolean;     // Delayed boolean
}

export interface BusVehicleResponse {
  vehicles: BusVehicle[];
}

export interface TrainArrival {
  staId: string;      // Station ID
  stpId: string;      // Stop ID
  staNm: string;      // Station Name
  stpDe: string;      // Stop Description
  rn: string;         // Run Number
  rt: string;         // Route/Line Code (e.g., "G" for Green)
  destNm: string;     // Destination Name
  arrT: string;       // Arrival Time
  isApp: string;      // Is Approaching (0/1)
  isDly: string;      // Is Delayed (0/1)
  lat: string | null; // Latitude
  lon: string | null; // Longitude
}

export interface TrainArrivalResponse {
  arrivals: TrainArrival[];
}

export interface TrainLocation {
  rn: string;        // Run Number
  destNm: string;    // Destination Name
  nextStaNm: string; // Next Station Name
  arrT: string;      // Arrival Time
  lat: string;       // Latitude
  lon: string;       // Longitude
  heading: string;   // Heading
}

export interface TrainLocationResponse {
  locations: TrainLocation[];
}

export interface RouteRequest {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  prioritizeSafety?: boolean;
}

// Create API utility functions first to avoid circular references
const getBusRoutesApi = async (): Promise<BusRouteResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/transit/bus/routes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bus routes:', error);
    throw error;
  }
};

const getBusVehiclesApi = async (routeId: string): Promise<BusVehicleResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/transit/bus/routes/${routeId}/vehicles`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bus vehicles for route ${routeId}:`, error);
    throw error;
  }
};

const getBusPredictionsByRouteApi = async (routeId: string): Promise<BusPredictionResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/transit/bus/routes/${routeId}/predictions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bus predictions for route ${routeId}:`, error);
    throw error;
  }
};

const getBusPredictionsByStopApi = async (stopId: string): Promise<BusPredictionResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/transit/bus/stops/${stopId}/predictions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bus predictions for stop ${stopId}:`, error);
    throw error;
  }
};

const getTrainArrivalsApi = async (stationId: string): Promise<TrainArrivalResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/transit/train/stations/${stationId}/arrivals`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching train arrivals for station ${stationId}:`, error);
    throw error;
  }
};

const getTrainLocationsApi = async (routeCode: string): Promise<TrainLocationResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/transit/train/routes/${routeCode}/locations`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching train locations for route ${routeCode}:`, error);
    throw error;
  }
};



// Calculate route between two points
const getRouteApi = async (routeRequest: RouteRequest) => {
  try {
    const { origin, destination, prioritizeSafety } = routeRequest;
    const response = await axios.get(`${API_BASE_URL}/transit/route`, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        prioritizeSafety: prioritizeSafety || false
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating route:', error);
    throw error;
  }
};

// Transit service API calls
export const transitService = {
  // Get all bus routes
  getBusRoutes: getBusRoutesApi,

  // Get bus predictions for a specific route
  getBusPredictionsByRoute: getBusPredictionsByRouteApi,

  // Get bus vehicles (locations) for a specific route
  getBusVehicles: getBusVehiclesApi,

  // Get bus predictions for a specific stop
  getBusPredictionsByStop: getBusPredictionsByStopApi,

  // Get train arrivals for a specific station
  getTrainArrivals: getTrainArrivalsApi,

  // Get train locations for a specific route/line
  getTrainLocations: getTrainLocationsApi,



  // Calculate route between two points
  getRoute: getRouteApi,
  
  // Get multiple route options with categorization by transit type
  getRouteOptions: async (origin: string, destination: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transit/routes`, {
        params: {
          origin,
          destination
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting route options:', error);
      throw error;
    }
  },

  // Legacy methods for backward compatibility
  getBusData: async (routeId?: string): Promise<BusRouteResponse | BusVehicleResponse> => {
    try {
      if (routeId) {
        return await getBusVehiclesApi(routeId);
      } else {
        return await getBusRoutesApi();
      }
    } catch (error) {
      console.error('Error fetching bus data:', error);
      throw error;
    }
  },

  getTrainData: async (stationId?: string): Promise<TrainArrivalResponse> => {
    try {
      if (stationId) {
        return await getTrainArrivalsApi(stationId);
      } else {
        // Return empty response if no station ID provided
        return { arrivals: [] };
      }
    } catch (error) {
      console.error('Error fetching train data:', error);
      throw error;
    }
  }
};

export default transitService;
