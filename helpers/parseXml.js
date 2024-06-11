import { DOMParser, XMLSerializer } from 'xmldom';
function parseXml(xmlString) {
    try {
        // Create a new DOMParser instance
        const parser = new DOMParser();

        // Parse the XML string
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        const serializer = new XMLSerializer();
        return serializer.serializeToString(xmlDoc);
    } catch (error) {
        console.error("Error parsing XML:", error);
        return null; // Return null if there's an error parsing the XML
    }
}

export default parseXml