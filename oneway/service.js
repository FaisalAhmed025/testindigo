import { addProposalSyntaxPlugins } from "@babel/preset-env/lib/filter-items";
import axios from "axios";
import fs, { readSync } from 'fs'
import { DOMParser } from 'xmldom';
import et from 'elementtree'
import { Stream } from "stream";


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

  //airpricing Solution
  const airPricingSolutions = etree.findall('./air:AirPricingSolution');

  const flightData = [];
  airPricingSolutions.forEach(data => {
    const key = data?.attrib?.Key || ""
    const completeItinerary = data?.attrib?.CompleteItinerary
    const totalPrice = data?.attrib?.TotalPrice
    const basePrice = data?.attrib?.BasePrice
    const approximateTotalPrice = data?.attrib?.ApproximateTotalPrice
    const approximateBasePrice = data?.attrib?.ApproximateBasePrice
    const taxes = data?.attrib?.Taxes
    const approximateTaxes = data?.attrib?.ApproximateTaxes

    // Airpricing 
    const pricingInfos = data.findall('.//air:AirPricingInfo');
    const priceBreakDown = []
    pricingInfos.forEach(info => {
      const fareInfoRefsInInfo = info.findall('.//air:FareInfoRef');
      const passengerTypes = info.findall('.//air:PassengerType');
      const paxPrice = attributeToObject(info?.attrib)

      const passengers = {}
      passengerTypes.forEach((passenger, index) => {
        passengers.code = passenger?.attrib.Code || null;
        passengers.paxCount = index + 1;
      })
      paxPrice.code = passengers.code
      paxPrice.paxCount = passengers.paxCount
      const priceBreak = paxPriceMakers(paxPrice)
      priceBreakDown.push(priceBreak)
    })


    //AirBooking
    const AIRBookingInfo = data.findall('.//air:BookingInfo')
    const bookingInfo = []
    AIRBookingInfo.forEach(data => {
      const BookingCode = data?.attrib?.BookingCode
      const BookingCount = data?.attrib?.BookingCount
      const CabinClass = data?.attrib?.CabinClass
      const FareInfoRef = data?.attrib?.FareInfoRef
      const SegmentRef = data?.attrib?.SegmentRef
      const HostTokenRef = data?.attrib?.HostTokenRef
      bookingInfo.push({ BookingCode, BookingCount, CabinClass, FareInfoRef, SegmentRef, HostTokenRef })
    })

    const AirJournay = data.findall('.//air:Journey')
    const airjournay =[]
    // console.log(AirJournay);


    AirJournay.forEach(data =>{
      const TravelTime = data?.attrib?.TravelTime
      const AirSegmentRef = data.findall('.//air:AirSegmentRef')
      const airsegemntkey = []
      AirSegmentRef.forEach(data=>{
        const key  = data?.attrib?.Key;
        airsegemntkey.push({key})
      })
      airjournay.push({TravelTime,airsegemntkey})
    })

    flightData.push({ key, completeItinerary, totalPrice, basePrice, approximateTotalPrice, approximateBasePrice, taxes, approximateTaxes, airjournay, bookingInfo, priceBreakDown })
  });

  res.json({ flightData: flightData });
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