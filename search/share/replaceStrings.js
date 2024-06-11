// Define the regular expression pattern
// Function to capitalize the first letter of a string
function capitalize(str ="") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
const numberToWord = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four'
};
const rebookingRefundsAgainstFeePattern = /^(Rebooking|Refunds) against a fee until (\d+)hr prior departure$/i;

const rebookingRefundsReplacement = (match, type, hours) => {
  const typeWord = type.toLowerCase() === 'rebooking' ? 'Reissue' : 'Refunds';
  return [`${typeWord} charge available ${hours} ${ hours === 1 ? 'hour' : 'hours'} before departure`];
};
const changesRefundsPattern = /^(Changes permitted|Refunds permitted)(.*)$/i;
const changesRefundsPatternSubject = /^(Changes|Cancellation) subject to a charge$/i;
const rebookingPattern = /^(Rebooking:\s*(\d+)x Free change fee fare difference applies|Rebooking: Unlimited free change fare difference applies)$/i;
const dateChangePattern = /(\d+)\s+Date Change permitted, chargeable from (\d+)(?:st|nd|rd|th) Change/;
const rebookingAvailabilityPattern = /Rebooking\s+(not\s+)?available/i;
const baggagePattern = /^(cabin bag and checked baggage|checked baggage and cabin bag|free baggage|free baggage allowance)$/i;
const carryOnPattern = /^Carry on$/i;
const checkInBaggagePattern = /^Free Check-in baggage as per FBA within \((\d+x\d+x\d+ cm)\)\. (?:\d+ Bag fare may exist\.\s*)?Please check ticket conditions for details\. No baggage should exceed (\d+)Kg$/i;
const replaceStrings = {
  [carryOnPattern.source]: () => ['Carry on baggage'],
  'Changeable and refundable ticket': () => ['Refund available', 'Reissue available'],
  'Complimentary snacks or meals & beverages': () => ['Complimentary snacks or meals', 'Complimentary beverages'],
  'Changes fee applicable': () => ['Reissue fee applicable'],
  'Cancel or Refund with charges': () => ['Refund with charges'],
  [baggagePattern.source]: () => ['Cabin baggage allowance', 'Checked baggage allowance'],
  [rebookingAvailabilityPattern.source]: (match, notAvailable) => {
    return notAvailable ? ['Reissue not available'] : ['Reissue available'];
  },
  [checkInBaggagePattern.source]: (match, dimensions, maxWeight) => {
    return [`Free Check-in baggage within ${dimensions} may available up to ${maxWeight} KG`];
  },
  [changesRefundsPattern.source]: (match, permitted, rest) => {
    const action = permitted.toLowerCase().includes('changes') ? 'Reissue allowed' : 'Refund allowed';
    const updatedRest = rest ? rest.trim() : '';
    return [`${action} ${updatedRest}`];
  },
  [changesRefundsPatternSubject.source]: (match, type) => {
    const action = type.toLowerCase() === 'changes' ? 'Reissue' : 'Refund';
    return [`${action} allowed at a charge`];
  },
  [dateChangePattern.source]: (match, p1, p2) => {
    const firstChangeWord = numberToWord[p1] || p1;
    const secondChangeWord = numberToWord[p2] || p2;
    const firstChangeTime = `${firstChangeWord} time${p1 > 1 ? 's' : ''}`;
    const secondChangeTime = `${secondChangeWord} time${p2 > 1 ? 's' : ''}`;
    return [`${capitalize(firstChangeTime)} reissue permitted, chargeable from ${secondChangeTime} Change`];
  },
  [rebookingPattern.source]: (match, p1) => {
    const firstChangeWord = numberToWord[p1] || p1;
    const firstChangeTime = `${firstChangeWord} time${p1 > 1 ? 's' : ''}`;
    return [`${capitalize(firstChangeTime)} reissue charge free but fare difference applied`];
  },
  [rebookingRefundsAgainstFeePattern.source]: rebookingRefundsReplacement,

};

export default replaceStrings;