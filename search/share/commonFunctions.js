import moment from "moment/moment";
import getAirportByCode from "../helpers/getAirportByCode";
import getAirlinesByCode from "../helpers/getAirlinesByCode";
import aircraftService from "../helpers/aircraftService";
import {Constants} from "../../helpers/constant";


function splitBaggageSets(baggage = []) {
    const sets = [];
    const types = {};

    baggage.forEach(item => {
        if (!types[item.paxType]) {
            types[item.paxType] = true;
        }
    });

    const maxSets = Math.max(Object.keys(types).length, 1);

    for (let i = 0; i < maxSets; i++) {
        sets.push([]);
    }

    baggage.forEach(item => {
        let added = false;
        sets.some((set, index) => {
            if (!set.some(bag => bag && bag.paxType === item.paxType)) {
                set.push(item);
                added = true;
                return true;
            }
            return false;
        });
        if (!added) {
            sets.push([item]);
        }
    });

    // Filter out null arrays
    // const filteredSets = sets.filter(set => set.length > 0);

    return sets.filter(set => set.length > 0)
}

const segmentMaker = async (segmentData = {}) => {

    //console.log(segmentData)
    const codeShared = segmentData?.OperatingCarrier !== segmentData?.Carrier
    const duration = formatTime(segmentData?.FlightTime)
    const departureData = parseDateTime(segmentData?.DepartureTime);
    const arrivalData = parseDateTime(segmentData?.ArrivalTime);
    const getDepartureAirportData = await getAirportByCode(segmentData?.Origin)
    const getArrivalAirportData = await getAirportByCode(segmentData?.Destination)

    const operatingCarrierName = await getAirlinesByCode(segmentData?.OperatingCarrier) || {}
    const marketingCarrierName = await getAirlinesByCode(segmentData?.Carrier) || {}

    const airCartModel = await aircraftService.getAirCraftByCode(segmentData?.Equipment || "")
    return {
        codeShared,
        airCraft: airCartModel.aircraftModel || "",
        marketingCarrier: segmentData?.Carrier || "",
        marketingCarrierName: marketingCarrierName?.name || "",
        marketingFlight: extractNumberFromString(segmentData?.FlightNumber || ""),
        operatingCarrier: segmentData?.OperatingCarrier || "",
        operatingCarrierName: operatingCarrierName?.name || '',
        operatingFlight: extractNumberFromString(segmentData?.OperatingFlightNumber || ""),
        totalMilesFlown: extractNumberFromString(segmentData?.Distance || ""),
        flightDuration: duration || "",
        departure: segmentData?.Origin || "",
        departureDate: departureData.returnDate || "",
        departureTime: departureData.returnTime || "",
        departureDateTime: departureData.returnDateTime || "",
        departureAirport: getDepartureAirportData.name || "",
        departureCityCode: getDepartureAirportData.cityCode || "",
        departureCityName: getDepartureAirportData.cityName || "",
        departureCountryCode: getDepartureAirportData.countryCode || "",
        departureCountryName: getDepartureAirportData.countryName || "",
        departureLocation: `${getDepartureAirportData.cityName},${getDepartureAirportData.countryName}` || "",
        dTerminal: processTerminalString(segmentData?.OriginTerminal) || "",
        arrival: segmentData?.Destination || "",
        arrivalDate: arrivalData?.returnDate || "",
        arrivalTime: arrivalData?.returnTime || "",
        arrivalDateTime: arrivalData?.returnDateTime || "",
        arrivalAirport: getArrivalAirportData.name || "",
        arrivalCityCode: getArrivalAirportData.cityCode || "",
        arrivalCityName: getArrivalAirportData.cityName || "",
        arrivalCountryCode: getArrivalAirportData.countryCode || "",
        arrivalCountryName: getArrivalAirportData.countryName || "",
        arrivalLocation: `${getArrivalAirportData.cityName},${getArrivalAirportData.countryName}` || "",
        aTerminal: processTerminalString(segmentData?.DestinationTerminal) || "",
        bookingClass: segmentData?.BookingCode || "",
        cabinCode: getClassFromCabinClass(segmentData?.CabinClass || "") || "",
        mealCode: "",
        availableSeats: extractNumberFromString(segmentData?.BookingCount || "") || "",
        baggage: segmentData.baggage || [],
        metadata: {
            Key: segmentData?.SegmentRef || "",
            DepartureTime: segmentData?.DepartureTime || "",
            ArrivalTime: segmentData?.ArrivalTime || "",
            FlightNumber: segmentData?.FlightNumber || "",
            BookingCode: segmentData?.BookingCode || "",
            Origin: segmentData?.Origin || "",
            Destination: segmentData?.Destination || "",
            Carrier: segmentData?.Carrier || "",
            airCraft: airCartModel.aircraftModel || "",
            availableSeats: extractNumberFromString(segmentData?.BookingCount || "") || ""
        }
    }

}
const removeDuplicateBaggageArrays = (baggage, cityCount = 1) => {
    // If cityCount is equal to baggage.length, return the baggage array as is
    if (cityCount === baggage.length) {

        // console.log('hrer', cityCount , baggage.length)
        return baggage;
    }

    const uniqueBaggageSet = new Set(
        baggage.map(baggageArray => JSON.stringify(baggageArray))
    );

    const uniqueBaggageArray = Array.from(uniqueBaggageSet).map(baggageString => JSON.parse(baggageString));

    // Check if the unique array contains only one element
    if (uniqueBaggageArray.length === 1) {
        const singleBaggageArray = uniqueBaggageArray[0];
        // Multiply the single element by cityCount
        const multipliedBaggageArray = Array(cityCount).fill(singleBaggageArray);
        return multipliedBaggageArray;
    }

    // If there are multiple unique arrays or no arrays, return the uniqueBaggageArray
    return uniqueBaggageArray;
};


