import { addProposalSyntaxPlugins } from "@babel/preset-env/lib/filter-items";
import axios from "axios";
import fs, { readSync } from 'fs'
import { DOMParser } from 'xmldom';
import et from 'elementtree'
import { Stream } from "stream";


export const createToken  = async (req,res)=>{
  const targetBranch = 'P4218912';
  const CREDENTIALS = 'Universal API/uAPI4444837655-83fe5101:K/s3-5Sy4c';
  return res.send(Buffer.from(CREDENTIALS).toString('base64'));
}


const onewayresponse = (req, res) => {
  const xmlData = fs.readFileSync('response.xml', 'utf8');
  const etree = et.parse(xmlData);
  
  const airPricingSolutions = etree.findall('.//air:AirPricingSolution');

  airPricingSolutions.forEach(pricePoint => {
    const attributes = pricePoint.attrib;

    console.log(attributes)

    //todo it should in the loop
    const children = pricePoint._children

    const journeys = children.filter(element => element.tag === 'air:Journey');
    const airPrices = children.filter(element => element.tag === 'air:AirPricingInfo');

    // return res.send({journeys,airPrices})

    //  const bookingInfoElements = airPrices._children.filter(element => element.tag === 'air:BookingInfo');


    // const flatBookingInfo = airPricesMakers(airPrices)

    //console.log(flatBookingInfo.passengerWithBookingCode)

    // console.log(JSON.stringify(flatBookingInfo, null, 2));

    journeys.forEach(child => {
        const journey = {}

        // counter++
        console.log("children",child._children)
        // journey.travelTime = convertDuration(child.attrib?.TravelTime) || null
       const tarveltime =(child.attrib?.TravelTime)
        journeys.push(child);
        const airSegmentRefs = child._children.filter(element => element.tag === 'air:AirSegmentRef');

        // console.log({airSegmentRefs} )
        // console.dir( airSegmentRefs, {depth: true});
        const airSegment = []
        // airSegmentRefs.forEach((airSegmentRef) => {
        //     const key = airSegmentRef.attrib?.Key
        //     console.log("key", key)
        //     const data = etree.find(`.//air:AirSegment[@Key='${key}']`, etree.namespaces);


            //if (!data)  continue;

        //     const ccdcdc = data?.attrib
        //     let airAttributes = attributeToObject(data?.attrib);
        //     //console.log(airAttributes)
        //     //   console.log(key)
        //     const mergedData = mergeBookingInfo(flatBookingInfo, key);

        //     if (airAttributes) {
        //         const flightDetailsRefElement = data._children?.find(element => element.tag === 'air:FlightDetailsRef');
        //         const codeShareInfoElement =  getFlightDetailsRefs(data._children, 'air:CodeshareInfo');

        //         //console.log({codeShareInfoElement})

        //         const flightKey = flightDetailsRefElement?.attrib?.Key;

        //         const {attrib = {}} = etree.find(`.//air:FlightDetailsList/air:FlightDetails[@Key='${flightKey}']`, etree.namespaces)

        //         // console.log(attrib)

        //         const segmentData = attributeToObject(attrib)

        //         // console.log({segmentData})


        //         // console.log(segmentData)
        //         segmentData.SegmentRef = segmentData?.Key
        //         delete segmentData?.Key
        //         /*  if (attrib && 'Key' in attrib) {
        //               delete attrib.Key;
        //           }*/
        //        // console.log(codeShareInfoElement[0], airAttributes.Key)
        //         airAttributes = {
        //             ...airAttributes, ...segmentData, ...mergedData, ...{
        //                 OperatingCarrier: codeShareInfoElement[0]?.OperatingCarrier || airAttributes.Carrier,
        //                 OperatingFlightNumber: codeShareInfoElement[0]?.OperatingFlightNumber || airAttributes.FlightNumber,
        //             }
        //         }


        //         //  console.log(segmentDetails)

        //     }

        //     console.log(airAttributes)
        //     const returnedData = {

                
        //     }

        //     airSegment.push(airAttributes)

        // })

        // journey.segments = airSegment;

        // journeysArray.push(journey)

        return res.send({TravelTime:tarveltime})
    })
})
  
};




function getAttributes(node) {
  const attributes = node.attributes;
  const result = {};
  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i];
    result[attribute.name] = attribute.value;
  }
  return result;
}


const AirSearch = async(req,res)=>{

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

  const requestbody =`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
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
return res.send({response})
  
} catch (error) {
  console.log(error.response)
  
}

}

export const onewayService ={
  createToken,
  AirSearch,
  onewayresponse
}