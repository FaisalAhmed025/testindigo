import galileoRequest from "../../share/galileoRequest";
import generateSoapRequest from "./bodyMaker";
import generatePassengerCounts from "./generatePassengerCounts";

const createSearch = async (req, res, next) => {
  try {
    const {
      body: {
        adultCount,
        childCount,
        infantCount,
        segmentsList,
        cabin,
        vendorPref,
      },
    } = req;

    const passengers = generatePassengerCounts(
      adultCount,
      childCount,
      infantCount
    );

    const searchRequest = {
      airLegs: segmentsList,
      passengers,
      airClass: cabin,
    };

    //console.log(searchRequest)

    if (vendorPref && vendorPref.length > 0) {
      searchRequest.permittedCarriers = vendorPref;
    }

    const searchBody = generateSoapRequest(searchRequest);

    // console.log(searchBody)
    const response = await galileoRequest(searchBody);

    //  console.log('after hit', response)

    return response?.data || [];
  } catch (err) {

    console.log(err)
    return  []
  }
};

export default createSearch;
