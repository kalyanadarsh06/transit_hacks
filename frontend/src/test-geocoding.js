// Test script for Mapbox Geocoding
// Run with: node test-geocoding.js

// Sample addresses to test
const testAddresses = [
  "Willis Tower", 
  "Navy Pier", 
  "Wrigley Field",
  "University of Chicago",
  "Union Station",
  "Millennium Park",
  "1060 W Addison St" // Wrigley Field address
];

// Geocoding function
async function testGeocoding() {
  const mapboxToken = 'pk.eyJ1Ijoia2FseWFuYWRhcnNoIiwiYSI6ImNtOXlscWplZzB1enkyanBxYmo5ajUwdTEifQ.8HMxNe5OvC_fMejJsQmQMw';
  
  console.log('🧪 Testing Mapbox Geocoding with Chicago addresses');
  console.log('================================================');
  
  for (const address of testAddresses) {
    let searchAddress = address;
    if (!address.toLowerCase().includes('chicago') && 
        !address.toLowerCase().includes('il') && 
        !address.toLowerCase().includes('illinois')) {
      searchAddress = `${address}, Chicago, IL`;
    }
    
    console.log(`\nSearching for: "${searchAddress}"`);
    
    try {
      const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchAddress)}.json?access_token=${mapboxToken}&limit=1&country=US&bbox=-87.94,41.64,-87.52,42.02`;
      
      const response = await fetch(geocodingUrl);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const placeName = data.features[0].place_name;
        console.log(`✅ Found: ${placeName}`);
        console.log(`📍 Coordinates: [${lng}, ${lat}]`);
      } else {
        console.log(`❌ No results found for "${searchAddress}"`);
      }
    } catch (error) {
      console.log(`❌ Error geocoding "${searchAddress}": ${error.message}`);
    }
  }
}

// Run the test
testGeocoding();
