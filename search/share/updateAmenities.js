function updateAmenities(amenities = [], otherFeatures = [{}]) {
  const amenitiesArray = [];
  //  console.log(amenities, otherFeatures);
  otherFeatures.forEach(match => {
    const amenity = amenities.find(amenity => amenity.name === match.code);
    if (amenity) {
      amenity.present = true;
      amenity.message = match.message;

      amenitiesArray.push(amenity);
    }

  });


  return amenitiesArray;
}

export default updateAmenities;