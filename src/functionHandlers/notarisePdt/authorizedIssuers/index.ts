import axios from "axios";
import urljoin from "url-join";
import { pdtHealthCertV2 } from "@govtechsg/oa-schemata";
import { getLogger } from "../../../common/logger";
import { config } from "../../../config";
import { authorizedIssuers } from "./authorizedIssuersMap";

const { trace, error } = getLogger(
  "src/functionHandlers/notarisePdt/authorizedIssuers/index"
);

type HealthCertType = `${pdtHealthCertV2.PdtTypes}`;
export const isAuthorizedIssuerAPI = async (
  domain: string,
  type: HealthCertType
): Promise<boolean> => {
  try {
    const headers = {
      "x-api-key": `${config.authorizedIssuers.apiKey}`,
      "Content-Type": "application/json",
    };
    const getAuthorizedIssuerUrl = urljoin(
      `${config.authorizedIssuers.endpoint}`,
      "authorized-issuer/v2",
      domain.toLowerCase(),
      type.toLocaleLowerCase()
    );
    const response = await axios.get(getAuthorizedIssuerUrl, {
      headers,
    });
    trace(
      `Retrieved ${domain} from whitelist : ${JSON.stringify(response.data)}`
    );
    return Promise.resolve(response.status === 200);
  } catch (e) {
    error(`Unable to find ${domain} from whitelist : ${JSON.stringify(e)}`);
    return false;
  }
};

/**
 * @deprecated This function need to remove after successfully refactor the whitelists
 */
export const isAuthorizedIssuerLocal = async (
  domain: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _type: HealthCertType // type is ignored when checking against local whitelist
): Promise<boolean> => authorizedIssuers.has(domain.toLowerCase());

export const getIssuer = authorizedIssuers.get;

export const isAuthorizedIssuer = process.env.USE_API_AUTHORISED_ISSUER
  ? isAuthorizedIssuerAPI
  : isAuthorizedIssuerLocal;
