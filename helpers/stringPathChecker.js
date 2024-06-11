

function stringInPath(url, searchString) {
    // Escape special characters in the search string
    const escapedSearchString = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Create a regular expression to match the search string between slashes
    const regex = new RegExp(`\\/${escapedSearchString}\\/`);
    // Return true if the search string exists in the URL path, false otherwise
    return regex.test(url);
}

export default stringInPath