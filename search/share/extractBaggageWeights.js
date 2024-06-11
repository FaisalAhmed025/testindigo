function extractBaggageWeights(etree,baggageAllowance = []) {
    let baggageWeights = '';

    if (!Array.isArray(baggageAllowance)) return baggageWeights;

    baggageAllowance.forEach(baggage => {
        const maxWeightElement = baggage.find('air:MaxWeight', etree.namespaces);
        const numberOfPiecesElement = baggage.find('air:NumberOfPieces', etree.namespaces);

        //console.log(maxWeightElement, numberOfPiecesElement)
        let pieceCount = null;

        if (numberOfPiecesElement && numberOfPiecesElement.text) {
            pieceCount = parseInt(numberOfPiecesElement.text.trim());


            if (isNaN(pieceCount)) {
                pieceCount = null; // Set to null if parsing fails
            }
            baggageWeights = pieceCount === 1 ? '1 Piece' : pieceCount + ' Pieces';
        }
        // console.log( maxWeightElement.attrib)

        if (maxWeightElement && maxWeightElement.attrib?.Value) {
            const weight = maxWeightElement.attrib.Value;

            // console.log({weight})
            const unit = ' KG';
            baggageWeights = weight + unit;
        }
    });

    //console.log({baggageWeights})

    return baggageWeights;
}

export default extractBaggageWeights