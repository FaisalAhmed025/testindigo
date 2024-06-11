import commonFunctions from "./commonFunctions";
import {Constants} from "../../helpers/constant";

function getUniqueBrand(brandArray, baggage) {

    const uniqueBrandIds = new Set();
    const uniqueBrandArray = brandArray.map(brand => {
        // Check if the current brandId is already in the Set
        // console.log(brand)
        if (uniqueBrandIds.has(brand.brandId)) {
            // If it's a duplicate, return null
            return null;
        } else {
            // If it's unique, add it to the Set and return the brand
            uniqueBrandIds.add(brand.brandId);

            // Create a Set to store unique feature objects
            const uniqueFeatures = new Set();
            // Create a Set to store unique baggage objects
            const uniqueBaggage = new Set();

            // Filter the features array to keep only unique feature objects
            const uniqueFeatureArray = brand.feature.filter(feature => {
                // Create a copy of the feature object without the "description" property
                const {description, ...featureWithoutDescription} = feature;

                // Convert the feature object (without description) to a JSON string for comparison
                const featureString = JSON.stringify(featureWithoutDescription);

                // Check if the current feature (without description) is already in the Set
                if (uniqueFeatures.has(featureString)) {
                    // If it's a duplicate, return false to filter it out
                    return false;
                } else {
                    // If it's unique, add it to the Set and return true to keep it
                    uniqueFeatures.add(featureString);
                    return true;
                }
            });

            // Calculate sum of prices in feature array and assign to additionalFare
          let additionalFare = uniqueFeatureArray.reduce((sum, obj) => sum + obj.price, 0);

          additionalFare = additionalFare +   brand.taxes

            // Assign the unique feature array, unique baggage array, and additionalFare to the brand object
            const fareBasisCode = commonFunctions.getNestedValue(uniqueFeatureArray, '0.fareBasis', "")

            const difference = Math.abs(brand.baseFare - additionalFare)
            const finalAdditionalFare = brand.baseFare === additionalFare ? `${Constants.BDT} ${Constants.ZERO.toString()}` : brand.baseFare > additionalFare ? `- ${Constants.BDT} ${difference}` : `+ ${Constants.BDT} ${difference}`;


            brand.totalFare = additionalFare

            // console.log(brand.fareBasisCode)
            return {
                ...brand,
                fareBasisCode,
                feature: uniqueFeatureArray,
                baggage: baggage,
                additionalFare: finalAdditionalFare
            };
        }
    }).filter(brand => brand !== null);
    return uniqueBrandArray;
}

export default getUniqueBrand