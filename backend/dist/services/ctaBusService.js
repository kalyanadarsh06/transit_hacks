"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Using the provided API key
const API_KEY = process.env.CTA_BUS_API_KEY || 'zg8kjD85Kb9qN8C3E9YAw4twp';
const BASE_URL = 'http://www.ctabustracker.com/bustime/api/v2';
// CTA Bus API Service
const ctaBusService = {
    // Get list of available bus routes
    getRoutes: async () => {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/getroutes`, {
                params: {
                    key: API_KEY,
                    format: 'json'
                }
            });
            if (response.data && response.data['bustime-response'] && response.data['bustime-response'].routes) {
                return response.data['bustime-response'].routes;
            }
            return [];
        }
        catch (error) {
            console.error('Error fetching bus routes:', error);
            throw error;
        }
    },
    // Get available directions for a route
    getDirections: async (routeId) => {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/getdirections`, {
                params: {
                    key: API_KEY,
                    rt: routeId,
                    format: 'json'
                }
            });
            if (response.data && response.data['bustime-response'] && response.data['bustime-response'].directions) {
                return response.data['bustime-response'].directions;
            }
            return [];
        }
        catch (error) {
            console.error(`Error fetching directions for route ${routeId}:`, error);
            throw error;
        }
    },
    // Get stops for a route and direction
    getStops: async (routeId, direction) => {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/getstops`, {
                params: {
                    key: API_KEY,
                    rt: routeId,
                    dir: direction,
                    format: 'json'
                }
            });
            if (response.data && response.data['bustime-response'] && response.data['bustime-response'].stops) {
                return response.data['bustime-response'].stops;
            }
            return [];
        }
        catch (error) {
            console.error(`Error fetching stops for route ${routeId} and direction ${direction}:`, error);
            throw error;
        }
    },
    // Get predictions for a stop
    getPredictions: async (stopId) => {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/getpredictions`, {
                params: {
                    key: API_KEY,
                    stpid: stopId,
                    format: 'json'
                }
            });
            if (response.data && response.data['bustime-response'] && response.data['bustime-response'].prd) {
                return response.data['bustime-response'].prd;
            }
            return [];
        }
        catch (error) {
            console.error(`Error fetching predictions for stop ${stopId}:`, error);
            throw error;
        }
    },
    // Get predictions for a specific route
    getPredictionsByRoute: async (routeId) => {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/getpredictions`, {
                params: {
                    key: API_KEY,
                    rt: routeId,
                    format: 'json'
                }
            });
            if (response.data && response.data['bustime-response'] && response.data['bustime-response'].prd) {
                return response.data['bustime-response'].prd;
            }
            return [];
        }
        catch (error) {
            console.error(`Error fetching predictions for route ${routeId}:`, error);
            throw error;
        }
    },
    // Get vehicle locations for a route
    getVehicles: async (routeId) => {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/getvehicles`, {
                params: {
                    key: API_KEY,
                    rt: routeId,
                    format: 'json'
                }
            });
            if (response.data && response.data['bustime-response'] && response.data['bustime-response'].vehicle) {
                return response.data['bustime-response'].vehicle;
            }
            return [];
        }
        catch (error) {
            console.error(`Error fetching vehicles for route ${routeId}:`, error);
            throw error;
        }
    }
};
exports.default = ctaBusService;
//# sourceMappingURL=ctaBusService.js.map