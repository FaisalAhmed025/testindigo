import et from 'elementtree';
import moment from 'moment';
import { Constants } from '../../helpers/constant';
import { generateUUID } from '../../helpers/uuid';
import aircraftService from '../helpers/aircraftService';
import getAirlinesByCode from '../helpers/getAirlinesByCode';
import getAirportByCode from '../helpers/getAirportByCode';
import commonFunctions from '../share/commonFunctions';
import extractBookingInfo from '../share/extractBookingInfo';
import getFareData from '../share/getFareData';
import processBrand from '../share/processBrand';
import extractJourneys from '../share/extractJourneys';
import getUniqueBrand from '../share/getUniqueBrand';
import brandReShape from '../share/brandReShape';
import updateAmenities from '../share/updateAmenities';
import amenities from '../../helpers/amenities';
import fs, { readSync } from 'fs'

const asfterSearch = async (req,res) => {
  try {
    const xmlData = fs.readFileSync('response.xml', 'utf8');
    const etree = et.parse(xmlData);
    // const etree = et.parse(searchResult);

//function


// find the LowFareSearchRsp

    const airPricingSolutions = etree.findall('.//air:AirPricingSolution');


// determine journey route
    const routeList = etree.findall('air:RouteList/air:Route');

    const routes = commonFunctions.extractRoutes(routeList);
    //console.log(routes);


    //console.log(tripType)

    let counter = 0;


    const returnData = [];

    // const pricePoint = airPricingSolutions[1]
    for (const pricePoint of airPricingSolutions) {

      counter++;

      let fareRulesArray = [];
      let upSellFareRulesArray = [];
      const brandArray = [];
      const featureArray = [];
      const upSellFeatureArray = [];
      const brandBaggageArray = [];

      const upSellBrandBaggageArray = [];
      const priceBreakdown = [];
      let baggage = [];
      let bookingRelatedData = [];
      let structureFareRule = [];
      let processedPassenger = false;
      const airPrice = commonFunctions.attributeToObject(pricePoint?.attrib);

//console.log(airPrice)
//todo it should in the loop
      const children = pricePoint._children;

      children.filter(element => element.tag === 'air:Journey');
      const journeyElements = pricePoint.findall('.//air:Journey');


      const pricingInfos = pricePoint.findall('.//air:AirPricingInfo');

      let isRefundable = pricingInfos[0]?.attrib?.Refundable === 'true' ? Constants.REFUNDABLE : Constants.NONREFUNDABLE;
      const carrier = pricingInfos[0]?.attrib?.PlatingCarrier  || '';

//console.log(isRefundable, carrier)


      pricingInfos.forEach(info => {
        const fareInfoRefsInInfo = info.findall('.//air:FareInfoRef');
        const passengerTypes = info.findall('.//air:PassengerType');
        const paxPrice = commonFunctions.attributeToObject(info?.attrib);


        const airpreicetax = pricePoint.findall('.//air:TaxInfo')
        // console.log("airpreicetax", airpreicetax)
        // get booking segment related data
        
        airpreicetax.forEach((element) => {
          const category = element.attrib.Category;
          const amount = element.attrib.Amount;
          const key = element.attrib.Key;
          const supplierCode = element.attrib.SupplierCode;
      
          console.log(`Category: ${category}`);
          console.log(`Amount: ${amount}`);
          console.log(`Key: ${key}`);
          console.log(`Supplier Code: ${supplierCode}`);
          console.log('-------------------');
      });
      

        const passengers = {};
        passengerTypes.forEach((passenger, index) => {
          //console.log(passenger)
          passengers.code = passenger?.attrib.Code || null;
          passengers.paxCount = index + 1;

        });

        // get short fare rules  ChangePenalty and  CancelPenalty
        const changePenalty = info.findall('.//air:ChangePenalty');

        const cancelPenalty = info.findall('.//air:CancelPenalty');

        if (passengers.code === 'ADT' && isRefundable === Constants.REFUNDABLE) {


          // console.log({cancelPenalty, changePenalty})
          const passengerPrice = commonFunctions.extractNumberFromString(paxPrice.ApproximateTotalPrice || '') || 0;

          structureFareRule = commonFunctions.createPenaltyObjects(changePenalty, cancelPenalty, isRefundable, passengerPrice);
          //console.log(penaltyObjects);
          // structureFareRule = penaltyObjects
        }

        if (!structureFareRule.length) structureFareRule = commonFunctions.createPenaltyObjects(changePenalty, cancelPenalty, isRefundable);

        //  console.log(passengers, info)

        // todo  get booking per segment bag data

        //  console.log('data', extractBookingInfo(info, passengers))
        // const bookingData =  extractBookingInfo(info, passengers)

        // now get the segment bag

        bookingRelatedData.push(extractBookingInfo(etree, info, passengers));

        // bookingRelatedData.length === 0 && passengers.code === 'ADT' && (bookingRelatedData = extractBookingInfo(info, passengers))
        //bookingRelatedData.length === 0 && (bookingRelatedData = extractBookingInfo(info, passengers))


        // console.log(paxPrice, passengers.code)
        // make price break down
        paxPrice.code = passengers.code;
        paxPrice.paxCount = passengers.paxCount;


        const priceBreak = commonFunctions.paxPriceMakers(paxPrice,airpreicetax);

        //console.log(priceBreak)
        priceBreakdown.push(priceBreak);

        //  console.log(passengers)

        // let seenBrands = {};
        //  let feature = {};


        fareInfoRefsInInfo.forEach(fareInfoRef => {

          const key = fareInfoRef.attrib.Key;
          // console.log(key)
          // using this key get brand information
          const {
            fareAttributeData,
            fareBrandAttribute,
            brandElement,
            bag,
            brandAttribute,
            upSellFareBasis,
            upSellFareKey
          } = getFareData(etree, key, passengers);

          baggage.push(bag);

        //  if (!processedPassenger) {

            //  console.log(fareBrandAttribute)
            fareAttributeData.BrandTier = fareBrandAttribute.BrandTier;
            if (!commonFunctions.isEmptyObject(brandAttribute)) {

              let { seenBrands, feature } = processBrand(etree, brandElement, fareAttributeData, airPrice);
              featureArray.push(feature);
              seenBrands.feature = featureArray;
              //seenBrands.baggage = baggage
              brandArray.push(seenBrands);
           }


            // console.log({up: fareBrandAttribute})
            if (fareBrandAttribute.UpSellBrandID && fareBrandAttribute.UpSellBrandID !== 'false') {

              const upSellBrandElement = etree.find(`.//air:BrandList/air:Brand[@BrandID='${fareBrandAttribute?.UpSellBrandID}']`, etree.namespaces);
              if (upSellBrandElement) {
                //console.log(upSellFareBasis, fareAttributeData?.FareBasis)
                const upSellFareInfo = etree.find(`.//air:FareInfo[@Key='${upSellFareKey}']`, etree.namespaces);

                  const upSellBrandElement = etree.find(`.//air:BrandList/air:Brand[@BrandID='${fareBrandAttribute?.BrandID}']`, etree.namespaces);
    

                // fare attribute
                const upSellFAttributeData = commonFunctions.attributeToObject(upSellFareInfo?.attrib);

                const brandChild = upSellFareInfo?._children.filter(element => element.tag === 'air:Brand') || [];
                const upSellFareBrandAttribute = commonFunctions.attributeToObject(brandChild[0]?.attrib);

                upSellFAttributeData.PassengerCode = passengers.code;
                upSellFAttributeData.BrandTier = upSellFareBrandAttribute.BrandTier;
                 fareAttributeData.BrandTier = fareBrandAttribute.BrandTier;
                fareAttributeData.FareBasis = upSellFareBasis || fareAttributeData?.FareBasis;
                //   console.log(upSellFAttributeData)
                const {
                  seenBrands: upSellSeenBrands,
                  feature: upSellFeature
                } = processBrand(etree, upSellBrandElement, upSellFAttributeData || fareAttributeData, airPrice);
                upSellFeatureArray.push(upSellFeature);
                upSellSeenBrands.feature = upSellFeatureArray;
                // upSellSeenBrands.baggage = baggage
                brandArray.push(upSellSeenBrands);
              }
            }

          /*  processedPassenger = true;
          }*/


          //  fareInfoRefs.push(key);
        });


      });

// deal with segments of journeys


      const baggageArray = commonFunctions.splitBaggageSets(baggage);


      const cityCount = await extractJourneys(etree, journeyElements, bookingRelatedData);

      const uniqueBaggage = commonFunctions.removeDuplicateBaggageArrays(baggageArray, cityCount.length);


      const uniqueBrandArray = getUniqueBrand(brandArray, baggage);
// Filter out null entries

//console.log(JSON.stringify(uniqueBrandArray, null, 2))

//console.log(JSON.stringify(priceBreakDown, null, 2))

//console.log(JSON.stringify(baggageArray, null, 2))
      const system = Constants.INDIGO
      const transitTimes = cityCount.map(commonFunctions.calculateTransitTime);

//console.log(JSON.stringify(transitTimes, null, 2))

      //  console.log(airPrice)

      const segmentPrices = commonFunctions.segmentPriceMaker(airPrice);
      const segmentArray = commonFunctions.extractSegmentArray(cityCount);
      const brandResult = commonFunctions.getFilteredBrands(uniqueBrandArray);
      const airPriceData = [{ segmentArray, brandResult, system, structureFareRule }];

      brandReShape(uniqueBrandArray, structureFareRule, isRefundable);
      const amenitiesArray = updateAmenities(amenities, uniqueBrandArray[0]?.otherFeatures || []);

      const carrierName = await getAirlinesByCode(carrier) || {};
      const returnObject = {
        system,
        uuid: generateUUID(),
        bookingCode: bookingRelatedData[0]?.BookingCode || cityCount[0][0].bookingClass || '',
        // tripType: body.tripType || '',
        // journeyType: body.journeyType || '',
        // commissionType: body.commissionType || '',
        carrier:cityCount[0][0].marketingCarrier,
        carrierName: cityCount[0][0].operatingCarrierName|| '',
        isRefundable,
        class: cityCount[0][0].cabinCode || '',
        baseFare: segmentPrices.baseFare,
        taxes: segmentPrices.tax,
        totalFare: segmentPrices.totalFare,
        isGroupFare: false,
        partiallyEligible: false,
        route:  routes || [],
        amenities: amenitiesArray,
        brandCount: uniqueBrandArray.length,
        brands: uniqueBrandArray,
        baggage: uniqueBaggage,
        priceBreakdown,
        transit: transitTimes,
        flightAmenities: commonFunctions.getDeviceFeatures(),
        cityCount,
        airPriceData
      };

      returnData.push(returnObject);
    }


    // //console.log(JSON.stringify(returnData, null, 2))

    //  console.log(returnData.length, counter)

    // //  / Function to extract relevant fields for comparison
    //  function extractRelevantFields(obj) {
    //   console.log(obj.totalFare)
    //    return {
    //      totalFare: obj.totalFare,
    //    };
     
    //  }
     
//      // Function to group objects by their relevant fields
//      function groupObjectsByRelevantFields(data) {
//        const map = new Map();
//        data.forEach(item => {
//          const key = JSON.stringify(extractRelevantFields(item));
//          if (!map.has(key)) {
//            map.set(key, []);
//          }
//          map.get(key).push(item);
//        });
//        return map;
//      }
// // Function to sort objects by totalFare
// function sortByTotalFare(data) {
//   return data.sort((a, b) => a.totalFare - b.totalFare);
// }

// // Sort the objects
// const sortedData = sortByTotalFare(returnData);
//      const groupedMap = groupObjectsByRelevantFields(sortedData);
     
//      // Arrays to store identical and different objects
//      const identicalObjects = [];
     
//      // Separate identical and different objects
//      groupedMap.forEach((value, key) => {
//        if (value.length > 1) {
//          const [first, ...rest] = value;
//          const identicalGroup = {
//            ...first,
//            seemore: rest
//          };
//          identicalObjects.push(identicalGroup);
//        }
//      });




   //  / Function to extract relevant fields for comparison
   function extractRelevantFields(obj) {
    return {
      cityCount: obj.cityCount.map(cityArray => cityArray.map(city => ({
        marketingFlight: city.marketingFlight
      })))
    };
  }

  // Function to group objects by their relevant fields
  function groupObjectsByRelevantFields(data) {
    const map = new Map();
    data.forEach(item => {
      const key = JSON.stringify(extractRelevantFields(item));
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    });
    return map;
  }

  // Group the objects by their relevant fields
  const groupedMap = groupObjectsByRelevantFields(returnData);

  // Arrays to store identical and different objects
  const identicalObjects = [];

  // Separate identical and different objects
  groupedMap.forEach((value, key) => {
    if (value.length > 1) {
      const [first, ...rest] = value;
      const identicalGroup = {
        ...first,
        seemore: rest
      };
      identicalObjects.push(identicalGroup);
    }
  });
   
  
  
    
     
     // Return the arrays
     const result = {
       identicalObjects: identicalObjects
     };
     

return res.send({ result:result });

  } catch (err) {

    console.log(err);
    return [];
  }
};



