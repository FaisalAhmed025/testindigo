import Airline from "../../models/airlines";


let airLinesDataCache = [];
let cacheLastUpdated = null;
const CACHE_DURATION = 5 * 60 * 1000; // Cache duration in milliseconds (e.g., 5 minutes)

const fetchDataFromAirlines = async () => {
    const now = Date.now();

    // Check if the cache is stale
    if (!cacheLastUpdated || now - cacheLastUpdated > CACHE_DURATION) {
        try {
            const rows = await Airline.findAll();
            airLinesDataCache = rows.map((row) => row.toJSON());
            cacheLastUpdated = now; // Update the cache timestamp
        } catch (error) {
            console.error(error);
            // Optionally, you could throw the error or return cached data even if stale
            return [];
        }
    }

    return airLinesDataCache;
};

export default fetchDataFromAirlines;
