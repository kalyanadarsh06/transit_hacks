"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
// For walking directions
const MAPBOX_WALKING_PROFILE = 'mapbox/walking';
// Chicago coordinates (approximately downtown)
const CHICAGO_BOUNDS = '-87.94,41.64;-87.52,42.02';
// CTA bus API key from our environment
const CTA_BUS_API_KEY = process.env.CTA_BUS_API_KEY;
// CTA train API key from our environment
const CTA_TRAIN_API_KEY = process.env.CTA_TRAIN_API_KEY;
async function createSyntheticTransitRoutes(walkingRoute, origin, destination) {
    // Clone the walking route to use as a base
    const baseRoute = JSON.parse(JSON.stringify(walkingRoute));
    // Get the total distance of the route
    const totalDistance = baseRoute.distance;
    // Initialize arrays for different types of routes
    const busRoutes = [];
    const trainRoutes = [];
    const mixedRoutes = [];
    // Coordinates format: [lng, lat]
    const [originLng, originLat] = origin.split(',').map(Number);
    const [destLng, destLat] = destination.split(',').map(Number);
    // Get nearby bus routes
    const nearbyBusRoutes = ['22', '6', '147', '151', '8']; // Common Chicago routes
    // Create a bus route option
    if (totalDistance > 1000) { // Only if over 1km
        const busRoute = JSON.parse(JSON.stringify(baseRoute));
        busRoute.duration = busRoute.duration * 0.6; // Buses are faster than walking
        // Add transit details to the first leg
        if (busRoute.legs && busRoute.legs.length > 0) {
            const leg = busRoute.legs[0];
            // Take 20% of the route for walking to the bus stop
            const walkToStopDistance = leg.distance * 0.2;
            const walkToStopDuration = leg.duration * 0.2;
            // Take 60% for the bus ride
            const busRideDistance = leg.distance * 0.6;
            const busRideDuration = leg.duration * 0.4; // Faster than walking
            // Take 20% for walking to destination
            const walkToDestDistance = leg.distance * 0.2;
            const walkToDestDuration = leg.duration * 0.2;
            // Create synthetic steps
            leg.steps = [
                {
                    distance: walkToStopDistance,
                    duration: walkToStopDuration,
                    geometry: leg.steps[0]?.geometry || null,
                    maneuver: {
                        type: 'depart',
                        instruction: 'Walk to the nearest bus stop',
                        bearing_after: 0
                    },
                    mode: 'walking'
                },
                {
                    distance: busRideDistance,
                    duration: busRideDuration,
                    geometry: leg.geometry,
                    maneuver: {
                        type: 'notification',
                        instruction: `Take the ${nearbyBusRoutes[0]} Bus toward Downtown`
                    },
                    mode: 'transit',
                    transit_details: {
                        vehicle_type: 'bus',
                        route: nearbyBusRoutes[0],
                        headsign: 'Downtown',
                        stops: 5,
                        eta: '5 mins'
                    }
                },
                {
                    distance: walkToDestDistance,
                    duration: walkToDestDuration,
                    geometry: leg.steps[leg.steps.length - 1]?.geometry || null,
                    maneuver: {
                        type: 'arrive',
                        instruction: 'Walk to your destination',
                        bearing_before: 0
                    },
                    mode: 'walking'
                }
            ];
        }
        busRoutes.push(busRoute);
    }
    // Create a train route option
    if (totalDistance > 2000) { // Only if over 2km
        const trainRoute = JSON.parse(JSON.stringify(baseRoute));
        trainRoute.duration = trainRoute.duration * 0.5; // Trains are faster than walking
        // Add transit details to the first leg
        if (trainRoute.legs && trainRoute.legs.length > 0) {
            const leg = trainRoute.legs[0];
            // Take 30% of the route for walking to the train station
            const walkToStationDistance = leg.distance * 0.3;
            const walkToStationDuration = leg.duration * 0.3;
            // Take 40% for the train ride
            const trainRideDistance = leg.distance * 0.4;
            const trainRideDuration = leg.duration * 0.2; // Faster than walking
            // Take 30% for walking to destination
            const walkToDestDistance = leg.distance * 0.3;
            const walkToDestDuration = leg.duration * 0.3;
            // Create synthetic steps
            leg.steps = [
                {
                    distance: walkToStationDistance,
                    duration: walkToStationDuration,
                    geometry: leg.steps[0]?.geometry || null,
                    maneuver: {
                        type: 'depart',
                        instruction: 'Walk to the nearest train station',
                        bearing_after: 0
                    },
                    mode: 'walking'
                },
                {
                    distance: trainRideDistance,
                    duration: trainRideDuration,
                    geometry: leg.geometry,
                    maneuver: {
                        type: 'notification',
                        instruction: 'Take the Red Line toward Howard for 3 stops'
                    },
                    mode: 'transit',
                    transit_details: {
                        vehicle_type: 'train',
                        route: 'Red',
                        headsign: 'Howard',
                        stops: 3,
                        eta: '3 mins'
                    }
                },
                {
                    distance: walkToDestDistance,
                    duration: walkToDestDuration,
                    geometry: leg.steps[leg.steps.length - 1]?.geometry || null,
                    maneuver: {
                        type: 'arrive',
                        instruction: 'Walk to your destination',
                        bearing_before: 0
                    },
                    mode: 'walking'
                }
            ];
        }
        trainRoutes.push(trainRoute);
    }
    // Create a mixed route option (bus + train)
    if (totalDistance > 3000) { // Only if over 3km
        const mixedRoute = JSON.parse(JSON.stringify(baseRoute));
        mixedRoute.duration = mixedRoute.duration * 0.45; // Combined transit is fastest
        // Add transit details to the first leg
        if (mixedRoute.legs && mixedRoute.legs.length > 0) {
            const leg = mixedRoute.legs[0];
            // Take 20% of the route for walking to the bus stop
            const walkToBusDistance = leg.distance * 0.2;
            const walkToBusDuration = leg.duration * 0.2;
            // Take 30% for the bus ride
            const busRideDistance = leg.distance * 0.3;
            const busRideDuration = leg.duration * 0.2;
            // Take 30% for the train ride
            const trainRideDistance = leg.distance * 0.3;
            const trainRideDuration = leg.duration * 0.15;
            // Take 20% for walking to destination
            const walkToDestDistance = leg.distance * 0.2;
            const walkToDestDuration = leg.duration * 0.2;
            // Create synthetic steps
            leg.steps = [
                {
                    distance: walkToBusDistance,
                    duration: walkToBusDuration,
                    geometry: leg.steps[0]?.geometry || null,
                    maneuver: {
                        type: 'depart',
                        instruction: 'Walk to the nearest bus stop',
                        bearing_after: 0
                    },
                    mode: 'walking'
                },
                {
                    distance: busRideDistance,
                    duration: busRideDuration,
                    geometry: leg.geometry,
                    maneuver: {
                        type: 'notification',
                        instruction: `Take the ${nearbyBusRoutes[1]} Bus toward Clark/Lake`
                    },
                    mode: 'transit',
                    transit_details: {
                        vehicle_type: 'bus',
                        route: nearbyBusRoutes[1],
                        headsign: 'Clark/Lake',
                        stops: 4,
                        eta: '4 mins'
                    }
                },
                {
                    distance: trainRideDistance,
                    duration: trainRideDuration,
                    geometry: leg.geometry,
                    maneuver: {
                        type: 'notification',
                        instruction: 'Take the Blue Line toward O\'Hare for 2 stops'
                    },
                    mode: 'transit',
                    transit_details: {
                        vehicle_type: 'train',
                        route: 'Blue',
                        headsign: 'O\'Hare',
                        stops: 2,
                        eta: '5 mins'
                    }
                },
                {
                    distance: walkToDestDistance,
                    duration: walkToDestDuration,
                    geometry: leg.steps[leg.steps.length - 1]?.geometry || null,
                    maneuver: {
                        type: 'arrive',
                        instruction: 'Walk to your destination',
                        bearing_before: 0
                    },
                    mode: 'walking'
                }
            ];
        }
        mixedRoutes.push(mixedRoute);
    }
    // Add the walking route as an option
    const walkingRouteOption = JSON.parse(JSON.stringify(baseRoute));
    walkingRouteOption.transit_types = ['walking'];
    // Combine all routes
    return [...busRoutes, ...trainRoutes, ...mixedRoutes, walkingRouteOption];
}
/**
 * Controller for routing functionality
 */
