import { centralAPiSabreSearchResult } from '../air/v1/sabre/airSearch/centralApiSearchResult';
import { WingDetails } from '../models/tokenGet';
import createSearch from './galileoSearch/createSearch';
import responseMaker from './galileoSearch/responseMaker';
import analyzeSegments from './helpers/analyzeSegments';
import commonFunctions from './share/commonFunctions';


const searchService = async (req, res, next) => {
  try {
    const body = req.body;

    const searchResults = [];
    const controlCheck = await WingDetails.findOne({
      where: { gdsControlId: req.user.id },
    });
    if (controlCheck.control === 0 && controlCheck.gdsName === 'sabre') {
      searchResults.push([]);
    } else {
       const sabreSearch = await centralAPiSabreSearchResult(req, res);

       searchResults.push(sabreSearch);
    }
    const { commissionType, journeyType } = await analyzeSegments(
      body.segmentsList
    );

    const tripType = commonFunctions.detectRouteType(body.segmentsList);

    body.commissionType = commissionType;
    body.journeyType = journeyType;
    body.tripType = tripType;

    // console.log('before create search', body.commissionType);

     const galileoSearchResult = await createSearch(req, res, next);

    // console.log(galileoSearchResult)

    // console.log(JSON.stringify(galileoSearchResult, null, 2))

    // console.log(searchResult)

     const galileoResponse =
      (await responseMaker(galileoSearchResult || [], body)) || [];

     searchResults.push(galileoResponse);

    //const novoAir = await getNovoairAfterSearchResult(req, res, next);
    return searchResults;
  } catch (err) {
    console.log(err);
    return [];
  }
};

const fareRule  = async(req,res)=>{
  const xmlData = fs.readFileSync('response.xml', 'utf8');
    const etree = et.parse(xmlData);

  const fareRules = etree.findall('.//air:FareRuleLong') || [];

  if (!fareRules || !fareRules?.length) return  []

  if (isIndigo) {
      const readyFareRules = fareRules.map(rule => {
          const textContent = rule.text ? rule.text.trim() : '';
          const textLines = textContent.split('\n').map(line => line.trim()).filter(line => line !== '');
          const title = textLines.length > 0 ? textLines.shift() : '';
          const text = textLines.join(' ');
          return { title, text };
      });

      return readyFareRules || [];
  }
}

export default searchService;
