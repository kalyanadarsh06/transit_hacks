"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.busController = void 0;
const ctaBusService_1 = __importDefault(require("../services/ctaBusService"));
// Bus Controller
exports.busController = {
    // Get all available bus routes
    getRoutes: async (req, res) => {
        try {
            const routes = await ctaBusService_1.default.getRoutes();
            res.status(200).json({ routes });
        }
        catch (error) {
            console.error('Error in getRoutes controller:', error);
            res.status(500).json({ error: 'Failed to fetch bus routes' });
        }
    },
    // Get directions for a specific route
    getDirections: async (req, res) => {
        const { routeId } = req.params;
        if (!routeId) {
            return res.status(400).json({ error: 'Route ID is required' });
        }
        try {
            const directions = await ctaBusService_1.default.getDirections(routeId);
            res.status(200).json({ directions });
        }
        catch (error) {
            console.error(`Error in getDirections controller for route ${routeId}:`, error);
            res.status(500).json({ error: 'Failed to fetch directions' });
        }
    },
    // Get stops for a specific route and direction
    getStops: async (req, res) => {
        const { routeId } = req.params;
        const { direction } = req.query;
        if (!routeId || !direction) {
            return res.status(400).json({ error: 'Route ID and direction are required' });
        }
        try {
            const stops = await ctaBusService_1.default.getStops(routeId, direction);
            res.status(200).json({ stops });
        }
        catch (error) {
            console.error(`Error in getStops controller for route ${routeId}:`, error);
            res.status(500).json({ error: 'Failed to fetch stops' });
        }
    },
    // Get predictions for a specific stop
    getPredictionsByStop: async (req, res) => {
        const { stopId } = req.params;
        if (!stopId) {
            return res.status(400).json({ error: 'Stop ID is required' });
        }
        try {
            const predictions = await ctaBusService_1.default.getPredictions(stopId);
            res.status(200).json({ predictions });
        }
        catch (error) {
            console.error(`Error in getPredictionsByStop controller for stop ${stopId}:`, error);
            res.status(500).json({ error: 'Failed to fetch predictions' });
        }
    },
    // Get predictions for a specific route
    getPredictionsByRoute: async (req, res) => {
        const { routeId } = req.params;
        if (!routeId) {
            return res.status(400).json({ error: 'Route ID is required' });
        }
        try {
            const predictions = await ctaBusService_1.default.getPredictionsByRoute(routeId);
            res.status(200).json({ predictions });
        }
        catch (error) {
            console.error(`Error in getPredictionsByRoute controller for route ${routeId}:`, error);
            res.status(500).json({ error: 'Failed to fetch predictions' });
        }
    },
    // Get vehicle locations for a specific route
    getVehicles: async (req, res) => {
        const { routeId } = req.params;
        if (!routeId) {
            return res.status(400).json({ error: 'Route ID is required' });
        }
        try {
            const vehicles = await ctaBusService_1.default.getVehicles(routeId);
            res.status(200).json({ vehicles });
        }
        catch (error) {
            console.error(`Error in getVehicles controller for route ${routeId}:`, error);
            res.status(500).json({ error: 'Failed to fetch vehicle locations' });
        }
    },
};
exports.default = exports.busController;
//# sourceMappingURL=busController.js.map