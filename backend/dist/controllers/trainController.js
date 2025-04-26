"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainController = void 0;
const ctaTrainService_1 = __importDefault(require("../services/ctaTrainService"));
// Train Controller
exports.trainController = {
    // Get train arrivals by station
    getArrivalsByStation: async (req, res) => {
        const { stationId } = req.params;
        if (!stationId) {
            return res.status(400).json({ error: 'Station ID is required' });
        }
        try {
            const arrivals = await ctaTrainService_1.default.getArrivalsByStation(stationId);
            res.status(200).json({ arrivals });
        }
        catch (error) {
            console.error(`Error in getArrivalsByStation controller for station ${stationId}:`, error);
            res.status(500).json({ error: 'Failed to fetch train arrivals' });
        }
    },
    // Get train arrivals by stop
    getArrivalsByStop: async (req, res) => {
        const { stopId } = req.params;
        if (!stopId) {
            return res.status(400).json({ error: 'Stop ID is required' });
        }
        try {
            const arrivals = await ctaTrainService_1.default.getArrivalsByStop(stopId);
            res.status(200).json({ arrivals });
        }
        catch (error) {
            console.error(`Error in getArrivalsByStop controller for stop ${stopId}:`, error);
            res.status(500).json({ error: 'Failed to fetch train arrivals' });
        }
    },
    // Get train arrivals by route
    getArrivalsByRoute: async (req, res) => {
        const { routeCode } = req.params;
        if (!routeCode) {
            return res.status(400).json({ error: 'Route code is required' });
        }
        try {
            const arrivals = await ctaTrainService_1.default.getArrivalsByRoute(routeCode);
            res.status(200).json({ arrivals });
        }
        catch (error) {
            console.error(`Error in getArrivalsByRoute controller for route ${routeCode}:`, error);
            res.status(500).json({ error: 'Failed to fetch train arrivals' });
        }
    },
    // Get train locations for a route
    getTrainLocations: async (req, res) => {
        const { routeCode } = req.params;
        if (!routeCode) {
            return res.status(400).json({ error: 'Route code is required' });
        }
        try {
            const locations = await ctaTrainService_1.default.getTrainLocations(routeCode);
            res.status(200).json({ locations });
        }
        catch (error) {
            console.error(`Error in getTrainLocations controller for route ${routeCode}:`, error);
            res.status(500).json({ error: 'Failed to fetch train locations' });
        }
    },
    // Get "Follow This Train" information
    getFollowTrain: async (req, res) => {
        const { runNumber } = req.params;
        if (!runNumber) {
            return res.status(400).json({ error: 'Run number is required' });
        }
        try {
            const trainData = await ctaTrainService_1.default.getFollowTrain(runNumber);
            res.status(200).json({ trainData });
        }
        catch (error) {
            console.error(`Error in getFollowTrain controller for run ${runNumber}:`, error);
            res.status(500).json({ error: 'Failed to fetch train information' });
        }
    },
    // Get all train stations
    getAllStations: async (_req, res) => {
        try {
            const stations = await ctaTrainService_1.default.getAllStations();
            res.status(200).json({ stations });
        }
        catch (error) {
            console.error('Error in getAllStations controller:', error);
            res.status(500).json({ error: 'Failed to fetch train stations' });
        }
    }
};
exports.default = exports.trainController;
//# sourceMappingURL=trainController.js.map