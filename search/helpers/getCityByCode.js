import getAirportData from "./getAirportData";

const getCityByCode = async (code) => {
  const airport = (await getAirportData()) || [];
  const data = airport.find((cityCode) => cityCode.cityCode === code);
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

export default getCityByCode;
