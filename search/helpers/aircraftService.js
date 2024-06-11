import AirCraft from "../../models/airCraft";


let airCraftDataCache = [];
let cacheLastUpdated = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetches aircraft data from the database and caches it for 5 minutes.
 * @returns {Promise<Array>} The cached aircraft data.
 */
const fetchAirCrafts = async () => {
    const now = Date.now();

    if (!cacheLastUpdated || now - cacheLastUpdated > CACHE_DURATION) {
        try {
            const rows = await AirCraft.findAll();
            airCraftDataCache = rows.map(row => row.toJSON());
            cacheLastUpdated = now;
        } catch (error) {
            console.error('Error fetching aircraft data:', error);
            return [];
        }
    }

    return airCraftDataCache;
};

/**
 * Gets all aircraft data.
 * @returns {Promise<Array>} All aircraft data.
 */
const getAllAirCrafts = async () => {
    return await fetchAirCrafts();
};

/**
 * Gets aircraft data by airCraftId.
 * @param {string} airCraftId - The airCraftId to search for.
 * @returns {Promise<{id: string|null, airCraftId: string|null, aircraftName: string, aircraftModel: string}>} The aircraft data or an object with default values if not found.
 */
const getAirCraftByCode = async (airCraftId = "") => {
    const airCrafts = await fetchAirCrafts();
    const lowerCaseAirCraftId = airCraftId.toLowerCase();

    const foundAirCraft = airCrafts.find(airCraft => airCraft.airCraftId.toLowerCase() === lowerCaseAirCraftId);

    return foundAirCraft || {
        id: null,
        airCraftId: null,
        aircraftName: '',
        aircraftModel: airCraftId,
    };
};

export default {
    fetchAirCrafts,
    getAllAirCrafts,
    getAirCraftByCode
};