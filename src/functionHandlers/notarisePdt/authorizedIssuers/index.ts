import { authorizedIssuers } from "./authorizedIssuersMap";

export const isAuthorizedIssuer = (domain: string): boolean =>
  authorizedIssuers.has(domain.toLowerCase());

export const getIssuer = authorizedIssuers.get;
