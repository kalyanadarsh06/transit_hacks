"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const busController_1 = __importDefault(require("../controllers/busController"));
const trainController_1 = __importDefault(require("../controllers/trainController"));
const routingController_1 = __importDefault(require("../controllers/routingController"));
const router = express_1.default.Router();
// Wrap controller methods to properly handle Express 5 routing
function wrapController(fn) {
    return (req, res, next) => {
        fn(req, res).catch(next);
    };
}
// Bus Routes - These controllers handle bus-related endpoints
router.get('/bus/routes', wrapController(busController_1.default.getRoutes));
router.get('/bus/routes/:routeId/directions', wrapController(busController_1.default.getDirections));
router.get('/bus/routes/:routeId/stops', wrapController(busController_1.default.getStops));
router.get('/bus/routes/:routeId/vehicles', wrapController(busController_1.default.getVehicles));
router.get('/bus/routes/:routeId/predictions', wrapController(busController_1.default.getPredictionsByRoute));
router.get('/bus/stops/:stopId/predictions', wrapController(busController_1.default.getPredictionsByStop));
// Train Routes - These controllers handle train-related endpoints
router.get('/train/stations', wrapController(trainController_1.default.getAllStations));
router.get('/train/stations/:stationId/arrivals', wrapController(trainController_1.default.getArrivalsByStation));
router.get('/train/stops/:stopId/arrivals', wrapController(trainController_1.default.getArrivalsByStop));
router.get('/train/routes/:routeCode/arrivals', wrapController(trainController_1.default.getArrivalsByRoute));
router.get('/train/routes/:routeCode/locations', wrapController(trainController_1.default.getTrainLocations));
router.get('/train/runs/:runNumber/follow', wrapController(trainController_1.default.getFollowTrain));
/**
 * @route   GET /api/transit/divvy
 * @desc    Get Divvy bike-sharing station information
 * @access  Public
 */
router.get('/divvy', wrapController(async (req, res) => {
    // TODO: Implement Divvy API integration
    res.status(200).json({ message: 'Divvy bike information endpoint' });
}));
/**
 * @route   GET /api/transit/route
 * @desc    Get route between two points (legacy endpoint)
 * @access  Public
 */
router.get('/route', wrapController(async (req, res) => {
    const { origin, destination, prioritizeSafety } = req.query;
    if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination are required' });
    }
    // TODO: Implement route calculation logic
    // For now, return a mock response
    res.status(200).json({
        message: 'Route calculation endpoint',
        origin,
        destination,
        prioritizeSafety: prioritizeSafety === 'true',
        routes: [
            {
                id: 'route-1',
                duration: '35 mins',
                distance: '5.2 miles',
                steps: [
                    { type: 'walk', duration: '5 mins', description: 'Walk to bus stop' },
                    { type: 'bus', route: '22', duration: '15 mins', description: 'Take Bus 22 to Jackson' },
                    { type: 'train', line: 'Red', duration: '10 mins', description: 'Take Red Line to Monroe' },
                    { type: 'walk', duration: '5 mins', description: 'Walk to destination' }
                ]
            }
        ]
    });
}));
/**
 * @route   GET /api/transit/routes
 * @desc    Get multiple route options between two points with separate bus and train categorization
 * @access  Public
 */
router.get('/routes', wrapController(routingController_1.default.getRoutes));
exports.default = router;
//# sourceMappingURL=transit.js.map