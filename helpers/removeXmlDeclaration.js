function removeXmlDeclaration(xmlString) {
    // Check if the XML string is null or undefined
    if (!xmlString) {
        console.error("XML string is null or undefined");
        return null; // or throw an error, depending on your use case
    }

    // Define the pattern for the XML declaration
    const xmlDeclarationPattern = /^<\?xml [^>]*\?>\n?/i;

    // Remove the XML declaration using regex
    // const xmlWithoutDeclaration = xmlString.replace(xmlDeclarationPattern, '').trim();

    return  xmlString.replace(xmlDeclarationPattern, '').trim();
}

export default removeXmlDeclaration