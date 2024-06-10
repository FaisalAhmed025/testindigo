import { addProposalSyntaxPlugins } from "@babel/preset-env/lib/filter-items";
import axios from "axios";
import fs, { readSync } from 'fs'
import { DOMParser } from 'xmldom';
import et from 'elementtree'
import { Stream } from "stream";
import moment  from "moment";


export const createToken = async (req, res) => {
  const targetBranch = 'P4218912';
  const CREDENTIALS = 'Universal API/uAPI4444837655-83fe5101:K/s3-5Sy4c';
  return res.send(Buffer.from(CREDENTIALS).toString('base64'));
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

function extractNumberFromString(string) {
  const number = string.match(/\d+/);
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



const RoundWayresponse = (req, res) => {
  const xmlData = fs.readFileSync('response.xml', 'utf8');
  const etree = et.parse(xmlData);

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
    //console.log(routeCount, routes[0].Origin)
    return routeCount === 1 ? "oneWay" : routeCount === 2 && routes[0].Origin === routes[1].Destination && routes[0].Destination === routes[1].Origin ? "roundWay" : "multiCity";
}

function parseDateTime(dateTimeString) {
    const dateTime = new Date(dateTimeString);

    if (isNaN(dateTime.getTime())) {
        return { returnDate: null, returnTime: null, returnDateTime: null };
    }

    const returnDate = dateTime.toISOString().split('T')[0];
    const returnTime = dateTime.toISOString().split('T')[1].split('.')[0];
    const returnDateTime = returnDate + 'T' + returnTime;
    return { returnDate, returnTime, returnDateTime };
}

const formatTime = (time = "") => {
    // console.log(time)
    const minutes = parseInt(time)
    //console.log(minutes, time)
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}H ${remainingMinutes}Min`;
};

function extractNumberFromString(string = "") {
  const number = string.match(/-?\d+/);
  return number ? parseInt(number[0]) : 0;
}

function extractBaggageWeights(baggageAllowance = []) {
    let baggageWeights = '';

    if (!Array.isArray(baggageAllowance)) return baggageWeights;

    baggageAllowance.forEach(baggage => {
        const maxWeightElement = baggage.find('air:MaxWeight', etree.namespaces);
        const numberOfPiecesElement = baggage.find('air:NumberOfPieces', etree.namespaces);

        //console.log(maxWeightElement, numberOfPiecesElement)
        let pieceCount = null;

        if (numberOfPiecesElement && numberOfPiecesElement.text) {
            pieceCount = parseInt(numberOfPiecesElement.text.trim());


            if (isNaN(pieceCount)) {
                pieceCount = null; // Set to null if parsing fails
            }
            baggageWeights = pieceCount === 1 ? '1 Piece' : pieceCount + ' Pieces';
        }
        // console.log( maxWeightElement.attrib)

        if (maxWeightElement && maxWeightElement.attrib?.Value) {
            const weight = maxWeightElement.attrib.Value;

            // console.log({weight})
            const unit = ' KG';
            baggageWeights = weight + unit;
        }
    });

    //console.log({baggageWeights})

    return baggageWeights;
}


function brandMaker(brandAttribute = {}) {
    //console.log({brandAttribute})

    const baseFare = extractNumberFromString(brandAttribute?.ApproximateBasePrice) || 0
    const taxes = extractNumberFromString(brandAttribute?.ApproximateTaxes) || 0
    return {

        //code:
        brandId: brandAttribute?.BrandID || 1,
        brandName: brandAttribute?.Name || "Regular",
        commercialName: brandAttribute?.Name || "Regular Fare",
        name: brandAttribute?.Name || "Regular Fare",
        class: brandAttribute?.class || "", // TODO here make alies to user class
        code: brandAttribute?.code || "",
        additionalFare: 0,
        baseFare,
        taxes,
        totalFare: baseFare + taxes
    }


}


function featuredMaker(fareBrandAttribute = {}) {
    // console.log( fareBrandAttribute)
    return {

        fareBasis: fareBrandAttribute?.FareBasis || "",
        price: extractNumberFromString(fareBrandAttribute?.Amount || "") || 0,
        arrival: fareBrandAttribute?.Origin || "",
        departure: fareBrandAttribute?.Destination || "",
        code: fareBrandAttribute?.PassengerCode || "",
        departureDate: fareBrandAttribute?.DepartureDate || "",
        carrier: fareBrandAttribute?.Carrier,
        // description: fareBrandAttribute.description

    }

}

// todo when figure out hidden stops then handle them
function hiddenStopsMakers(hiddenStop) {

    return {
        airportName: "",
        cityCode: "",
        cityName: "",
        countryCode: "",
        countryName: "",
        departureTime: "",
        arrivalTime: "",
        arrivalDateTime: "",
        duration: "",
        stopLocation: "",
        elapsedTime: "",
        elapsedLayOverTime: "",
        airCraft: ""

    }

}


function flightAmenitiesMakers(airAmenities) {

}

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

const segmentMaker = (segmentData = {}) => {

    // console.log(segmentData)
    const codeShared = segmentData?.OperatingCarrier !== segmentData?.Carrier
    const duration = formatTime(segmentData?.FlightTime)
    const departureData = parseDateTime(segmentData?.DepartureTime);
    const arrivalData = parseDateTime(segmentData?.ArrivalTime);
    return {
        codeShared,
        airCraft: segmentData?.Equipment || "",
        marketingCarrier: segmentData?.Carrier || "",
        marketingCarrierName: '',
        marketingFlight: extractNumberFromString(segmentData?.FlightNumber || ""),
        operatingCarrier: segmentData?.OperatingCarrier || "",
        operatingCarrierName: '',
        operatingFlight: extractNumberFromString(segmentData?.OperatingFlightNumber || ""),
        totalMilesFlown: extractNumberFromString(segmentData?.Distance || ""),
        flightDuration: duration || "",
        departure: segmentData?.Origin || "",
        departureDate: departureData.returnDate || "",
        departureTime: departureData.returnTime || "",
        departureDateTime: departureData.returnDateTime || "",
        departureAirport: "",
        departureCityCode: "",
        departureCityName: "",
        departureCountryCode: "",
        departureCountryName: "",
        departureLocation: "",
        dTerminal: segmentData?.OriginTerminal || "",
        arrival: segmentData?.Destination || "",
        arrivalDate: arrivalData?.returnDate || "",
        arrivalTime: arrivalData?.returnTime || "",
        arrivalDateTime: arrivalData?.returnDateTime || "",
        arrivalAirport: "",
        arrivalCityCode: "",
        arrivalCityName: "",
        arrivalCountryCode: "",
        arrivalCountryName: "",
        arrivalLocation: "",
        aTerminal: segmentData?.DestinationTerminal || "",
        bookingClass: segmentData?.BookingCode || "",
        cabinCode: getClassFromCabinClass(segmentData?.CabinClass || "") || "",
        mealCode: "",
        availableSeats: extractNumberFromString(segmentData?.BookingCount || "") || "",
    }

}


function processBrand(brandElement, fareAttributeData, airPrice) {
    let brandAttribute = attributeToObject(brandElement?.attrib);

    // console.log({fareAttributeData, brandAttribute})
    // Get class information of the brand
    brandAttribute.class = (brandElement?.find('air:Title[@Type="External"]', etree.namespaces)?.text ?? '').trim();
    brandAttribute.code = (brandElement?.find('air:Title[@Type="Short"]', etree.namespaces)?.text ?? '').trim();

    brandAttribute.ApproximateBasePrice = airPrice.ApproximateBasePrice || '';
    brandAttribute.ApproximateTaxes = airPrice.ApproximateTaxes || '';
    // fareAttributeData.description = (brandElement?.find('air:Text[@Type="MarketingAgent"]', etree.namespaces)?.text ?? '').trim();
   // console.log(brandAttribute, fareAttributeData)

    const seenBrands = brandMaker(brandAttribute);
    const feature = featuredMaker(fareAttributeData);

    return {seenBrands, feature};
}


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
        baseFare: extractNumberFromString(segmentPrice?.ApproximateBasePrice || ""),
        tax: extractNumberFromString(segmentPrice?.ApproximateTaxes || ""),
        totalFare: extractNumberFromString(segmentPrice?.ApproximateTotalPrice || ""),
        currency: extractAlphabeticPart(segmentPrice?.ApproximateTotalPrice || ""),
    }

}

// Function to extract booking info
const extractBookingInfo = (pricingInfo = [], passengerTypeCode = "") => {
    const desiredBookingInfo = [];
    const passengerType = pricingInfo.findall(`.//air:PassengerType[@Code="${passengerTypeCode}"]`);
    if (passengerType.length > 0) {
        const bookingInfos = pricingInfo.findall('.//air:BookingInfo');
        bookingInfos.forEach(bookingInfo => {
            const {BookingCode, BookingCount, CabinClass, SegmentRef} = bookingInfo.attrib;
            desiredBookingInfo.push({BookingCode, BookingCount, CabinClass, SegmentRef});
        });
    }

    return desiredBookingInfo
};

const extractJourneys = (journeyElements = [], bookingData = [], baggageArray = []) => {
    const journeys = [];

    //console.log(bookingData)

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
            let airAttributes = attributeToObject(data?.attrib);
            const flightDetailsRefElement = data._children?.find(element => element.tag === 'air:FlightDetailsRef');
            const codeShareInfoElement = getFlightDetailsRefs(data._children, 'air:CodeshareInfo');

            // console.log({codeShareInfoElement})

            const flightKey = flightDetailsRefElement?.attrib?.Key;

            const {attrib: segmentAttribute = {}} = etree.find(`.//air:FlightDetailsList/air:FlightDetails[@Key='${flightKey}']`, etree.namespaces)

            // console.log(attrib)

            const segmentData = attributeToObject(segmentAttribute)

            //console.log({airAttributes})
            // Check if the key matches any SegmentRef in the bookingData
            const matchedBooking = bookingData.find(booking => booking.SegmentRef === key);
            if (matchedBooking) {
                //      console.log(`Match found for Key: ${key}`);
                // console.log(matchedBooking);
                mergerData = {
                    ...mergerData, ...matchedBooking, ...segmentData, ...airAttributes, ...{
                        OperatingCarrier: codeShareInfoElement[0]?.OperatingCarrier || airAttributes.Carrier,
                        OperatingFlightNumber: codeShareInfoElement[0]?.OperatingFlightNumber || airAttributes.FlightNumber,
                    }
                }
            }
            // Add the Key attribute value to the AirSegmentRefs array
            const newSegment = segmentMaker(mergerData)

            //   console.log(newSegment)
            newSegment.baggage = baggageArray[i]
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
//function


// find the LowFareSearchRsp

const airPricingSolutions = etree.findall('.//air:AirPricingSolution');


// determine journey route
const routeList = etree.findall('air:RouteList/air:Route');

const routes = extractRoutes(routeList);
console.log(routes);
const tripType = detectRouteType(routes)

console.log(tripType)

let counter = 0
const returnData = []

// const pricePoint = airPricingSolutions[1]
airPricingSolutions.forEach(pricePoint => {
    counter++
    const brandArray = []
    const featureArray = []
    const priceBreakDown = []
    let baggage = []
    let bookingRelatedData = []
    const airPrice = attributeToObject(pricePoint?.attrib);

//console.log(airPrice)
//todo it should in the loop
    const children = pricePoint._children

    children.filter(element => element.tag === 'air:Journey');
    const journeyElements = pricePoint.findall('.//air:Journey')

    const pricingInfos = pricePoint.findall('.//air:AirPricingInfo');

    const isRefundable = pricingInfos[0]?.attrib?.Refundable === "true" ? "Refundable" : "NonRefundable"
    const carrier = pricingInfos[0]?.attrib?.PlatingCarrier || "6E"
    console.log(pricingInfos[0]?.attrib)

    pricingInfos.forEach(info => {
        const fareInfoRefsInInfo = info.findall('.//air:FareInfoRef');
        const passengerTypes = info.findall('.//air:PassengerType');
        const paxPrice = attributeToObject(info?.attrib)

        // get booking segment related data

        const passengers = {}
        passengerTypes.forEach((passenger, index) => {
            //console.log(passenger)
            passengers.code = passenger?.attrib.Code || null;
            passengers.paxCount = index + 1;

        })

        // console.log(passengers)

        bookingRelatedData.length === 0 && passengers.code === 'ADT' && (bookingRelatedData = extractBookingInfo(info, passengers.code))
        bookingRelatedData.length === 0 && (bookingRelatedData = extractBookingInfo(info, passengers.code))


        // console.log(paxPrice, passengers.code)
        // make price break down
        paxPrice.code = passengers.code
        paxPrice.paxCount = passengers.paxCount


        const priceBreak = paxPriceMakers(paxPrice)

        //console.log(priceBreak)
        priceBreakDown.push(priceBreak)

        //  console.log(passengers)

        // let seenBrands = {};
        //  let feature = {};


        fareInfoRefsInInfo.forEach(fareInfoRef => {

            const key = fareInfoRef.attrib.Key;
            // console.log(key)
            // using this key get brand information
            const fareInfo = etree.find(`.//air:FareInfo[@Key='${key}']`, etree.namespaces);

            // fare attribute
            const fareAttributeData = attributeToObject(fareInfo?.attrib)
            // get children of fare
            const fareChildren = fareInfo?._children
            // get brand information
            const brandChild = fareChildren.filter(element => element.tag === 'air:Brand');
            const fareBrandAttribute = attributeToObject(brandChild[0]?.attrib)
            // now get the brand information
            const brandElement = etree.find(`.//air:BrandList/air:Brand[@BrandID='${fareBrandAttribute?.BrandID}']`, etree.namespaces);

           //  console.log(fareBrandAttribute)
            // brand raw data
            const brandAttribute = attributeToObject(brandElement?.attrib)
            // get class information of the brand
            //brandAttribute.class = (brandElement?.find('air:Title[@Type="External"]', etree.namespaces)?.text ?? '').trim()
            fareAttributeData.PassengerCode = passengers.code
            fareAttributeData.Carrier = brandAttribute?.Carrier || ""
            let {seenBrands, feature} = processBrand(brandElement, fareAttributeData, airPrice);

            const baggageAllowance = fareChildren.filter(element => element.tag === 'air:BaggageAllowance');
            const bag = {
                paxType: passengers.code,
                paxNumber: passengers.paxCount,
                baggage: extractBaggageWeights(baggageAllowance)
            }

            baggage.push(bag)

            //console.log(baggage)


            featureArray.push(feature);
            seenBrands.feature = featureArray;
            //seenBrands.baggage = baggage
            brandArray.push(seenBrands);


            // console.log({up: fareBrandAttribute})
            if (fareBrandAttribute.UpSellBrandID && fareBrandAttribute.UpSellBrandID !== "false") {

                const upSellBrandElement = etree.find(`.//air:BrandList/air:Brand[@BrandID='${fareBrandAttribute?.UpSellBrandID}']`, etree.namespaces);
                if (upSellBrandElement) {
                    const {
                        seenBrands: upSellSeenBrands,
                        feature: upSellFeature
                    } = processBrand(upSellBrandElement, fareAttributeData, airPrice);
                    featureArray.push(upSellFeature);
                    upSellSeenBrands.feature = featureArray;
                    // upSellSeenBrands.baggage = baggage
                    brandArray.push(upSellSeenBrands);
                }
            }


        });


    });

// deal with segments of journeys


    const baggageArray = splitBaggageSets(baggage)

    const cityCount = extractJourneys(journeyElements, bookingRelatedData, baggageArray);


    const uniqueBrandIds = new Set();
    const uniqueBrandArray = brandArray.map(brand => {
        // Check if the current brandId is already in the Set
        // console.log(brand)
        if (uniqueBrandIds.has(brand.brandId)) {
            // If it's a duplicate, return null
            return null;
        } else {
            // If it's unique, add it to the Set and return the brand
            uniqueBrandIds.add(brand.brandId);

            // Create a Set to store unique feature objects
            const uniqueFeatures = new Set();
            // Create a Set to store unique baggage objects
            const uniqueBaggage = new Set();

            // Filter the features array to keep only unique feature objects
            const uniqueFeatureArray = brand.feature.filter(feature => {
                // Convert the feature object to a JSON string for comparison
                const featureString = JSON.stringify(feature);

                // Check if the current feature is already in the Set
                if (uniqueFeatures.has(featureString)) {
                    // If it's a duplicate, return false to filter it out
                    return false;
                } else {
                    // If it's unique, add it to the Set and return true to keep it
                    uniqueFeatures.add(featureString);
                    return true;
                }
            });

            // Calculate sum of prices in feature array and assign to additionalFare
            const additionalFare = uniqueFeatureArray.reduce((sum, obj) => sum + obj.price, 0);

            // Assign the unique feature array, unique baggage array, and additionalFare to the brand object
            return {
                ...brand,
                feature: uniqueFeatureArray,
                baggage: baggage,
                additionalFare: additionalFare
            };
        }
    }).filter(brand => brand !== null);
// Filter out null entries

//console.log(JSON.stringify(uniqueBrandArray, null, 2))

//console.log(JSON.stringify(priceBreakDown, null, 2))

//console.log(JSON.stringify(baggageArray, null, 2))

    const transitTimes = cityCount.map(calculateTransitTime);

//console.log(JSON.stringify(transitTimes, null, 2))

    const segmentPrices = segmentPriceMaker(airPrice)
    const returnObject = {

        system: 'Indigo',
        tripType,
        journeyType: 'when it determine',
        carrier,
        isRefundable,
        class:  "",
        baseFare: segmentPrices.baseFare,
        taxes: segmentPrices.tax,
        totalFare: segmentPrices.totalFare,
        "isGroupFare": false,
        "partiallyEligible": false,
        brandCount: uniqueBrandArray.length,
        brands: uniqueBrandArray,
        baggage: baggageArray,
        priceBreakDown,
        transit: transitTimes,
        cityCount

    }


    returnData.push(returnObject)

})

//console.log(JSON.stringify(returnData, null, 2))

console.log(returnData.length, counter)

return res.status(200).send(returnData)

};



const AirSearch = async (req, res) => {

  try {
    const targetBranch = 'P4218912';
    const CREDENTIALS = 'Universal API/uAPI4444837655-83fe5101:K/s3-5Sy4c';
    const token = Buffer.from(CREDENTIALS).toString('base64')
    console.log(token)

    const url = `https://apac.universal-api.travelport.com/B2BGateway/connect/uAPI/AirService`
    const headers = {
      'Authorization': `Basic {token}`,
      'Content-Type': 'text/xml'
    }

    const requestbody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header />
  <soapenv:Body>
    <LowFareSearchReq xmlns="http://www.travelport.com/schema/air_v52_0" TraceId="Fly-Far-Tech" TargetBranch="P4218912" ReturnUpsellFare="true" SolutionResult="true">
      <BillingPointOfSaleInfo xmlns="http://www.travelport.com/schema/common_v52_0" OriginApplication="uAPI" />
      <SearchAirLeg>
        <SearchOrigin>
          <CityOrAirport xmlns="http://www.travelport.com/schema/common_v52_0" Code="DAC" PreferCity="true" />
        </SearchOrigin>
        <SearchDestination>
          <CityOrAirport xmlns="http://www.travelport.com/schema/common_v52_0" Code="DXB" PreferCity="true" />
        </SearchDestination>
        <SearchDepTime PreferredTime="2024-05-21" />
      </SearchAirLeg>
      <AirSearchModifiers>
        <PreferredProviders>
          <Provider xmlns="http://www.travelport.com/schema/common_v52_0" Code="ACH" />
        </PreferredProviders>
        <FlightType NonStopDirects="true" StopDirects="true" SingleOnlineCon="true" DoubleOnlineCon="true" TripleOnlineCon="true" SingleInterlineCon="true" DoubleInterlineCon="true" TripleInterlineCon="true" />
      </AirSearchModifiers>
      <SearchPassenger xmlns="http://www.travelport.com/schema/common_v52_0" Code="ADT" BookingTravelerRef="ADT_1" />
      <AirPricingModifiers ETicketability="Required" FaresIndicator="PublicAndPrivateFares" />
    </LowFareSearchReq>
  </soapenv:Body>
</soapenv:Envelope>`



    const [response] = await axios.post(url, requestbody, headers)
    return res.send({ response })

  } catch (error) {
    console.log(error.response)

  }

}

export const onewayService = {
  createToken,
  AirSearch,
  RoundWayresponse
}