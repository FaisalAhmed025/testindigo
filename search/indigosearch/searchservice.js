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


        // get booking segment related data


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


        const priceBreak = commonFunctions.paxPriceMakers(paxPrice);

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
        // amenities: amenitiesArray,
        brandCount: uniqueBrandArray.length,
        brands: uniqueBrandArray,
        baggage: uniqueBaggage,
        priceBreakdown,
        transit: transitTimes,
        //flightAmenities: commonFunctions.getDeviceFeatures(),
        cityCount,
        // airPriceData
      };

      returnData.push(returnObject);
    }


    //console.log(JSON.stringify(returnData, null, 2))

    //  console.log(returnData.length, counter)

    return  res.send({returnData});
  } catch (err) {

    console.log(err);
    return [];
  }
};

export const  asfterSearchService ={
  asfterSearch
}
