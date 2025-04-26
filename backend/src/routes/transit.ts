import express, { Router, Request, Response, NextFunction } from 'express';
import busController from '../controllers/busController';
import trainController from '../controllers/trainController';
import routingController from '../controllers/routingController';

const router: Router = express.Router();

// Wrap controller methods to properly handle Express 5 routing
function wrapController(fn: (req: Request, res: Response) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

// Bus Routes - These controllers handle bus-related endpoints
router.get('/bus/routes', wrapController(busController.getRoutes));
router.get('/bus/routes/:routeId/directions', wrapController(busController.getDirections));
router.get('/bus/routes/:routeId/stops', wrapController(busController.getStops));
router.get('/bus/routes/:routeId/vehicles', wrapController(busController.getVehicles));
router.get('/bus/routes/:routeId/predictions', wrapController(busController.getPredictionsByRoute));
router.get('/bus/stops/:stopId/predictions', wrapController(busController.getPredictionsByStop));

// Train Routes - These controllers handle train-related endpoints
router.get('/train/stations', wrapController(trainController.getAllStations));
router.get('/train/stations/:stationId/arrivals', wrapController(trainController.getArrivalsByStation));
router.get('/train/stops/:stopId/arrivals', wrapController(trainController.getArrivalsByStop));
router.get('/train/routes/:routeCode/arrivals', wrapController(trainController.getArrivalsByRoute));
router.get('/train/routes/:routeCode/locations', wrapController(trainController.getTrainLocations));
router.get('/train/runs/:runNumber/follow', wrapController(trainController.getFollowTrain));

/**
 * @route   GET /api/transit/divvy
 * @desc    Get Divvy bike-sharing station information
 * @access  Public
 */
router.get('/divvy', wrapController(async (req: Request, res: Response) => {
  // TODO: Implement Divvy API integration
  res.status(200).json({ message: 'Divvy bike information endpoint' });
}));

/**
 * @route   GET /api/transit/route
 * @desc    Get route between two points (legacy endpoint)
 * @access  Public
 */
router.get('/route', wrapController(async (req: Request, res: Response) => {
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
router.get('/routes', wrapController(routingController.getRoutes));

export default router;