exports.default = {
    /**
     * Get transit routes between two points
     * @route GET /api/transit/routes
     */
    getRoutes: async (req, res) => {
        try {
            const { origin, destination } = req.query;
            if (!origin || !destination) {
                return res.status(400).json({ error: 'Origin and destination are required' });
            }
            console.log(`Finding routes from ${origin} to ${destination}`);
            // Get walking directions as a base
            const mapboxDirectionsUrl = `https://api.mapbox.com/directions/v5/${MAPBOX_WALKING_PROFILE}/${origin};${destination}`;
            const walkingResponse = await axios_1.default.get(mapboxDirectionsUrl, {
                params: {
                    access_token: process.env.MAPBOX_API_KEY,
                    geometries: 'geojson',
                    steps: true,
                    alternatives: false,
                    overview: 'full',
                    annotations: 'duration,distance',
                }
            });
            const walkingRoute = walkingResponse.data.routes[0];
            if (!walkingRoute) {
                return res.status(404).json({ error: 'No routes found' });
            }
            // Create synthetic transit routes using the walking route as a base
            // This is a workaround since Mapbox doesn't directly support public transit routing
            const syntheticRoutes = await createSyntheticTransitRoutes(walkingRoute, origin, destination);
            if (syntheticRoutes.length === 0) {
                return res.status(404).json({ error: 'No transit routes found' });
            }
            // Categorize routes by transit type
            const categorizedRoutes = categorizeRoutesByTransitType(syntheticRoutes);
            res.json({
                origin,
                destination,
                ...categorizedRoutes
            });
        }
        catch (error) {
            console.error('Error getting routes:', error);
            res.status(500).json({ error: 'Failed to get routes' });
        }
    }
};
/**
 * Enhance routes with transit data from CTA APIs
 */
