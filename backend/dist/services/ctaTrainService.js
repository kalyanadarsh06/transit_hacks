"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Using the Train Tracker API key from environment variables
const API_KEY = process.env.CTA_TRAIN_API_KEY || '7775f2896b184955ada165c878e29f26';
const BASE_URL = 'https://lapi.transitchicago.com/api/1.0';
// CTA Train API Service
const ctaTrainService = {
    // Get train arrivals by station
    getArrivalsByStation: async (stationId) => {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/ttarrivals.aspx`, {
                params: {
                    key: API_KEY,
                    mapid: stationId,
                    outputType: 'JSON'
                }
            });
            if (response.data && response.data.ctatt && response.data.ctatt.eta) {
                return response.data.ctatt.eta;
            }
            return [];
        }
        catch (error) {
            console.error(`Error fetching train arrivals for station ${stationId}:`, error);
            throw error;
        }
    },
    // Get train arrivals by stop
    getArrivalsByStop: async (stopId) => {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/ttarrivals.aspx`, {
                params: {
                    key: API_KEY,
                    stpid: stopId,
                    outputType: 'JSON'
                }
            });
            if (response.data && response.data.ctatt && response.data.ctatt.eta) {
                return response.data.ctatt.eta;
            }
            return [];
        }
        catch (error) {
            console.error(`Error fetching train arrivals for stop ${stopId}:`, error);
            throw error;
        }
    },
    // Get train arrivals for a specific line/route
    getArrivalsByRoute: async (routeCode) => {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/ttarrivals.aspx`, {
                params: {
                    key: API_KEY,
                    rt: routeCode,
                    outputType: 'JSON'
                }
            });
            if (response.data && response.data.ctatt && response.data.ctatt.eta) {
                return response.data.ctatt.eta;
            }
            return [];
        }
        catch (error) {
            console.error(`Error fetching train arrivals for route ${routeCode}:`, error);
            throw error;
        }
    },
    // Get follow-this-train data for a specific run number
    getFollowTrain: async (runNumber) => {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/ttfollow.aspx`, {
                params: {
                    key: API_KEY,
                    runnumber: runNumber,
                    outputType: 'JSON'
                }
            });
            if (response.data && response.data.ctatt && response.data.ctatt.eta) {
                return response.data.ctatt.eta;
            }
            return [];
        }
        catch (error) {
            console.error(`Error fetching follow-this-train data for run ${runNumber}:`, error);
            throw error;
        }
    },
    // Get train locations for a specific route
    getTrainLocations: async (routeCode) => {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/ttpositions.aspx`, {
                params: {
                    key: API_KEY,
                    rt: routeCode,
                    outputType: 'JSON'
                }
            });
            if (response.data && response.data.ctatt && response.data.ctatt.route && response.data.ctatt.route[0].train) {
                return response.data.ctatt.route[0].train;
            }
            return [];
        }
        catch (error) {
            console.error(`Error fetching train locations for route ${routeCode}:`, error);
            throw error;
        }
    },
    // Get list of all train stations (uses a static GTFS data endpoint)
    getAllStations: async () => {
        try {
            // Note: This endpoint typically doesn't require an API key
            // The URL below is a placeholder - CTA might provide this data via GTFS feeds
            const response = await axios_1.default.get('https://data.cityofchicago.org/resource/8pix-ypme.json');
            return response.data;
        }
        catch (error) {
            console.error('Error fetching train stations:', error);
            throw error;
        }
    }
};
exports.default = ctaTrainService;
//# sourceMappingURL=ctaTrainService.js.map