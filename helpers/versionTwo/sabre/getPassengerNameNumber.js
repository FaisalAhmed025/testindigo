import et from "elementtree";


async function processPassengers(nameInfo, passengersInfo, openReservationElements) {
    const promises = passengersInfo.map(async (passenger, index) => {
        openReservationElements.find(element => {
            const serviceRequests = element.findall('.//or114:ServiceRequest', {'or114': 'http://services.sabre.com/res/or/v1_14'});
            const referenceId = element.findtext('.//or114:NameAssociation/or114:ReferenceId', '', {'or114': 'http://services.sabre.com/res/or/v1_14'});

            for (const serviceRequest of serviceRequests) {
                const travelDocument = serviceRequest.find('.//or114:TravelDocument', {'or114': 'http://services.sabre.com/res/or/v1_14'});
                if (travelDocument !== null) {
                    const documentNumberElement = travelDocument.find('.//or114:DocumentNumber', {'or114': 'http://services.sabre.com/res/or/v1_14'});
                    if (documentNumberElement?.text === passenger.documentNumber) {
                        passenger.id = referenceId;
                    }
                }
            }

            if (passenger.id === nameInfo[index].nameId) passenger.nameNumber = nameInfo[index].nameNumber;
        });

    });

    // Wait for all promises to resolve
    await Promise.all(promises);
}

/**
 * @async
 * @function
 * @param {string} xmlData
 * @returns {Promise<Array<{ firstName: string, lastName: string, documentNumber: string, id: string, nameNumber: string }>>} - An array of objects representing processed data.
 */
const getPassengerNameNumber = async (xmlData) => {


// Parse the XML string
    const etree = et.parse(xmlData);

    const passengers = etree.findall('.//stl19:Passenger', etree.getroot().namespaces);

    const passengerInfo = passengers.map(passenger => {
        const firstName = passenger.findtext('stl19:FirstName', '', etree.getroot().namespaces);
        const lastName = passenger.findtext('stl19:LastName', '', etree.getroot().namespaces);
        const documentNumber = passenger.findtext('.//stl19:DocumentNumber', '', etree.getroot().namespaces);


        return {firstName, lastName, documentNumber};
    });

    const details = etree.findall('.//Details', etree.getroot().namespaces);
    const nameAssociationInfoElements = [];
    // console.log(details)
    for (const detail of details) {
        const nameAssociations = detail.findall('.//NameAssociationInfo', etree.getroot().namespaces);
        nameAssociationInfoElements.push(...nameAssociations);
    }


    const nameInfo = [];

    for (const element of nameAssociationInfoElements) {
        const nameId = element.attrib['nameId'];
        const nameNumber = element.attrib['nameNumber'];
        nameInfo.push({nameId, nameNumber});

    }
    // Extract OpenReservationElements from the XML
    const openReservationElements = Array.from(etree.findall('.//or114:OpenReservationElement', {'or114': 'http://services.sabre.com/res/or/v1_14'}));

    await processPassengers(nameInfo, passengerInfo, openReservationElements)

    return passengerInfo
}

export default getPassengerNameNumber