const fareRule = async (req, res) => {
  try {
    const xmlData = fs.readFileSync('fareRule.xml', 'utf8');
    const etree = et.parse(xmlData);

    const fareRules = etree.findall('.//air:FareRuleLong') || [];

    if (!fareRules || !fareRules.length) return res.send([]);

    const fareTypes = [
      "Regular / Promo - One Way retail",
      "Return Fare - Applicable for Round-Trip journey",
      "Family Fare - Applicable on a minimum of 4 pax booked on the same PNR",
      "Flexi Fare - Unlimited changes 4 Days and Above left for departure for domestic and international sectors. Fare difference applies.",
      "SME Fare - We’ve got a deal that’ll give our travel partners an edge. Unlock a discounted seat* along with lower change and cancellation fee, when you book for business travellers with SME fares. *T&C apply.",
      "Lite fare - Applicable for travel without a check-in baggage. Applicable for travel beyond 15 days from the booking date on Domestic and same day on International travel. For a multi-leg/return journey, Lite Fare will be available only if it is available and selected on each of the individual legs.",
      "Corporate / Coupon Fare - Available for contracted Corporate Customers only. Allows unlimited flexibility to change / cancel, extra hand-baggage allowance, complimentary seat and meal (1 food item & 1 beverage).",
      "Super 6E Fare - The “Super 6E” fare will include an extra 10kg baggage allowance, free seat selection including XL seat, meal / snack combo, check-in first and get your bags before anyone else, anytime boarding, delayed and lost baggage protection service and reduced change and cancellation fee, as well as no convenience fee."
    ];

    const keywords = ["Baggage Conditions", "Change Fee / Cancel Fee", "Change Fee", "Cancellation Fee", "Cancellation Fee:", "Baggage Conditions:", "Change Fee:"];
    const ignoreTexts = ["Terms and Conditions IndiGo Fares Terms & Conditions"];
    const categorizedFareRules = {};

    let currentFareType = '';
    let currentCategory = '';
    let details = [];

    fareRules.forEach(rule => {
      const textContent = rule.text ? rule.text.trim() : '';
      const textLines = textContent.split('\n').map(line => line.trim()).filter(line => line !== '');

      textLines.forEach(line => {
        if (ignoreTexts.includes(line)) return; // Ignore specific text

        if (fareTypes.includes(line)) {
          currentFareType = line;
          currentCategory = '';
          details = [];
          if (!categorizedFareRules[currentFareType]) {
            categorizedFareRules[currentFareType] = {};
          }
        } else if (keywords.includes(line)) {
          currentCategory = line;
        } else if (currentFareType && currentCategory) {
          if (!categorizedFareRules[currentFareType][currentCategory]) {
            categorizedFareRules[currentFareType][currentCategory] = [];
          }
          categorizedFareRules[currentFareType][currentCategory].push(line);
        }
      });
    });

    // Prepare response format
    const readyFareRules = Object.keys(categorizedFareRules).map(fareType => {
      const rulesForType = Object.keys(categorizedFareRules[fareType]).map(category => {
        return {
          Title: category,
          Text: categorizedFareRules[fareType][category].join(' ')
        };
      });
      return {rulesForType };
    });

    return res.send({ readyFareRules });
  } catch (error) {
    console.error('Error in parsing fare rules:', error);
    return res.status(500).send({ error: 'Error in parsing fare rules' });
  }
};


