import { featureConstants } from './featureConstants';

const featureCodes = [
  {
    id: 1,
    code: featureConstants.PREFERRED_SEATS,
    commercialName: ['preferred seats']
  },
  {
    id: 2,
    code: featureConstants.CHECKING_BAG,
    commercialName: ['checked', 'checked in', 'checked baggage', 'check in bag', 'check in baggage', 'Check in']
  },
  {
    id: 3,

    code: featureConstants.LOUNGE,
    commercialName: ['lounge']
  },
  {
    id: 4,

    code: featureConstants.PRIORITY_BOARDING,
    commercialName: ['priority boarding']
  },
  {
    id: 5,

    code: 'reissue',
    commercialName: ['rebooking', 'reissue', 'changes', 'times Date Change permitted']
  },
  {
    id: 6,

    code: featureConstants.MEALS,
    commercialName: ['meals', 'sandwich', 'meal service', 'dining', 'meal', 'veg']
  },
  {
    id: 7,
    code: featureConstants.DRINKS,
    commercialName: ['drinks', 'beverages', 'wine', 'liquors']
  },

  {
    id: 8,

    code: featureConstants.CABIN_BAG,
    commercialName: ['cabin bags', 'hand baggage', 'carry bags', 'carry on', 'carry baggage', 'cabin baggage']
  },


  {
    id: 10,
    code: 'refund',
    commercialName: ['refund', 'cancellation']
  },

  {
    id: 12,
    code: featureConstants.SEAT,
    commercialName: ['standard seat', 'seat selection']
  },

  {
    id: 18,

    code: featureConstants.PRIORITY_CHECK_IN,
    commercialName: ['priority check in']
  },

  {
    id: 21,
    code: featureConstants.WIFI,
    commercialName: ['wifi', 'wi-fi']
  },
  {
      id: 22,

      code: 'qmiles accumulation',
      commercialName: ['qmiles accumulation']
  },
  {
    id: 23,

    code: featureConstants.ONLINE_CHATS,
    commercialName: ['online', 'message', 'chat']
  },


  {
    id: 28,
    code: featureConstants.UPGRADE_ELIGIBILITY,
    commercialName: ['upgrade eligibility']
  },


  /* {
       id: 31,
       application: 'N',
       serviceType: 'Z',
       code: 'percent extra miles',
       commercialName: ['percent extra miles', 'mile']
   },*/


  {
    id: 34,
    code: featureConstants.INTERNET,
    commercialName: ['internet package']
  },
  {
    id: 35,
    code: featureConstants.BOARDING,
    commercialName: ['standard boarding']
  }, {
    id: 36,
    code: featureConstants.ENTERTAINMENT,
    commercialName: ['entertainment']
  }
];

export default featureCodes;