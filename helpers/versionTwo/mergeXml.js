import { DOMParser, XMLSerializer } from 'xmldom';
function mergeXml(existingXml, newXml) {
    // Check if the XML strings are null or undefined
    if (!existingXml || !newXml) {
        console.error("XML strings are null or undefined");
        return null; // or throw an error, depending on your use case
    }

    // Parse the existing XML string
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(existingXml, 'text/xml');

    // Create a DOM element from the new XML string
    const newXmlDoc = parser.parseFromString(newXml, 'text/xml');
    const newXmlElement = xmlDoc.importNode(newXmlDoc.documentElement, true);

    // Get the <soap-env:Header> element
    const headerElement = xmlDoc.getElementsByTagName('soap-env:Header')[0];

    // Insert the new XML element after the <soap-env:Header> element
    headerElement.parentNode.insertBefore(newXmlElement, xmlDoc.getElementsByTagName('soap-env:Envelope')[0]);

    // Serialize the modified XML document back to a string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
}

export default mergeXml