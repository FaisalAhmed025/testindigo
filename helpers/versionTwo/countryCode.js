import {Constants, Tables} from "../constant";

/**
 * @async
 * @function
 * @param country
 * @param {import('mysql2').PoolConnection} connection - The MySQL pool connection object.
 * @returns {Promise<string|null>}
 */
const getCountryCodeByName = async (country, connection) => {

    const [rows] = await connection.execute(
        `SELECT  countryCode FROM ${Tables.AIRPORTS}  WHERE LOWER(countryName) = LOWER(?)
         ORDER BY id DESC
         LIMIT 1`, [country])

    return rows.length > Constants.ZERO ? rows[Constants.ZERO].countryCode : null;
}



/**
 * @async
 * @function
 * @param countryCode
 * @param {import('mysql2').PoolConnection} connection - The MySQL pool connection object.
 * @returns {Promise<string|null>}
 */
const getCountryCodeByCode = async (countryCode, connection) => {

    const [rows] = await connection.execute(
        `SELECT  countryCode FROM ${Tables.AIRPORTS}  WHERE LOWER(countryCode) = LOWER(?)
         ORDER BY id DESC
         LIMIT 1`, [countryCode])

    return rows.length > Constants.ZERO ? rows[Constants.ZERO].countryCode : null;
}

export default {
    getCountryCodeByName,
    getCountryCodeByCode
}