function extractAlphabeticPart(inputString = "") {
    // Check if inputString is null or undefined
    if (inputString === null || inputString === undefined) {
        return "BDT";
    }

    // Use regular expression to match alphabetic characters
    const matchResult = inputString.match(/[A-Za-z]+/);

    // Check if matchResult is not null and has at least one element
    if (matchResult && matchResult.length > 0) {
        // Return the first match found
        return matchResult[0];
    } else {
        // Return an empty string if no alphabetic characters are found
        return "BDT";
    }
}

function extractNumberFromString(string = "") {
    const number = string.match(/-?\d+/);
    return number ? parseInt(number[0]) : 0;
  }

function paxPriceMakers(paxPrice = {}) {

    // console.log(paxPrice)
 const tax = extractNumberFromString(paxPrice.ApproximateTaxes || "") || 0
 const paxCount = paxPrice.paxCount || 1
 const baseFare = extractNumberFromString(paxPrice.ApproximateBasePrice || "") || 0
 const totalBaseFare = baseFare * paxCount
 const totalTaxAmount = tax * paxCount
 const fees = extractNumberFromString(paxPrice.ApproximateFees || paxPrice.Fees || "")
 const totalperice = extractNumberFromString(paxPrice.ApproximateTotalPrice || "") || 0
 return {
   paxType: paxPrice.code || "",
   paxCount,
   currency: extractAlphabeticPart(paxPrice?.ApproximateTotalPrice || ""),
   baseFare,
   totalBaseFare,
   tax,
   totalTaxAmount,
   totalAmount: totalperice,
   discount: 0,
   otherCharges: 0,
   serviceFee: fees,
 }
}


function segmentPriceMaker(segmentPrice) {

    return {

        baseFare: extractNumberFromString(segmentPrice?.EquivalentBasePrice || segmentPrice?.ApproximateBasePrice || ""),
        tax: extractNumberFromString(segmentPrice?.ApproximateTaxes || ""),
        totalFare: extractNumberFromString(segmentPrice?.ApproximateTotalPrice || ""),
        currency: extractAlphabeticPart(segmentPrice?.ApproximateTotalPrice || ""),
    }

}

