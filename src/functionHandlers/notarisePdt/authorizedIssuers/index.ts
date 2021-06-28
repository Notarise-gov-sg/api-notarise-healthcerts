import axios from "axios";
import urljoin from "url-join";
import { getLogger } from "../../../common/logger";
import { config } from "../../../config";
import { authorizedIssuers } from "./authorizedIssuersMap";

const { trace, error } = getLogger(
  "src/functionHandlers/notarisePdt/authorizedIssuers/index"
);

export const isAuthorizedIssuerAPI = async (
  domain: string
): Promise<boolean> => {
  try {
    const headers = {
      "x-api-key": `${config.authorizedIssuers.apiKey}`,
      "Content-Type": "application/json",
    };
    const getAuthorizedIssuerUrl = urljoin(
      `${config.authorizedIssuers.endpoint}`,
      "authorized-issuer",
      domain.toLowerCase(),
      "pcr"
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
  domain: string
): Promise<boolean> => authorizedIssuers.has(domain.toLowerCase());

export const getIssuer = authorizedIssuers.get;

// Note that environment variables are parsed as strings by default
const { useApiAuthorisedIssuer } = config;

export const isAuthorizedIssuer = useApiAuthorisedIssuer
  ? isAuthorizedIssuerAPI
  : isAuthorizedIssuerLocal;
