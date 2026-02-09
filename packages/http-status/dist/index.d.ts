/**
 * @b0ase/http-status
 *
 * HTTP status codes with utilities and type-safe constants.
 *
 * @packageDocumentation
 */
/** HTTP Status Codes */
declare const HttpStatus: {
    readonly CONTINUE: 100;
    readonly SWITCHING_PROTOCOLS: 101;
    readonly PROCESSING: 102;
    readonly EARLY_HINTS: 103;
    readonly OK: 200;
    readonly CREATED: 201;
    readonly ACCEPTED: 202;
    readonly NON_AUTHORITATIVE_INFORMATION: 203;
    readonly NO_CONTENT: 204;
    readonly RESET_CONTENT: 205;
    readonly PARTIAL_CONTENT: 206;
    readonly MULTI_STATUS: 207;
    readonly ALREADY_REPORTED: 208;
    readonly IM_USED: 226;
    readonly MULTIPLE_CHOICES: 300;
    readonly MOVED_PERMANENTLY: 301;
    readonly FOUND: 302;
    readonly SEE_OTHER: 303;
    readonly NOT_MODIFIED: 304;
    readonly USE_PROXY: 305;
    readonly TEMPORARY_REDIRECT: 307;
    readonly PERMANENT_REDIRECT: 308;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly PAYMENT_REQUIRED: 402;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly METHOD_NOT_ALLOWED: 405;
    readonly NOT_ACCEPTABLE: 406;
    readonly PROXY_AUTHENTICATION_REQUIRED: 407;
    readonly REQUEST_TIMEOUT: 408;
    readonly CONFLICT: 409;
    readonly GONE: 410;
    readonly LENGTH_REQUIRED: 411;
    readonly PRECONDITION_FAILED: 412;
    readonly PAYLOAD_TOO_LARGE: 413;
    readonly URI_TOO_LONG: 414;
    readonly UNSUPPORTED_MEDIA_TYPE: 415;
    readonly RANGE_NOT_SATISFIABLE: 416;
    readonly EXPECTATION_FAILED: 417;
    readonly IM_A_TEAPOT: 418;
    readonly MISDIRECTED_REQUEST: 421;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly LOCKED: 423;
    readonly FAILED_DEPENDENCY: 424;
    readonly TOO_EARLY: 425;
    readonly UPGRADE_REQUIRED: 426;
    readonly PRECONDITION_REQUIRED: 428;
    readonly TOO_MANY_REQUESTS: 429;
    readonly REQUEST_HEADER_FIELDS_TOO_LARGE: 431;
    readonly UNAVAILABLE_FOR_LEGAL_REASONS: 451;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly NOT_IMPLEMENTED: 501;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
    readonly GATEWAY_TIMEOUT: 504;
    readonly HTTP_VERSION_NOT_SUPPORTED: 505;
    readonly VARIANT_ALSO_NEGOTIATES: 506;
    readonly INSUFFICIENT_STORAGE: 507;
    readonly LOOP_DETECTED: 508;
    readonly NOT_EXTENDED: 510;
    readonly NETWORK_AUTHENTICATION_REQUIRED: 511;
};
type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];
/** Status code to message mapping */
declare const StatusMessages: Record<number, string>;
/**
 * Get status message for code
 */
declare function getStatusMessage(code: number): string;
/**
 * Check if status is informational (1xx)
 */
declare function isInformational(code: number): boolean;
/**
 * Check if status is success (2xx)
 */
declare function isSuccess(code: number): boolean;
/**
 * Check if status is redirect (3xx)
 */
declare function isRedirect(code: number): boolean;
/**
 * Check if status is client error (4xx)
 */
declare function isClientError(code: number): boolean;
/**
 * Check if status is server error (5xx)
 */
declare function isServerError(code: number): boolean;
/**
 * Check if status is error (4xx or 5xx)
 */
declare function isError(code: number): boolean;
/**
 * Check if status is OK (200-299)
 */
declare function isOk(code: number): boolean;
/**
 * Check if status is retryable
 */
declare function isRetryable(code: number): boolean;
/**
 * Get status category
 */
declare function getStatusCategory(code: number): string;
declare class HttpError extends Error {
    status: number;
    statusText: string;
    data?: unknown;
    constructor(status: number, message?: string, data?: unknown);
    toJSON(): {
        status: number;
        statusText: string;
        message: string;
        data?: unknown;
    };
}
declare function badRequest(message?: string, data?: unknown): HttpError;
declare function unauthorized(message?: string, data?: unknown): HttpError;
declare function forbidden(message?: string, data?: unknown): HttpError;
declare function notFound(message?: string, data?: unknown): HttpError;
declare function methodNotAllowed(message?: string, data?: unknown): HttpError;
declare function conflict(message?: string, data?: unknown): HttpError;
declare function unprocessableEntity(message?: string, data?: unknown): HttpError;
declare function tooManyRequests(message?: string, data?: unknown): HttpError;
declare function internalServerError(message?: string, data?: unknown): HttpError;
declare function notImplemented(message?: string, data?: unknown): HttpError;
declare function badGateway(message?: string, data?: unknown): HttpError;
declare function serviceUnavailable(message?: string, data?: unknown): HttpError;
declare function gatewayTimeout(message?: string, data?: unknown): HttpError;
interface ApiResponse<T = unknown> {
    success: boolean;
    status: number;
    statusText: string;
    data?: T;
    error?: string;
    meta?: Record<string, unknown>;
}
declare function successResponse<T>(data: T, status?: number, meta?: Record<string, unknown>): ApiResponse<T>;
declare function errorResponse(error: string | HttpError, meta?: Record<string, unknown>): ApiResponse;
declare const Responses: {
    ok: <T>(data: T) => ApiResponse<T>;
    created: <T>(data: T) => ApiResponse<T>;
    accepted: <T>(data: T) => ApiResponse<T>;
    noContent: () => ApiResponse<null>;
    badRequest: (msg?: string) => ApiResponse<unknown>;
    unauthorized: (msg?: string) => ApiResponse<unknown>;
    forbidden: (msg?: string) => ApiResponse<unknown>;
    notFound: (msg?: string) => ApiResponse<unknown>;
    conflict: (msg?: string) => ApiResponse<unknown>;
    unprocessable: (msg?: string) => ApiResponse<unknown>;
    tooMany: (msg?: string) => ApiResponse<unknown>;
    serverError: (msg?: string) => ApiResponse<unknown>;
};

export { type ApiResponse, HttpError, HttpStatus, type HttpStatusCode, Responses, StatusMessages, badGateway, badRequest, conflict, errorResponse, forbidden, gatewayTimeout, getStatusCategory, getStatusMessage, internalServerError, isClientError, isError, isInformational, isOk, isRedirect, isRetryable, isServerError, isSuccess, methodNotAllowed, notFound, notImplemented, serviceUnavailable, successResponse, tooManyRequests, unauthorized, unprocessableEntity };
