function checkRouteAndCityCount(route = [{}], cityCount = [[{}]]) {
  // If route or cityCount is null or undefined, return false
  if (!route || !cityCount) {
    return false;
  }

  // Flatten the cityCount array
  const flattenedCityCount = cityCount.flat();

  // If the route or flattenedCityCount is empty, return false
  if (route.length === 0 || flattenedCityCount.length === 0) {
    return false;
  }

  // Get the first departure from the route
  const routeFirstDeparture = route[0]?.departure;
  // Get the last arrival from the route
  const routeLastArrival = route[route.length - 1]?.arrival;

  // Get the first departure from the flattened cityCount
  const cityCountFirstDeparture = flattenedCityCount[0]?.departure;
  // Get the last arrival from the flattened cityCount
  const cityCountLastArrival = flattenedCityCount[flattenedCityCount.length - 1]?.arrival;

  // If any of the values are undefined or null, return false
  if (
    routeFirstDeparture == null ||
    routeLastArrival == null ||
    cityCountFirstDeparture == null ||
    cityCountLastArrival == null
  ) {
    return false;
  }

  // Compare the values and return the result
  return routeFirstDeparture === cityCountFirstDeparture && routeLastArrival === cityCountLastArrival;
}

export default checkRouteAndCityCount;