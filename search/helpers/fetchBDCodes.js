import Airport from "../../models/airport";
import {Constants} from "../../helpers/constant";


let BDInfoCache = [];
let cacheLastUpdated = null;
const CACHE_DURATION = 5 * 60 * 1000; // Cache duration in milliseconds (e.g., 5 minutes)

const fetchBDCodes = async () => {
    const now = Date.now();

    // Check if the cache is stale or not initialized
    if (!cacheLastUpdated || now - cacheLastUpdated > CACHE_DURATION) {
        try {
            const rows = await Airport.findAll({
                attributes: ['code'],
                where: {
                    countryName: Constants.BANGLADESH
                }
            });
            BDInfoCache = rows.map(row => row.toJSON());
            cacheLastUpdated = now; // Update the cache timestamp
        } catch (error) {
            console.error(error);
            // Optionally, return stale data even if an error occurs
            // return BDInfoCache;
            return [];
        }
    }

    return BDInfoCache;
};


export default fetchBDCodes;