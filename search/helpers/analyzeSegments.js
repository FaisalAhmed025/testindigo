import { Constants } from "../../helpers/constant";
import getCountryCodeByAirportCode from "./getAirportByCode";
import getBDCodes from "./getBDCodes";

const analyzeSegments = async (segmentsList = []) => {
  const bdCodes = await getBDCodes();
  // bdCodes.map(code => ({ code: code.code.toLowerCase() }))

  // console.log(bdCodes)
  // Get first segment departure and last segment arrival
  const firstSegmentDeparture = segmentsList[0].departure || "";

  let lastSegmentArrival = segmentsList[segmentsList.length - 1].arrival || "";

  //console.log({lastSegmentArrival})

  // Determine journeyType
  let journeyType = Constants.OUTBOUND;
  let foundLastSegmentArrival = false;
  for (const segment of segmentsList) {
    const departureLower = segment.departure.toLowerCase();
    const arrivalLower = segment.arrival.toUpperCase();

    // If arrival code is not in bdCodes and lastSegmentArrival is not set yet, update lastSegmentArrival
    if (
      !foundLastSegmentArrival &&
      !bdCodes.some((info) => info.code === arrivalLower)
    ) {
      lastSegmentArrival = arrivalLower;
      foundLastSegmentArrival = true;
    }

    if (bdCodes.includes(departureLower) && bdCodes.includes(arrivalLower)) {
      journeyType = Constants.INBOUND;
      break; // Exit loop if any segment is inbound
    }
  }

  // get last arrival

  // console.log({lastSegmentArrival})
  // Determine commissionType
  const { countryName: departureCountry } = await getCountryCodeByAirportCode(
    firstSegmentDeparture?.toUpperCase()
  );
  const { countryName: arrivalCountry } = await getCountryCodeByAirportCode(
    lastSegmentArrival?.toUpperCase()
  );

  let commissionType = "";
  if (departureCountry === Constants.BANGLADESH) {
    commissionType =
      arrivalCountry === Constants.BANGLADESH
        ? Constants.DOMESTIC
        : Constants.SITTI;
  } else {
    commissionType =
      arrivalCountry === Constants.BANGLADESH
        ? Constants.SOTTI
        : Constants.SOTTO;
  }

  return { journeyType, commissionType };
};

export default analyzeSegments;
