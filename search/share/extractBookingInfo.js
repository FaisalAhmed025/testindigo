import getFareData from "./getFareData";

const extractBookingInfo = (etree,pricingInfo = [], passengers = {}) => {
    const desiredBookingInfo = [];

    const passengerTypeCode = passengers?.code;
    const passengerType = pricingInfo.findall(`.//air:PassengerType[@Code="${passengerTypeCode}"]`);
    if (passengerType.length > 0) {
        const bookingInfos = pricingInfo.findall('.//air:BookingInfo');
        bookingInfos.forEach(bookingInfo => {
            const {BookingCode, BookingCount, CabinClass, SegmentRef, FareInfoRef} = bookingInfo.attrib;
            const {bag} = getFareData(etree,FareInfoRef, passengers)
            bag.SegmentRef = SegmentRef


            desiredBookingInfo.push({
                BookingCode,
                BookingCount,
                CabinClass,
                SegmentRef,
                FareInfoRef,
                bag,
            });
        });
    }


    return desiredBookingInfo
};

export default extractBookingInfo