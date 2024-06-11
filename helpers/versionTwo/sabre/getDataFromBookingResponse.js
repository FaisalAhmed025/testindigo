function getDataFromBookingResponse(flightSegments = [], travelItinerary = {}) {
    const firstSegment = flightSegments[0] || [];
    const bookingClass = firstSegment?.ResBookDesigCode || "";
    const deptFrom = firstSegment?.OriginLocation?.LocationCode || "";

// Extracting data from the last object
    const lastSegment = flightSegments[flightSegments?.length - 1] || [];
    const arriveTo = lastSegment?.DestinationLocation?.LocationCode || "";


    let travelDate = null;

// Check if TravelItineraryRead and FlightSegment exist

    if (
        travelItinerary &&
        travelItinerary.TravelItinerary &&
        travelItinerary.TravelItinerary.ItineraryInfo &&
        travelItinerary.TravelItinerary.ItineraryInfo.ReservationItems &&
        travelItinerary.TravelItinerary.ItineraryInfo.ReservationItems.Item &&
        travelItinerary.TravelItinerary.ItineraryInfo.ReservationItems.Item.length > 0
    ) {
        const items = travelItinerary.TravelItinerary.ItineraryInfo.ReservationItems.Item;

        // Iterate over each item
        for (const item of items) {
            const flightSegments = item.FlightSegment;

            // Find the flight segment matching the deptFrom
            const matchingSegment = flightSegments.find(segment => segment.OriginLocation.LocationCode === deptFrom);

            if (matchingSegment) {
                travelDate = matchingSegment.DepartureDateTime;
                break;
            }
        }
    }
    return {bookingClass, deptFrom, arriveTo, travelDate};
}

export default getDataFromBookingResponse