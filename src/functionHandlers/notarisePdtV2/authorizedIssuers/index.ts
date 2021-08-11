import axios from "axios";
import urljoin from "url-join";
import { getLogger } from "../../../common/logger";
import { config } from "../../../config";

const { trace, error } = getLogger(
  "src/functionHandlers/notarisePdt/authorizedIssuers/index"
);

export const isAuthorizedIssuer = async (
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