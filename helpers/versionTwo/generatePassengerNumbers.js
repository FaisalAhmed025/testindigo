import {Constants} from "../constant";

/**
 * Generate passenger numbers based on traveler types and codes.
 * @function generatePassengerNumbers
 * @param {Object[]} travelers - Array of traveler objects.
 * @returns {number[]} - Array of passenger numbers.
 */
const generatePassengerNumbers = travelers => {
    let passengerNumbers = [];
    // Filter out duplicate passenger codes
    const uniquePassengerCodes = Array.from(new Set(travelers.map(traveler => traveler.passengerCode)));

    // Check each unique passenger code
    uniquePassengerCodes.forEach(passengerCode => {
        travelers.find(traveler => traveler.passengerCode === passengerCode)?.type;
    })

    console.log(uniquePassengerCodes)

    // Check if ADT is present
    if (uniquePassengerCodes.includes("ADT")) {
        passengerNumbers.push(Constants.ONE);
    }

    // Check if C01 to C06 are present
    const c01ToC06PresentArray = ["C01", "C02", "C03", "C04", "C05", "C06"]
    const c07ToC11PresentArray = ["C07", "C08", "C09", "C10", "C11"]
    // Check if C01 to C06 are present
    const c01ToC06Present = uniquePassengerCodes.some(code => c01ToC06PresentArray.includes(code))

    // Check if C07 to C11 are present
    const c07ToC11Present = uniquePassengerCodes.some(code => c07ToC11PresentArray.includes(code))

    // Assign passenger numbers based on the presence of passenger codes

    // console.log(c01ToC06Present)
    // child with 6 years or less than are present
    if (c01ToC06Present) {
        passengerNumbers.push(Constants.TWO);
    }

    // child with 7 years or higher than are present but less than 6 not present
    if (c07ToC11Present && !c01ToC06Present) {
        passengerNumbers.push(Constants.TWO);
    }
    // both age children are present
    if (c07ToC11Present && c01ToC06Present) {
        passengerNumbers.push(Constants.THREE);
    }


    //  console.log(c01ToC06Present)
    // only child with 7 years or higher than are present
    if (!c01ToC06Present && c07ToC11Present) passengerNumbers.push(Constants.TWO);

    // Check if INF is present
    if (uniquePassengerCodes.includes("INF")) {
        console.log(c01ToC06Present, c07ToC11Present, (!c01ToC06Present && c07ToC11Present), (c01ToC06Present && !c07ToC11Present))
        // only one type of child present
        if ((!c01ToC06Present && c07ToC11Present) || (c01ToC06Present && !c07ToC11Present)) {

            passengerNumbers.push(Constants.THREE); // If INF and c07ToC11 are present but c01ToC06 are not, assign 2
        }
        // for the present of both
        if (c01ToC06Present && c07ToC11Present)  passengerNumbers.push(Constants.FOUR)

    }
    // for no child present
    if (!c01ToC06Present && !c07ToC11Present) {
        passengerNumbers.push(Constants.TWO);
    }

    return Array.from(new Set(passengerNumbers));

}


export default generatePassengerNumbers