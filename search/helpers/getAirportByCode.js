import getAirportData from "./getAirportData";

// Function to get country code by airport code
const getCountryCodeByAirportCode = async (code = "") => {
  const airport = (await getAirportData()) || [];
  const data = airport?.find((airport) => airport.code === code);

  return data
    ? data
    : {
        id: null,
        code: "",
        name: "",
        cityCode: "",
        cityName: "",
        countryName: "",
        countryCode: "",
        address: "",
      };
};

export default getCountryCodeByAirportCode;