async function enhanceRoutesWithTransitData(routes) {
    // Clone the routes to avoid modifying the original
    const enhancedRoutes = JSON.parse(JSON.stringify(routes));
    for (const route of enhancedRoutes) {
        const { legs } = route;
        // Each route has one or more legs
        for (const leg of legs) {
            const { steps } = leg;
            // For each step in the leg
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                // Check if this is a transit step
                if (step.maneuver && step.maneuver.type === 'notification' && step.maneuver.instruction.includes('Take the')) {
                    // Extract transit information from the instruction
                    const transitInfo = extractTransitInfo(step.maneuver.instruction);
                    if (transitInfo) {
                        step.transit_details = transitInfo;
                        // Add real-time ETA if possible
                        try {
                            if (transitInfo.vehicle_type === 'bus') {
                                // Get real-time bus data
                                // This would call your bus controller
                                // For now, use a placeholder
                                step.transit_details.eta = '5 mins';
                            }
                            else if (transitInfo.vehicle_type === 'train') {
                                // Get real-time train data
                                // This would call your train controller
                                // For now, use a placeholder
                                step.transit_details.eta = '3 mins';
                            }
                        }
                        catch (error) {
                            console.error('Error getting real-time data:', error);
                        }
                    }
                }
            }
        }
    }
    return enhancedRoutes;
}
/**
 * Extract transit information from Mapbox direction instructions
 */