const distributeSegmentBaggage = (data = []) => {
    // Flatten the array
    const flatArray = data.flat();

    // Group bags by SegmentRef
    const groupedBags = flatArray.reduce((acc, item) => {
        const segmentName = item.SegmentRef;
        if (!acc[segmentName]) {
            acc[segmentName] = [];
        }
        acc[segmentName].push(item.bag);
        return acc;
    }, {});

    // Convert the object into an array of objects without SegmentRef in each bag object
    const result = Object.entries(groupedBags).map(([segmentRef, baggage]) => ({
        SegmentRef: segmentRef,
        baggage: baggage.map(bag => {
            const {SegmentRef, ...rest} = bag;
            return rest;
        })
    }));

    return result;
};
const removeBagAndFlatten = (data) => {
    // Flatten the array of arrays into a single array
    const flattenedArray = data.flat();

    // Remove the 'bag' property from each object and flatten into a single array
    const result = flattenedArray.map(item => {
        const {bag, ...rest} = item;
        return rest;
    });

    return result;
};

function parseDateTime(dateTimeString) {
    const dateTime = new Date(dateTimeString);

    if (isNaN(dateTime.getTime())) {
        return {returnDate: null, returnTime: null, returnDateTime: null};
    }

    const returnDate = dateTime.toISOString().split('T')[0];
    const returnTime = dateTime.toISOString().split('T')[1].split('.')[0];
    const returnDateTime = returnDate + 'T' + returnTime;

    return {returnDate, returnTime, returnDateTime};
}

const formatTime = (time = "") => {
    // console.log(time)
    const minutes = parseInt(time)
    //console.log(minutes, time)
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;


    return `${hours}H ${remainingMinutes}Min`;
};


function brandMaker(brandAttribute = {}) {
    //console.log({brandAttribute})

    const baseFare = extractNumberFromString(brandAttribute?.ApproximateBasePrice) || 0
    const taxes = extractNumberFromString(brandAttribute?.ApproximateTaxes) || 0
    return {

        //code:
        brandId: brandAttribute?.BrandID || "1",
        brandTier: brandAttribute.brandTier || "",
        brandName: brandAttribute?.Name || "Regular",
        commercialName: brandAttribute?.Name || "Regular Fare",
        name: brandAttribute?.Name || "Regular Fare",
        class: brandAttribute?.class || "", // TODO here make alies to user class
        code: brandAttribute?.code || "",
        additionalFare: "",
       // baseFare,
        taxes,
        baseFare: baseFare + taxes
    }


}


function featuredMaker(fareBrandAttribute = {}) {
    // console.log( fareBrandAttribute)

    return {

        fareBasis: fareBrandAttribute?.FareBasis || "",
        price: extractNumberFromString(fareBrandAttribute?.Amount || "") || 0,
        arrival: fareBrandAttribute?.Destination || "",
        departure: fareBrandAttribute?.Origin || "",
        code: fareBrandAttribute?.PassengerCode || "",
        departureDate: fareBrandAttribute?.DepartureDate || "",
        carrier: fareBrandAttribute?.Carrier,
        description: fareBrandAttribute.description

    }

}


function getFlightDetailsRefs(children, tagName) {
    // Check if children is null or undefined
    if (!children) {
        return [];
    }

    const flightDetailsRefs = [];
    children.forEach(subChild => {
        if (subChild.tag === tagName) {
            const flightDetailsRef = attributeToObject(subChild.attrib);
            flightDetailsRefs.push(flightDetailsRef);
        }
    });
    return flightDetailsRefs;
}

function attributeToObject(attributes) {
    const attributesObject = {};
    if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                attributesObject[key] = value;
            }
        });
    }
    return attributesObject;
}

function calculateTransitTime(flights = []) {
    const transit = [];

    //console.log(flights)

    for (let i = 0; i < flights.length - 1; i++) {
        const currentFlight = flights[i];
        const nextFlight = flights[i + 1];

        const arrivalDateTime = moment(currentFlight.arrivalDateTime);
        const departureDateTime = moment(nextFlight.departureDateTime);

        const transitDuration = moment.duration(departureDateTime.diff(arrivalDateTime));
        const hours = Math.floor(transitDuration.asHours());
        const minutes = transitDuration.minutes();

        transit.push({transit: `${hours}H ${minutes}Min`});
    }

    return transit;
}