// const fareRule = async (req, res) => {
//   const xmlData = fs.readFileSync('fareRule.xml', 'utf8');
//   const etree = et.parse(xmlData);

//   const fareRules = etree.findall('.//air:FareRuleLong') || [];

//   if (!fareRules || !fareRules.length) return res.send([]);

//   const keywords = ["Baggage Conditions", "Change Fee / Cancel Fee", "Change Fee", "Cancellation Fee", "Cancellation Fee:", "Baggage Conditions:", "Change Fee:"];
//   const ignoreTexts = ["Terms and Conditions IndiGo Fares Terms & Conditions", "Regular / Promo - One Way retail"];
//   const categorizedFareRules = {};

//   fareRules.forEach(rule => {
//     const textContent = rule.text ? rule.text.trim() : '';
//     const textLines = textContent.split('\n').map(line => line.trim()).filter(line => line !== '');

//     let currentCategory = '';
//     let details = new Set();

//     textLines.forEach(line => {
//       if (ignoreTexts.includes(line)) return; // Ignore specific text

//       if (keywords.includes(line)) {
//         if (currentCategory && details.size) {
//           if (!categorizedFareRules[currentCategory]) {
//             categorizedFareRules[currentCategory] = new Set();
//           }
//           details.forEach(detail => categorizedFareRules[currentCategory].add(detail));
//           details.clear();
//         }
//         currentCategory = line;
//       } else {
//         details.add(line);
//       }
//     });

//     if (currentCategory && details.size) {
//       if (!categorizedFareRules[currentCategory]) {
//         categorizedFareRules[currentCategory] = new Set();
//       }
//       details.forEach(detail => categorizedFareRules[currentCategory].add(detail));
//     }
//   });

//   // Mapping the categories with the text
//   const readyFareRules = Object.keys(categorizedFareRules).map(category => {
//     return {
//      Title: category,
//       text: Array.from(categorizedFareRules[category]).join(' ')
//     };
//   });

//   return res.send({ readyFareRules }) || [];
// };



export const  asfterSearchService ={
  asfterSearch,
  fareRule
}
