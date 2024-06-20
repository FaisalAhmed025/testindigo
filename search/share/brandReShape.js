import { featureConstants } from '../../helpers/featureConstants';
import featureCodes from '../../helpers/featureCodes';
import { Constants } from '../../helpers/constant';
import amenities from '../../helpers/amenities';


const brandReShape = (brand = [], structureFareRule =[], isRefundable ) => {

  //  const descriptions = brand[0]?.feature[0]?.description || [];
  // const { otherFeatures } = categorizeDescriptions(descriptions);

  const brandFareRule = createBrandFareRule(structureFareRule)


  // updateAmenities(amenities,  otherFeatures);

  brand.forEach((singleBrand, index) => {

    const singleDescriptions = singleBrand.feature[0]?.description || [];

    // console.log(singleBrand.feature[0]?.description)

    const { otherFeatures, baggageFeatures} = categorizeDescriptions(singleDescriptions);

    // console.log(baggageFeatures, otherFeatures);
    singleBrand.baggageFeatures = baggageFeatures

    // Identify if "refund" and "reissue" codes are present in otherFeatures
    const hasRefundOrReissue = otherFeatures.some(feature =>
      ['refund', 'reissue'].includes(feature.code.toLowerCase())
    );

    // If "refund" or "reissue" are present, create a regex to filter them out
    const refundReissueRegex = hasRefundOrReissue ? /refund|reissue/i : null;

    // Filter brandFareRule to remove objects whose message contains "refund" or "reissue"
    const filteredBrandFareRule = refundReissueRegex
      ? brandFareRule.filter(rule => !refundReissueRegex.test(rule.message))
      : brandFareRule;



    if (index !== 0) {
     /* const filteredOtherFeatures = otherFeatures.filter(feature => {
        return !amenities.some(amenity => amenity.name === feature.code);
      });*/

      singleBrand.otherFeatures = otherFeatures;
    }
    else {

      singleBrand.otherFeatures = [...otherFeatures, ...filteredBrandFareRule];
    }


    // Set description to empty array for features where code is not 'ADT'
    let firstADTEncountered = false;
    singleBrand.feature.forEach(feature => {
      if (feature.code === Constants.ADULT) {
        if (!firstADTEncountered) {
          firstADTEncountered = true;
        } else {
          feature.description = [];
        }
      } else {
        feature.description = [];
      }
    });
  });


}

const createBrandFareRule = (structureFareRule = []) => {

  // handle fareRules

  const matches = [];

  structureFareRule.forEach(entry => {
    if (entry.amount !== null && entry.isRefundable === Constants.REFUNDABLE) {
      const message = `${entry.type} ${entry.applicability} amount is BDT ${entry.amount}`;
      const code = "money";
      matches.push({ message, code });
    }
  });

  return matches

}

const categorizeDescriptions = (descriptions) => {
  const regex = /[^\w\s]/g; // Match any character that is not a word character or whitespace
  const matches = [];
  const ignorePhrases = [
    'refer fare quote',
    'please note that'
  ];

  // Function to clean and normalize text
 // Function to clean and normalize text
 const cleanText = text => {
  if (typeof text !== 'string') return ''; // Ensure text is a string
  return text
      .toLowerCase()
      .replace(regex, ' ') // Remove special characters except hyphens
      .replace(/-/g, ' '); // Replace hyphens with spaces
};
// Function to check if a description should be ignored
  const shouldIgnoreDescription = description => {
    const cleanedDescription = cleanText(description);
    return ignorePhrases.some(phrase => cleanedDescription.includes(cleanText(phrase)));
  };

  descriptions.forEach(description => {
    if (shouldIgnoreDescription(description)) {
      return; // Skip this description if it contains any ignored phrase
    }
    const cleanedDescription = cleanText(description);

    // console.log({cleanedDescription})
    const matchedCodes = new Set();

    // Check if any commercialName is present in the cleaned description
    featureCodes.forEach(entry => {
      entry.commercialName.forEach(name => {
        const cleanedName = cleanText(name);
        if (cleanedDescription.includes(cleanedName)) {
          matchedCodes.add(entry.code);
        }
      });
    });

    // Push all matched codes to the matches array
    if (matchedCodes.size > 0) {
      matchedCodes.forEach(code => {
        matches.push({ message: description, code });
      });
    }
  });


  // console.log(matches);
  const baggageCodes = [featureConstants.CABIN_BAG, featureConstants.CHECKING_BAG];

  const baggageFeatures = matches.filter(match => baggageCodes.includes(match.code)) || [];
  const otherFeatures = matches.filter(match => !baggageCodes.includes(match.code)) || [];

  return {baggageFeatures, otherFeatures}

}


// const IndidocategorizeDescriptions = (descriptions) => {
//   const regex = /[^\w\s]/g; // Match any character that is not a word character or whitespace
//   const ignorePhrases = [
//       'refer fare quote',
//       'please note that'
//   ];

//   // Function to clean and normalize text
//     // Function to clean and normalize text
//     const cleanText = text => {
//       if (typeof text !== 'string') return ''; // Ensure text is a string
//       return text
//           .toLowerCase()
//           .replace(regex, ' ') // Remove special characters except hyphens
//           .replace(/-/g, ' '); // Replace hyphens with spaces
//   };
//   // Function to check if a description should be ignored
//   const shouldIgnoreDescription = description => {
//       const cleanedDescription = cleanText(description);
//       return ignorePhrases.some(phrase => cleanedDescription.includes(cleanText(phrase)));
//   };

//   descriptions.forEach(description => {
//       if (shouldIgnoreDescription(description)) {
//           return; // Skip this description if it contains any ignored phrase
//       }
//       const cleanedDescription = cleanText(description);
//       const matchedCodes = new Set();

//       // Check if any commercialName is present in the cleaned description
//       featureCodes.forEach(entry => {
//           entry.commercialName.forEach(name => {
//               const cleanedName = cleanText(name);
//               if (cleanedDescription.includes(cleanedName)) {
//                   matchedCodes.add(entry.code);
//               }
//           });
//       });

//       // Log or process matched codes as needed
//       console.log(`Description: "${description}" matches codes: ${[...matchedCodes].join(', ')}`);
//   });
// };



export default brandReShape;