function getClassFromCabinClass(cabinClass = "") {
    const cabinClassToClass = {
        'economy': 'Y',
        'premium economy': 'S',
        'business': 'C',
        'premium business': 'J',
        'first': 'F',
        'premium first': 'P'
    };

    // Convert input cabinClass to lowercase for case-insensitive matching
    const lowerCabinClass = cabinClass?.toLowerCase();

    // Check if the cabinClass exists in the mapping
    if (lowerCabinClass in cabinClassToClass) {
        return cabinClassToClass[lowerCabinClass];
    } else {
        return ""; // or throw an error, depending on your requirement
    }
}

function extractRoutes(routes = []) {

    const routeList = []


    routes.forEach(route => {
        const children = route?._children || [];
        children.forEach(child => {
            const data = {}; // Create a new object for each child
            //   console.log(child.attrib);
            data.Origin = child.attrib?.Origin;
            data.Destination = child.attrib?.Destination;
            routeList.push(data);
        });
    });

    //  console.log(routeList)

    return routeList
}

function detectRouteType(routes = []) {
    const routeCount = routes?.length;
    //console.log('here',routeCount )
    return routeCount === 1 ? Constants.ONEWAY : routeCount === 2 && routes[0].departure === routes[1].arrival && routes[0].arrival === routes[1].arrival ? Constants.RETURN : Constants.MULTI_CITY;
}

/**
 * Processes the input string to prefix "Terminal" if the word "terminal" is not present.
 * @param {string} input - The input string to process.
 * @returns {string} - The processed string with "Terminal" prefixed if applicable.
 */
const processTerminalString = (input = "") => {
    return !/terminal/i.test(input)
        ? `Terminal ${input}`
        : /terminal/.test(input)
            ? input.replace(/terminal/i, "Terminal")
            : input;
};

function getDeviceFeatures() {
    return [
        {
            type: "entertainment",
            exists: true,
            iconLink:
                "https://storage.googleapis.com/b2bnodeimages/Vector_2.png_1713433808369.webp",
        },
        {
            type: "usb",
            exists: true,
            iconLink:
                "https://storage.googleapis.com/b2bnodeimages/Vector_1.png_1713433344309.webp",
        },
        {
            type: "wifi",
            exists: false,
            iconLink:
                "https://storage.googleapis.com/b2bnodeimages/Vector.png_1713433712549.webp",
        },
    ];
}

function getNestedValue(obj, path, defaultValue) {
    return path.split('.').reduce((acc, part) => {
        return acc && acc[part] !== undefined && acc[part] !== null ? acc[part] : defaultValue;
    }, obj);
}
function isEmptyObject(obj) {
    return obj === null || obj === undefined || Object.keys(obj).length === 0;
}

function transformBagArray(bagArray = []) {
    let result = [];

    bagArray.forEach(item => {
        for (let i = 0; i < item.paxNumber; i++) {
            result.push({
                paxType: item?.paxType || "",
                paxNumber: item?.paxNumber || 0,
                baggage: item?.baggage || ""
            });
        }
    });

    return result;
}

function extractSegmentArray(cityCount) {
    const segmentArray = [];
    cityCount.forEach(segmentList => {
        segmentList.forEach(segment => {
// Remove the 'metadata' property from the segment
            const {metadata, ...rest} = segment;
            segmentArray.push({
                Key: metadata?.Key || "",
                DepartureTime: metadata?.DepartureTime || "",
                ArrivalTime: metadata?.ArrivalTime || "",
                FlightNumber: metadata?.FlightNumber || "",
                BookingCode: metadata?.BookingCode || "",
                Origin: metadata?.Origin || "",
                Destination: metadata?.Destination || "",
                Carrier: metadata?.Carrier || "",
                airCraft: rest.airCraft || "",
                fareBasicCode: null // to be updated later
            });
            delete segment.metadata;
        });
    });
    return segmentArray;
}

