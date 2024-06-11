import {create} from "xmlbuilder2";

function generateCarrierObjects(carrierCodes, tagName) {
    if (!carrierCodes || carrierCodes.length === 0) {
        return {};
    }

    return {
        [tagName]: {
            Carrier: carrierCodes.map(bookingCode => ({
                '@xmlns': 'http://www.travelport.com/schema/common_v52_0',
                '@Code': bookingCode,
            }))
        }
    };
}

function generateSoapRequest(obj) {

    const {
        airLegs,
        passengers,
        airClass = null,
        permittedCarriers = null,
        preferredCarriers = null,
        prohibitedCarriers = null
    } = obj
    const soapEnvelope = create({
        's:Envelope': {
            '@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
            's:Body': {
                '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                '@xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
                LowFareSearchReq: {
                    '@xmlns': 'http://www.travelport.com/schema/air_v52_0',
                    '@TraceId': 'Fly-Far-Tech',
                    '@TargetBranch': 'P4218912',
                    '@SolutionResult': 'true',
                    '@ReturnUpsellFare': 'true',
                    BillingPointOfSaleInfo: {
                        '@xmlns': 'http://www.travelport.com/schema/common_v52_0',
                        '@OriginApplication': 'UAPI'
                    },
                    SearchAirLeg: airLegs.map(leg => ({
                        SearchOrigin: {
                            CityOrAirport: {
                                '@xmlns': 'http://www.travelport.com/schema/common_v52_0',
                                '@Code': leg.departure,
                                '@PreferCity': 'true'
                            }
                        },
                        SearchDestination: {
                            CityOrAirport: {
                                '@xmlns': 'http://www.travelport.com/schema/common_v52_0',
                                '@Code': leg.arrival,
                                '@PreferCity': 'true'
                            }
                        },
                        SearchDepTime: {
                            '@PreferredTime': leg.departureDate
                        }
                    })),
                    AirSearchModifiers: {
                        PreferredProviders: {
                            Provider: {
                                '@xmlns': 'http://www.travelport.com/schema/common_v52_0',
                                '@Code': '1G'
                            }
                        },
                        ...(airClass !== null ? {
                            PreferredCabins: {
                                CabinClass: {
                                    '@xmlns': 'http://www.travelport.com/schema/common_v52_0',
                                    '@Type': airClass
                                }
                            }

                        } : {}),

                        ...generateCarrierObjects(permittedCarriers, 'PermittedCarriers'),
                        ...generateCarrierObjects(preferredCarriers, 'PreferredCarriers'),
                        ...generateCarrierObjects(prohibitedCarriers, 'ProhibitedCarriers')
                    },
                    SearchPassenger: passengers.flatMap(passenger => {
                        const passengerData = [];
                        for (let i = 0; i < passenger.count; i++) {
                            const data = {
                                '@xmlns': 'http://www.travelport.com/schema/common_v52_0',
                                '@Code': passenger.type
                            };
                            if (passenger.type !== 'ADT') {
                                // Include Age only for non-ADT passengers
                                data['@Age'] = passenger.type === 'INF' ? 1 : 8;
                            }
                         //   console.log(i, passenger)
                            data['@BookingTravelerRef'] = `${passenger.type.trim()}_${i}`
                            passengerData.push(data);
                        }
                        return passengerData;
                    }),
                    AirPricingModifiers: {
                        '@FaresIndicator': 'PublicAndPrivateFares'
                    }
                }
            }
        }
    });
    return soapEnvelope.end({prettyPrint: false}).replace('<?xml version="1.0"?>', '');
}

export default generateSoapRequest;