/**
 * Extracts the first IP address from a string containing one or more IP addresses separated by commas.
 * If the input string contains multiple IP addresses, it returns the first one.
 *
 * @param {string} loginIp - The string containing one or more IP addresses separated by commas.
 * @returns {string|null} - The first IP address if multiple IPs are present, otherwise the original loginIp. Returns null if loginIp is null or empty.
 */
function extractFirstIpAddress(loginIp) {
    if (loginIp) {
        const ipAddresses = loginIp.split(',').map(ip => ip.trim());
        return ipAddresses.length > 1 ? ipAddresses[0] : loginIp; // Return the first IP address if multiple IPs are present, otherwise return the original loginIp
    }
    return null; // Return null if loginIp is null or empty
}


export default  extractFirstIpAddress