function getFilteredBrands(brands) {
    const seen = new Set();
    return brands.map((brand) =>
    {
        return brand.feature
            .filter((feature) => feature.code === 'ADT' || feature.code === 'CNN')
            .map((feature) => ({
                brandID: brand.brandId,
                brandTier: brand.brandTier,
                arrival: feature.arrival,
                departure: feature.departure,
                fareBasis: feature.fareBasis,
                paxType: feature.code,
            }))
            .filter((item) => {
                const identifier = `${item.brandID}-${item.arrival}-${item.departure}-${item.fareBasis}`;
                if (seen.has(identifier)) {
                    return false;
                } else {
                    seen.add(identifier);
                    return true;
                }
            });
    }).flat();

}

function createPenaltyObjects(changePenalty, cancelPenalty, isRefundable,  passengerPrice) {
    const result = [];

    if (isRefundable === Constants.NONREFUNDABLE) return result

    const processPenalty = (penalty, type) => {
        if (!penalty || !penalty._children || !penalty.attrib) {
            return;
        }

        let penaltyAmount = null;

        const amountElement = penalty._children.find(child => child.tag === 'air:Amount');
        const percentageElement = penalty._children.find(child => child.tag === 'air:Percentage');
        if (amountElement && amountElement.text) {
            penaltyAmount = parseFloat(amountElement.text.match(/[0-9.]+/)[0]);
        } else if (percentageElement && percentageElement.text) {
            const percentage = parseFloat(percentageElement.text.match(/[0-9.]+/)[0]);
            penaltyAmount = (percentage / 100) * passengerPrice;
           // console.log(percentage, penaltyAmount, passengerPrice)
        }



        const penaltyApplies = penalty.attrib.PenaltyApplies || 'Anytime';

        if (penaltyApplies === 'Anytime' || !penaltyApplies) {
            result.push({
                type: type,
                isRefundable: isRefundable,
                amount: penaltyAmount,
                applicability: 'Before Departure',
            });
            result.push({
                type: type,
                isRefundable: isRefundable,
                amount: penaltyAmount,
                applicability: 'After Departure'
            });
        } else {
            result.push({
                type: type,
                isRefundable: isRefundable,
                amount: penaltyAmount,
                applicability: penaltyApplies
            });
            result.push({
                type: type,
                isRefundable: isRefundable,
                amount: null,
                applicability: penaltyApplies === 'Before Departure' ? 'After Departure' : 'Before Departure'
            });
        }
    };

    if (Array.isArray(changePenalty) && changePenalty.length > 0) {
        changePenalty.forEach(penalty => processPenalty(penalty, 'Reissue'));
    } else {
        // Default value for Reissue when changePenalty is not present
        result.push({
            type: 'Reissue',
            isRefundable: isRefundable,
            amount: null,
            applicability: 'Before Departure',
        });
        result.push({
            type: 'Reissue',
            isRefundable: isRefundable,
            amount: null,
            applicability: 'After Departure',
        });
    }

    if (Array.isArray(cancelPenalty) && cancelPenalty.length > 0) {
        cancelPenalty.forEach(penalty => processPenalty(penalty, 'Refund'));
    } else {
        // Default value for Refund when cancelPenalty is not present
        result.push({
            type: 'Refund',
            isRefundable: isRefundable,
            amount: 0,
            applicability: 'Before Departure',
        });
        result.push({
            type: 'Refund',
            isRefundable: isRefundable,
            amount: 0,
            applicability: 'After Departure',
        });
    }

    return result;
}

export default {

    extractAlphabeticPart,
    splitBaggageSets,
    segmentMaker,
    removeDuplicateBaggageArrays,
    paxPriceMakers,
    segmentPriceMaker,
    distributeSegmentBaggage,
    removeBagAndFlatten,
    parseDateTime,
    formatTime,
    extractNumberFromString,
    brandMaker,
    featuredMaker,
    getFlightDetailsRefs,
    calculateTransitTime,
    extractRoutes,
    detectRouteType,
    processTerminalString,
    getDeviceFeatures,
    attributeToObject,
    getNestedValue,
    extractSegmentArray,
    getFilteredBrands,
    isEmptyObject,
    transformBagArray,
    createPenaltyObjects,
}