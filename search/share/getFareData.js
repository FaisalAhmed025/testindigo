import commonFunctions from "./commonFunctions";
import extractBaggageWeights from "./extractBaggageWeights";


function getFareData(etree, key = "", passengers = {}) {
    const fareInfo = etree.find(`.//air:FareInfo[@Key='${key}']`, etree.namespaces);

    // fare attribute
    const fareAttributeData = commonFunctions.attributeToObject(fareInfo?.attrib)
    let upSellFareBasis =  null
    let upSellFareKey = null
    // get children of fare
    const fareChildren = fareInfo?._children
    // get brand information
    const brandChild = fareChildren.filter(element => element.tag === 'air:Brand');
    const fareBrandAttribute = commonFunctions.attributeToObject(brandChild[0]?.attrib)

    // now get the brand information
    const brandElement = etree.find(`.//air:BrandList/air:Brand[@BrandID='${fareBrandAttribute?.BrandID}']`, etree.namespaces);


    // console.log(brandElement)

    // console.log(fareBrandAttribute?.BrandID, brandElement)
    // brand raw data
    const brandAttribute = commonFunctions.attributeToObject(brandElement?.attrib)
    // get class information of the brand
    //brandAttribute.class = (brandElement?.find('air:Title[@Type="External"]', etree.namespaces)?.text ?? '').trim()
    fareAttributeData.PassengerCode = passengers.code
    fareAttributeData.Carrier = brandAttribute?.Carrier || ""
    for (let brand of brandChild) {
        // Check if the tag is "air:Brand"
        if (brand.tag === "air:Brand") {
            // Find the child element with tag "air:UpsellBrand"
            let upsellBrand = brand._children.find(child => child.tag === "air:UpsellBrand");

            // If air:UpsellBrand element is found, extract the FareBasis attribute
            if (upsellBrand) {
                upSellFareBasis = upsellBrand.attrib?.FareBasis;
                upSellFareKey = upsellBrand.attrib?.FareInfoRef
            }
        }
    }


    const baggageAllowance = fareChildren.filter(element => element.tag === 'air:BaggageAllowance');
    const bag = {
        paxType: passengers.code,
        paxNumber: passengers.paxCount,
        baggage: extractBaggageWeights(etree, baggageAllowance)
    }
    return {fareAttributeData, fareBrandAttribute, brandElement, bag, upSellFareBasis, upSellFareKey, brandAttribute};
}

export default getFareData