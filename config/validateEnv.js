import 'dotenv/config';
import { cleanEnv } from 'envalid';
import { port, str } from 'envalid/dist/validators';

console.log(process.env.PORT);
export default cleanEnv(process.env, {
  PORT: port(),
  HOST: str(),
  USER: str(),
  DATABASE: str(),
  PASSWORD: str(),
  PROJECTID: str(),
  BUCKET: str(),

  GALILEO_BASE_PROD_URL: str(),
  GALILEO_TARGET_BRANCH: str(),
  GALILEO_USERNAME: str(),
  GALILEO_PASSWORD: str(),
  GALILEO_CREDENTIALS: str(),
  GALILEO_PCC: str(),
  /* GALILEO_BASE_PRE_PROD_URL: str(),
    GALILEO_CERT_TARGET_BRANCH: str(),
    GALILEO_CERT_USER_USERNAME: str(),
    GALILEO_CERT_PASSWORD: str(),
    GALILEO_CERT_CREDENTIAL: str(),*/
  
  SABRE_CERT_USER: str(),
  SABRE_CERT_PASSWORD: str(),
  SABRE_CERT_PCC: str(),
  SABRE_BASE_CERT_URL: str(),
  SABRE_SOAP_URL: str(),
  SABRE_SOAP_CERT_URL: str(),

  NOVOAIR_DEFAULT_URL: str(),
  NOVOAIR_FLIGHT_SEARCH_URL: str(),
  NOVOAIR_FLIGHT_SELECTION_URL: str(),
  NOVOAIR_FARE_SELECTION_URL: str(),
  NOVOAIR_HOLD_SEATS_URL: str(),
  NOVOAIR_RESERVATION_URL: str(),
  NOVOAIR_ITEM_SELECTION_URL: str(),
  NOVOAIR_PASSENGER_INFO_URL: str(),
  NOVOAIR_VIEW_RESERVATION_URL: str(),
  NOVOAIR_TA_LOGIN_ACTION: str(),
  NOVOAIR_LOGINID: str(),
  NOVOAIR_PASSWORD: str(),
  NOVOAIR_IMAGECHECK: str(),

  MYSTIFLY_DEFAULT_URL: str(),
  MYSTIFLY_SESSION_ID: str(),
  MYSTIFLY_TARGET: str(),
  MYSTIFLY_CONVERSATION_ID: str(),

  TMX_DOMAIN_KEY: str(),
  TMX_USERNAME: str(),
  TMX_PASSWORD: str(),
  TMX_SYSTEM: str(),
  
  /*
     JWT_SECRET: str(),
     JWT_EXPIRES_IN: str(),
     STAFF_PASSWORD_SECRET: str(),
     STAFF_JWT_SECRET: str(),*/
  /*
      ACTIVATION_SECRET: str(),
      SMPT_HOST: str(),
      SMPT_PORT: port(),
      SMPT_SERVICE: str(),
      SMPT_MAIL: str(),
      SMPT_PASSWORD: str(),
      JWT_SECRET: str(),
      JWT_EXPIRES_IN: str(),
      TOKEN_EXPIRES_IN: str(),

      FRONTEND: str(),


      DOC_SECRET: str(),

      ,
      AGENT_JWT_SECRET: str(),
      COUNTRY_CODE: str(),
      SABRE_USER: str(),
      SABRE_PASSWORD: str(),
      SABRE_PCC: str(),
      LNIATA: str(),
      ADDRESS_LINE: str(),
      SABRE_CERT_USER: str(),
      SABRE_CERT_PASSWORD: str(),
      SABRE_CERT_PCC: str(),
      SABRE_BASE_CERT_URL: str(),
      SABRE_SOAP_URL: str(),
      SABRE_SOAP_CERT_URL: str(),*/
});

//console.log(process.env. PASSWORD)