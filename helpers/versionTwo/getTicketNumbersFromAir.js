


/**
 * Updates the travelers array with corresponding ticket numbers from flightTickets.
 * @param {Array<Object>} [travelers=[]] - The array of traveler objects.
 * @param {Array<Object>} [flightTickets=[]] - The array of flight ticket objects.
 * @returns {void}
 */
function getTicketNumbersFromAir(travelers = [], flightTickets = []) {
    // Create a map to associate traveler indexes with ticket numbers
    const ticketMap = new Map();
    flightTickets.forEach(ticket => {
        ticketMap.set(ticket.travelerIndex, ticket.number);
    });

    // Update the travelers array with ticket numbers
    travelers.forEach(traveler => {
        const travelerIndex = Number(traveler.nameAssociationId);
        const ticketNumber = ticketMap.get(travelerIndex);
        if (ticketNumber != null) {
            traveler.ticketNumber = ticketNumber;
            // Use optional chaining and nullish coalescing to handle null and undefined
            traveler.passportNumber = traveler.identityDocuments?.[0]?.documentNumber ?? null;
            // Remove unnecessary properties
            delete traveler.identityDocuments;
            delete traveler.phones;
        }
    });
}

export default getTicketNumbersFromAir