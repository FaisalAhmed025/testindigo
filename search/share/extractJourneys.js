import commonFunctions from "./commonFunctions";

const extractJourneys = async (etree, journeyElements = [], bookingData = []) => {
    const journeys = [];


    const segmentBaggage = commonFunctions.distributeSegmentBaggage(bookingData)
    const flatBookingData = commonFunctions.removeBagAndFlatten(bookingData)
    //  console.log(JSON.stringify(segmentBaggage, null, 2))
    // console.log(JSON.stringify(flatBookingData, null, 2))

    // Iterate over each journey element
    for (let i = 0; i < journeyElements.length; i++) {


        const journeyElement = journeyElements[i];
        const journeyDetails = {AirSegmentRefs: []};

        // Find all air:AirSegmentRef elements within the current journey
        const airSegmentRefs = journeyElement._children.filter(child => child.tag === 'air:AirSegmentRef');

        // Iterate over each airSegmentRef element
        for (let j = 0; j < airSegmentRefs.length; j++) {

            const airSegmentRef = airSegmentRefs[j];
            //   const nextAirSegmentRef = airSegmentRef[i+1]
            let mergerData = {}
            // Extract the Key attribute value
            const key = airSegmentRef.attrib.Key;

            // get segment data
            const data = etree.find(`.//air:AirSegment[@Key='${key}']`, etree.namespaces);
            //if (!data)  continue;
            let airAttributes = commonFunctions.attributeToObject(data?.attrib);
            const flightDetailsRefElement = data._children?.find(element => element.tag === 'air:FlightDetailsRef');
            const codeShareInfoElement = commonFunctions.getFlightDetailsRefs(data._children, 'air:CodeshareInfo');

            // console.log({codeShareInfoElement})

            const flightKey = flightDetailsRefElement?.attrib?.Key;

            const {attrib: segmentAttribute = {}} = etree.find(`.//air:FlightDetailsList/air:FlightDetails[@Key='${flightKey}']`, etree.namespaces)

            // console.log(attrib)

            const segmentData = commonFunctions.attributeToObject(segmentAttribute)

            //console.log({airAttributes})
            // Check if the key matches any SegmentRef in the bookingData
            const matchedBooking = flatBookingData.find(booking => booking.SegmentRef === key);

            const matchedBaggage = segmentBaggage.find(segment => segment.SegmentRef === key) || null

            //  console.log(matchedBaggage)

            // console.log({matchedBooking})
            if (matchedBooking && matchedBaggage) {
                //console.log(`Match found for Key: ${key}`);
                // console.log(matchedBooking);
                mergerData = {
                    ...mergerData, ...matchedBooking, ...segmentData, ...airAttributes, ...{
                        OperatingCarrier: codeShareInfoElement[0]?.OperatingCarrier || airAttributes.Carrier,
                        OperatingFlightNumber: codeShareInfoElement[0]?.OperatingFlightNumber || airAttributes.FlightNumber,
                        baggage: matchedBaggage?.baggage
                    }
                }
            }
            // Add the Key attribute value to the AirSegmentRefs array
            // console.log(mergerData)
            const newSegment = await commonFunctions.segmentMaker(mergerData)


            //  newSegment.baggage = baggageArray[i]
            newSegment.hiddenStops = []
            newSegment.flightAmenities = []
            journeyDetails.AirSegmentRefs.push(newSegment);

            //console.log(airSegmentRefs.DepartureTime, nextAirSegmentRef.ArrivalTime)
        }

        journeys.push(journeyDetails);
    }

    // Transform the AirSegmentRefs arrays into arrays of keys
    const transformedJourneys = journeys.map(journey => journey.AirSegmentRefs);

    //  console.log(JSON.stringify(transformedJourneys, null, 2));

    return transformedJourneys;
};

export default  extractJourneys