function extractTransitInfo(instruction) {
    // Example: "Take the Red Line toward Howard for 4 stops"
    // Example: "Take the 22 Bus toward Clark & Howard"
    const busRegex = /Take the (\d+) Bus toward (.+?)( for )?/i;
    const trainRegex = /Take the ([A-Za-z]+) Line toward (.+?)( for )?/i;
    let match;
    // Check if this is a bus instruction
    match = instruction.match(busRegex);
    if (match) {
        return {
            vehicle_type: 'bus',
            route: match[1],
            headsign: match[2],
            stops: extractStops(instruction),
        };
    }
    // Check if this is a train instruction
    match = instruction.match(trainRegex);
    if (match) {
        return {
            vehicle_type: 'train',
            route: match[1],
            headsign: match[2],
            stops: extractStops(instruction),
        };
    }
    return null;
}
/**
 * Extract number of stops from an instruction
 */
function extractStops(instruction) {
    const stopsRegex = /for (\d+) stops?/i;
    const match = instruction.match(stopsRegex);
    if (match) {
        return parseInt(match[1], 10);
    }
    return null;
}
/**
 * Categorize routes by main transit type
 */
function categorizeRoutesByTransitType(routes) {
    const busRoutes = [];
    const trainRoutes = [];
    const mixedRoutes = [];
    const walkingRoutes = [];
    for (const route of routes) {
        let hasBus = false;
        let hasTrain = false;
        let isWalkingOnly = true;
        // Check each leg and step for transit types
        for (const leg of route.legs) {
            for (const step of leg.steps) {
                if (step.mode === 'transit' || (step.transit_details && step.transit_details.vehicle_type)) {
                    isWalkingOnly = false;
                    if (step.transit_details && step.transit_details.vehicle_type === 'bus') {
                        hasBus = true;
                    }
                    else if (step.transit_details && step.transit_details.vehicle_type === 'train') {
                        hasTrain = true;
                    }
                }
            }
        }
        // Categorize the route based on transit types
        if (isWalkingOnly) {
            // Mark as a walking route
            route.transit_types = ['walking'];
            walkingRoutes.push(route);
        }
        else if (hasBus && !hasTrain) {
            route.transit_types = ['bus'];
            busRoutes.push(route);
        }
        else if (hasTrain && !hasBus) {
            route.transit_types = ['train'];
            trainRoutes.push(route);
        }
        else if (hasBus && hasTrain) {
            route.transit_types = ['bus', 'train'];
            mixedRoutes.push(route);
        }
    }
    // Make sure we have at least one route in each category
    // If we don't have any bus routes but have train routes, add a bus option
    if (busRoutes.length === 0 && trainRoutes.length > 0) {
        // Clone a train route and modify it to be a bus route
        const fakeBusRoute = JSON.parse(JSON.stringify(trainRoutes[0]));
        fakeBusRoute.transit_types = ['bus'];
        // Replace train steps with bus steps
        for (const leg of fakeBusRoute.legs) {
            for (const step of leg.steps) {
                if (step.transit_details && step.transit_details.vehicle_type === 'train') {
                    step.transit_details.vehicle_type = 'bus';
                    step.transit_details.route = '22';
                    step.maneuver.instruction = step.maneuver.instruction.replace('Red Line', 'Bus 22').replace('Blue Line', 'Bus 22');
                }
            }
        }
        busRoutes.push(fakeBusRoute);
    }
    // If we don't have any train routes but have bus routes, add a train option
    if (trainRoutes.length === 0 && busRoutes.length > 0) {
        // Clone a bus route and modify it to be a train route
        const fakeTrainRoute = JSON.parse(JSON.stringify(busRoutes[0]));
        fakeTrainRoute.transit_types = ['train'];
        // Replace bus steps with train steps
        for (const leg of fakeTrainRoute.legs) {
            for (const step of leg.steps) {
                if (step.transit_details && step.transit_details.vehicle_type === 'bus') {
                    step.transit_details.vehicle_type = 'train';
                    step.transit_details.route = 'Red';
                    step.maneuver.instruction = step.maneuver.instruction.replace(/Bus \d+/, 'Red Line');
                }
            }
        }
        trainRoutes.push(fakeTrainRoute);
    }
    return {
        busRoutes,
        trainRoutes,
        mixedRoutes: [...mixedRoutes, ...walkingRoutes],
        allRoutes: routes
    };
}
//# sourceMappingURL=routingController.js.map