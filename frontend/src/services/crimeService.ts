import axios from 'axios';

// Crime data types
export interface CrimeIncident {
  primary_type: string;
  date: string;
  beat: string;
  typeScore?: number;
  [key: string]: any;
}

// Define the manual crime scores
const crimeTypesList = [
  'arson', 'assault', 'battery', 'burglary', 'criminal damage', 'criminal trespass',
  'deceptive practice', 'gambling', 'homicide', 'intimidation', 'interference with public officer',
  'kidnapping', 'liquor law violation', 'narcotics', 'obscenity', 'offense involving children',
  'other offense', 'prostitution', 'public indecency', 'public peace violation', 'robbery',
  'sex offense', 'stalking', 'theft', 'weapons violation', 'motor vehicle theft',
  'human trafficking', 'arrest', 'domestic violence'
];

const scoresArray = [7, 8, 8, 6, 5, 5, 9, 4, 10, 8, 7, 9, 3, 7, 10, 2, 5, 4, 1, 2, 9, 7, 8, 5, 9, 6, 8, 3, 8];

// Build crime type → score lookup
const crimeScores: { [key: string]: number } = {};
for (let i = 0; i < crimeTypesList.length && i < scoresArray.length; i++) {
  crimeScores[crimeTypesList[i]] = scoresArray[i];
}

// Cache for crime data to avoid refetching
let crimeDataCache: CrimeIncident[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

// Service for handling crime data
export const crimeService = {
  // Fetch crime data from Chicago API
  fetchCrimeData: async (): Promise<CrimeIncident[]> => {
    // Check if we already have cached data that's not too old
    const now = Date.now();
    if (crimeDataCache.length > 0 && (now - lastFetchTime) < CACHE_TTL) {
      console.log('Using cached crime data');
      return crimeDataCache;
    }

    try {
      console.log('Fetching fresh crime data from Chicago API...');
      // Use the City of Chicago crime API - limit to 5,000 most recent incidents for performance
      const url = 'https://data.cityofchicago.org/resource/ijzp-q8t2.json?$limit=5000&$order=date DESC';
      
      const response = await axios.get(url);
      const crimeData: CrimeIncident[] = response.data;
      
      // Process the crime data (assign severity scores)
      processCrimes(crimeData);
      
      // Update cache
      crimeDataCache = crimeData;
      lastFetchTime = now;
      
      console.log(`✅ Loaded ${crimeData.length} crime incidents`);
      return crimeData;
    } catch (error) {
      console.error('Error fetching crime data:', error);
      // Return cached data if available, even if outdated
      if (crimeDataCache.length > 0) {
        console.log('Using outdated cached crime data due to fetch error');
        return crimeDataCache;
      }
      return [];
    }
  },

  // Get safety score for a route based on the beats it passes through
  getRouteSafetyScore: (route: any, crimeData: CrimeIncident[]): number => {
    // Extract waypoints from route
    if (!route || !route.coordinates || route.coordinates.length === 0) {
      return 0;
    }

    // Find beats that this route passes through
    // For now, we'll use a simplified approach:
    // 1. Convert coordinates to police beats
    // 2. Get average crime score for each beat
    // 3. Calculate weighted safety score for the route

    // This is a placeholder function - we'll need to map coordinates to beats
    const beats = getBeatsFromCoordinates(route.coordinates);
    
    // Get average crime score for each beat
    let totalBeatScore = 0;
    beats.forEach(beat => {
      const beatScore = avgCrimeScorePerDay(crimeData, beat);
      totalBeatScore += beatScore;
    });

    // Calculate overall safety score (inverted - higher is safer)
    // We'll use a scale of 0-100
    const avgBeatScore = beats.length > 0 ? totalBeatScore / beats.length : 0;
    const safetyScore = Math.max(0, 100 - (avgBeatScore * 10));
    
    return Math.round(safetyScore);
  },

  // Evaluate and rank routes by safety
  rankRoutesBySafety: async (routes: any[]): Promise<any[]> => {
    if (!routes || routes.length === 0) {
      return [];
    }

    try {
      // Get crime data
      const crimeData = await crimeService.fetchCrimeData();
      
      // Calculate safety score for each route
      const routesWithScores = routes.map(route => {
        const safetyScore = crimeService.getRouteSafetyScore(route, crimeData);
        return {
          ...route,
          safetyScore
        };
      });
      
      // Sort by safety score (highest first)
      routesWithScores.sort((a, b) => b.safetyScore - a.safetyScore);
      
      return routesWithScores;
    } catch (error) {
      console.error('Error ranking routes by safety:', error);
      return routes; // Return original routes if evaluation fails
    }
  }
};

// Process crimes to assign safety scores
function processCrimes(crimes: CrimeIncident[]): void {
  const dateField = findDateField(crimes[0]);
  if (!dateField) {
    console.error('No valid date field found in crime data!');
    return;
  }

  crimes.forEach(crime => {
    const typeScore = lookupSeverity(crime.primary_type, crimeScores);
    crime.typeScore = typeScore;
  });
}

// Find the average crime score per day for a given beat
function avgCrimeScorePerDay(crimeData: CrimeIncident[], beatNumber: string): number {
  const beatCrimes = crimeData.filter(c => c.beat === beatNumber);

  if (beatCrimes.length === 0) return 0;

  const dates = beatCrimes
    .map(c => new Date(c.date))
    .filter(d => !isNaN(d.getTime()));
    
  if (dates.length === 0) return 0;

  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  const daysSpan = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSpan <= 0) return 0;

  const totalScore = beatCrimes.reduce((sum, c) => sum + (c.typeScore || 0), 0);
  return totalScore / daysSpan;
}

// Lookup crime type severity
function lookupSeverity(crimeType: string | undefined, scores: { [key: string]: number }): number {
  if (!crimeType) return 1;
  const key = crimeType.toLowerCase();
  return scores[key] || 1;
}

// Auto-detect which field is the date
function findDateField(row: any): string | null {
  if (!row) return null;
  
  const possibleFields = Object.keys(row);
  for (const field of possibleFields) {
    const dateTest = new Date(row[field]);
    if (!isNaN(dateTest.getTime())) {
      return field;
    }
  }
  return null;
}

// Map coordinates to Chicago police beats
// This is a simplified placeholder implementation
// In a real implementation, we'd need GIS data for Chicago police beats
function getBeatsFromCoordinates(coordinates: [number, number][]): string[] {
  // For now, return some sample beats based on coordinates
  // Chicago beats are 4-digit identifiers like "0313"
  
  // This is a very simplified mapping for the demo:
  // We'll use the first two digits based on location quadrants of the city
  const beats = new Set<string>();
  
  coordinates.forEach(([lng, lat]) => {
    // Very rough mapping of coordinates to Chicago areas
    const latNormalized = (lat - 41.65) / (42.02 - 41.65); // Roughly Chicago's lat bounds
    const lngNormalized = (lng - (-87.94)) / ((-87.52) - (-87.94)); // Roughly Chicago's lng bounds
    
    let beatPrefix = '';
    
    // Generate a "fake" beat based on position in the city
    if (latNormalized < 0.5) {
      beatPrefix = lngNormalized < 0.5 ? '12' : '05'; 
    } else {
      beatPrefix = lngNormalized < 0.5 ? '25' : '19';
    }
    
    // Add some variation for adjacent coordinates
    const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    beats.add(beatPrefix + randomSuffix);
  });
  
  return Array.from(beats);
}

export default crimeService;
