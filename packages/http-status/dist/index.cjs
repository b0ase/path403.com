"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  HttpError: () => HttpError,
  HttpStatus: () => HttpStatus,
  Responses: () => Responses,
  StatusMessages: () => StatusMessages,
  badGateway: () => badGateway,
  badRequest: () => badRequest,
  conflict: () => conflict,
  errorResponse: () => errorResponse,
  forbidden: () => forbidden,
  gatewayTimeout: () => gatewayTimeout,
  getStatusCategory: () => getStatusCategory,
  getStatusMessage: () => getStatusMessage,
  internalServerError: () => internalServerError,
  isClientError: () => isClientError,
  isError: () => isError,
  isInformational: () => isInformational,
  isOk: () => isOk,
  isRedirect: () => isRedirect,
  isRetryable: () => isRetryable,
  isServerError: () => isServerError,
  isSuccess: () => isSuccess,
  methodNotAllowed: () => methodNotAllowed,
  notFound: () => notFound,
  notImplemented: () => notImplemented,
  serviceUnavailable: () => serviceUnavailable,
  successResponse: () => successResponse,
  tooManyRequests: () => tooManyRequests,
  unauthorized: () => unauthorized,
  unprocessableEntity: () => unprocessableEntity
});
module.exports = __toCommonJS(index_exports);
var HttpStatus = {
  // 1xx Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,
  EARLY_HINTS: 103,
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  ALREADY_REPORTED: 208,
  IM_USED: 226,
  // 3xx Redirection
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
  // 4xx Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};
var StatusMessages = {
  // 1xx
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  103: "Early Hints",
  // 2xx
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",
  // 3xx
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  // 4xx
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot",
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  // 5xx
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required"
};
function getStatusMessage(code) {
  return StatusMessages[code] || "Unknown Status";
}
function isInformational(code) {
  return code >= 100 && code < 200;
}
function isSuccess(code) {
  return code >= 200 && code < 300;
}
function isRedirect(code) {
  return code >= 300 && code < 400;
}
function isClientError(code) {
  return code >= 400 && code < 500;
}
function isServerError(code) {
  return code >= 500 && code < 600;
}
function isError(code) {
  return code >= 400 && code < 600;
}
function isOk(code) {
  return isSuccess(code);
}
function isRetryable(code) {
  return code === HttpStatus.REQUEST_TIMEOUT || code === HttpStatus.TOO_MANY_REQUESTS || code === HttpStatus.INTERNAL_SERVER_ERROR || code === HttpStatus.BAD_GATEWAY || code === HttpStatus.SERVICE_UNAVAILABLE || code === HttpStatus.GATEWAY_TIMEOUT;
}
function getStatusCategory(code) {
  if (isInformational(code)) return "informational";
  if (isSuccess(code)) return "success";
  if (isRedirect(code)) return "redirect";
  if (isClientError(code)) return "client_error";
  if (isServerError(code)) return "server_error";
  return "unknown";
}
var HttpError = class extends Error {
  constructor(status, message, data) {
    super(message || getStatusMessage(status));
    this.name = "HttpError";
    this.status = status;
    this.statusText = getStatusMessage(status);
    this.data = data;
  }
  toJSON() {
    return {
      status: this.status,
      statusText: this.statusText,
      message: this.message,
      data: this.data
    };
  }
};
function badRequest(message, data) {
  return new HttpError(HttpStatus.BAD_REQUEST, message, data);
}
function unauthorized(message, data) {
  return new HttpError(HttpStatus.UNAUTHORIZED, message, data);
}
function forbidden(message, data) {
  return new HttpError(HttpStatus.FORBIDDEN, message, data);
}
function notFound(message, data) {
  return new HttpError(HttpStatus.NOT_FOUND, message, data);
}
function methodNotAllowed(message, data) {
  return new HttpError(HttpStatus.METHOD_NOT_ALLOWED, message, data);
}
function conflict(message, data) {
  return new HttpError(HttpStatus.CONFLICT, message, data);
}
function unprocessableEntity(message, data) {
  return new HttpError(HttpStatus.UNPROCESSABLE_ENTITY, message, data);
}
function tooManyRequests(message, data) {
  return new HttpError(HttpStatus.TOO_MANY_REQUESTS, message, data);
}
function internalServerError(message, data) {
  return new HttpError(HttpStatus.INTERNAL_SERVER_ERROR, message, data);
}
function notImplemented(message, data) {
  return new HttpError(HttpStatus.NOT_IMPLEMENTED, message, data);
}
function badGateway(message, data) {
  return new HttpError(HttpStatus.BAD_GATEWAY, message, data);
}
function serviceUnavailable(message, data) {
  return new HttpError(HttpStatus.SERVICE_UNAVAILABLE, message, data);
}
function gatewayTimeout(message, data) {
  return new HttpError(HttpStatus.GATEWAY_TIMEOUT, message, data);
}
function successResponse(data, status = HttpStatus.OK, meta) {
  return {
    success: true,
    status,
    statusText: getStatusMessage(status),
    data,
    meta
  };
}
function errorResponse(error, meta) {
  if (error instanceof HttpError) {
    return {
      success: false,
      status: error.status,
      statusText: error.statusText,
      error: error.message,
      meta
    };
  }
  return {
    success: false,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    statusText: "Internal Server Error",
    error,
    meta
  };
}
var Responses = {
  ok: (data) => successResponse(data, HttpStatus.OK),
  created: (data) => successResponse(data, HttpStatus.CREATED),
  accepted: (data) => successResponse(data, HttpStatus.ACCEPTED),
  noContent: () => successResponse(null, HttpStatus.NO_CONTENT),
  badRequest: (msg) => errorResponse(badRequest(msg)),
  unauthorized: (msg) => errorResponse(unauthorized(msg)),
  forbidden: (msg) => errorResponse(forbidden(msg)),
  notFound: (msg) => errorResponse(notFound(msg)),
  conflict: (msg) => errorResponse(conflict(msg)),
  unprocessable: (msg) => errorResponse(unprocessableEntity(msg)),
  tooMany: (msg) => errorResponse(tooManyRequests(msg)),
  serverError: (msg) => errorResponse(internalServerError(msg))
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpError,
  HttpStatus,
  Responses,
  StatusMessages,
  badGateway,
  badRequest,
  conflict,
  errorResponse,
  forbidden,
  gatewayTimeout,
  getStatusCategory,
  getStatusMessage,
  internalServerError,
  isClientError,
  isError,
  isInformational,
  isOk,
  isRedirect,
  isRetryable,
  isServerError,
  isSuccess,
  methodNotAllowed,
  notFound,
  notImplemented,
  serviceUnavailable,
  successResponse,
  tooManyRequests,
  unauthorized,
  unprocessableEntity
});
//# sourceMappingURL=index.cjs.map