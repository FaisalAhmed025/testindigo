import fetchDataFromAirlines from "./fetchDataFromAirlines";


const getAirlineData = async () => {

    return await fetchDataFromAirlines();
};

export default getAirlineData