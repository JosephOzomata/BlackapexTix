import axios from "axios";
import { API } from "../constants/config";
import { ERROR_CODES, makeError } from "../utils/errorCodes";

/**
 * HTTP client abstraction.
 *
 * The mock services currently bypass this client and simulate latency
 * in-process. When the real backend is ready, replacing the mock
 * implementations in src/services/* with calls through this client is
 * the ONLY change needed.
 *
 * Trust boundaries:
 *  - This client never attaches payment secrets.
 *  - Auth is expected to flow via httpOnly cookies set by the backend.
 *    If bearer tokens are used instead, they must be short-lived and
 *    never persisted in localStorage in production.
 *  - Requests and responses are validated/normalised, not trusted blindly.
 */

export const httpClient = axios.create({
  baseURL: API.baseUrl,
  timeout: API.timeoutMs,
  withCredentials: true, // allows the backend to use httpOnly cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalise axios errors into our consistent error shape so services
    // (mock or real) return the same thing to callers.
    const status = error?.response?.status;
    const serverData = error?.response?.data;

    if (serverData?.code && serverData?.message) {
      return Promise.reject(serverData);
    }

    if (!error.response) {
      return Promise.reject(
        makeError(
          error.code === "ECONNABORTED"
            ? ERROR_CODES.NETWORK_ERROR
            : ERROR_CODES.NETWORK_ERROR
        )
      );
    }

    const codeByStatus = {
      400: ERROR_CODES.VALIDATION_ERROR,
      401: ERROR_CODES.UNAUTHENTICATED,
      403: ERROR_CODES.FORBIDDEN,
      404: ERROR_CODES.NOT_FOUND,
      409: ERROR_CODES.VALIDATION_ERROR,
      422: ERROR_CODES.VALIDATION_ERROR,
      429: ERROR_CODES.RATE_LIMITED,
      500: ERROR_CODES.SERVER_ERROR,
      502: ERROR_CODES.SERVER_ERROR,
      503: ERROR_CODES.SERVER_ERROR,
      504: ERROR_CODES.SERVER_ERROR,
    };

    return Promise.reject(
      makeError(
        codeByStatus[status] ?? ERROR_CODES.UNKNOWN,
        serverData?.message ?? null,
        { status }
      )
    );
  }
);

/**
 * Endpoints registry — single source of truth for backend routes.
 * Services use these instead of hardcoding paths inline.
 */
export default httpClient;