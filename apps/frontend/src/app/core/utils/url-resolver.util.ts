import { environment } from "../../../environments/environment";

export const resolveBaseUrl = () => {
  const portSegment = environment.apiPort.length
    ? `:${environment.apiPort}`
    : "";

  const protocol = window.location.protocol;
  const host = window.location.host.split(":")[0];

  return `${protocol}//${host}${portSegment}${environment.apiPrefix}`;
};
