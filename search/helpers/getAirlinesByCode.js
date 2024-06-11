import getAirlineData from "./getAirlineData";


const getAirlinesByCode = async (code = "") => {

    const airlines = await getAirlineData() || []
    const data = airlines.find((airport) => airport.code === code);

    return data || {id: null, code: '', name: '', lccCarrier: false, control: false}
};

export default getAirlinesByCode