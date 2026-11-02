"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.UnprocessableEntityError = exports.UnauthorizedError = exports.StaleIndex = exports.ServiceUnavailableError = exports.SdkCore = exports.SEND = exports.SDKClient = exports.RateLimitError = exports.REFRESH_AUTH = exports.PathParamError = exports.NotFoundError = exports.MAX_RESPONSE_BYTES = exports.InternalServerError = exports.HTTPClient = exports.GatewayTimeoutError = exports.ForbiddenError = exports.DecodeError = exports.ConflictError = exports.ClientError = exports.CROSS_ORIGIN_SAFE_HEADERS = exports.CONFIG = exports.BadRequestError = exports.BadGatewayError = exports.APIConnectionError = void 0;exports.bindDefaultFetch = bindDefaultFetch;exports.clientErrorFor = clientErrorFor;exports.compilePattern = compilePattern;exports.connectionErrors = connectionErrors;exports.crossOriginHeaders = crossOriginHeaders;exports.defaultSearchParams = defaultSearchParams;exports.encodeBody = encodeBody;exports.errorFromResponse = errorFromResponse;exports.exchangeLog = exchangeLog;exports.fetchFollowing = fetchFollowing;exports.finishRequest = finishRequest;exports.hasPlaceholder = hasPlaceholder;exports.headerValue = headerValue;exports.headersOf = headersOf;exports.interpolatePartial = interpolatePartial;exports.interpolatePath = interpolatePath;exports.invalidBaseURLError = invalidBaseURLError;exports.isClientError = isClientError;exports.isEventStream = isEventStream;exports.isJsonMediaType = isJsonMediaType;exports.isReplayable = isReplayable;exports.isTextMediaType = isTextMediaType;exports.later = void 0;exports.newClientRequestId = newClientRequestId;exports.noAnswer = noAnswer;exports.openStream = openStream;exports.optionsFor = optionsFor;exports.parseBody = parseBody;exports.parseClientBaseURL = parseClientBaseURL;exports.parseMediaType = parseMediaType;exports.parseSSEStream = parseSSEStream;exports.requestAuto = requestAuto;exports.requestInit = requestInit;exports.requestSignal = requestSignal;exports.requestStream = requestStream;exports.resolveInvalidationTargets = resolveInvalidationTargets;exports.resultOf = resultOf;exports.runRequestHooks = runRequestHooks;exports.runResponseHooks = runResponseHooks;exports.schemeAuth = schemeAuth;exports.sseOp = void 0;exports.streamOperation = streamOperation;exports.templateOf = templateOf; /** A `Content-Type`, read as far as the client needs it: its essence, type and structured suffix. */








/* RFC 9110 token characters */
const MEDIA_TOKEN = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

/** `value` as a media type; `null` when it is missing or not `token/token`. */
function parseMediaType(value) {
  if (value === null || value === undefined) return null;
  const semi = value.indexOf(";");
  const head = (semi === -1 ? value : value.slice(0, semi)).trim();
  const slash = head.indexOf("/");
  if (slash === -1) return null;
  const type = head.slice(0, slash).toLowerCase();
  const subtype = head.slice(slash + 1).toLowerCase();
  if (!MEDIA_TOKEN.test(type) || !MEDIA_TOKEN.test(subtype)) return null;
  const plus = subtype.lastIndexOf("+");
  const suffix = plus > 0 && plus < subtype.length - 1 ? subtype.slice(plus + 1) : null;
  return { essence: `${type}/${subtype}`, suffix, type };
}

/** JSON bodies: `application/json` and any `+json` type. */
function isJsonMediaType(mt) {
  return mt !== null && (mt.essence === "application/json" || mt.suffix === "json");
}

/** Text-like bodies: `text/*`, `application/xml`, and any `+xml` type. */
function isTextMediaType(mt) {
  return mt !== null && (mt.type === "text" || mt.essence === "application/xml" || mt.suffix === "xml");
}

/** Absolute client bases: http(s) and ws(s). Case-insensitive per WHATWG. */
const ABSOLUTE_CLIENT_URL = /^(?:https?|wss?):\/\//i;

function invalidBaseURLError(baseURL) {
  return new Error(
    `Invalid baseURL ${JSON.stringify(baseURL)}: expected an absolute http(s): or ws(s): URL. Path-only values such as "/api" resolve against location.origin in browsers.`
  );
}

/**
 * Honor `config.fetch` as-is. If omitted, bind the environment fetch so storing it on a client
 * field does not throw `Illegal invocation` in browsers.
 */
function bindDefaultFetch(custom) {
  if (custom) return custom;
  const nativeFetch = globalThis.fetch;
  return typeof nativeFetch === "function" ? nativeFetch.bind(globalThis) : nativeFetch;
}

function currentLocationOrigin() {
  let origin;
  try {
    origin = globalThis.location?.origin;
  } catch {
    /* a sandboxed location that throws on read: there is no origin to resolve against */
    return undefined;
  }
  if (typeof origin !== "string" || origin === "" || origin === "null") return undefined;
  if (!ABSOLUTE_CLIENT_URL.test(origin)) return undefined;
  return origin;
}

/**
 * Parse `baseURL`. Absolute `http(s):` / `ws(s):` URLs are unchanged. Path-only values such as
 * `/api` resolve against `location.origin` when present.
 */
function parseClientBaseURL(baseURL) {
  if (ABSOLUTE_CLIENT_URL.test(baseURL)) return new URL(baseURL);
  const origin = currentLocationOrigin();
  if (origin !== undefined) {
    try {
      return new URL(baseURL, origin);
    } catch {
      throw invalidBaseURLError(baseURL);
    }
  }
  throw invalidBaseURLError(baseURL);
}

/**
 * Headers a request may carry to another origin when a `redirect: "follow"` client follows a
 * cross-origin redirect. Everything else is dropped on that hop: credentials, the auth header and
 * every header set from config, per call or by an `onRequest` hook, whatever its name. An
 * allowlist, so a header added later never leaks by default (H18.10).
 */
const CROSS_ORIGIN_SAFE_HEADERS = exports.CROSS_ORIGIN_SAFE_HEADERS = ["accept", "accept-language", "user-agent"];

/** The headers to send on a cross-origin hop: only the allowlisted ones from `headers`. */
function crossOriginHeaders(headers) {
  const out = new Headers();
  for (const name of CROSS_ORIGIN_SAFE_HEADERS) {
    const value = headers.get(name);
    if (value !== null) out.set(name, value);
  }
  return out;
}









/** A non-2xx answer: its status, the parsed body (JSON when it parses, else text) and the response. */
class ClientError extends Error {
  body;
  response;
  status;

  constructor(init) {
    super(init.message, init)
    /* V8 only, and not in every lib: read it as optional so the runtime compiles anywhere */;
    Error.captureStackTrace?.(this, new.target);
    this.name = "ClientError";
    this.body = init.body;
    this.response = init.response;
    this.status = init.status;
  }
}exports.ClientError = ClientError;

class BadRequestError extends ClientError {
  name = "BadRequestError";
}exports.BadRequestError = BadRequestError;
class UnauthorizedError extends ClientError {
  name = "UnauthorizedError";
}exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends ClientError {
  name = "ForbiddenError";
}exports.ForbiddenError = ForbiddenError;
class NotFoundError extends ClientError {
  name = "NotFoundError";
}exports.NotFoundError = NotFoundError;
class ConflictError extends ClientError {
  name = "ConflictError";
}exports.ConflictError = ConflictError;
class UnprocessableEntityError extends ClientError {
  name = "UnprocessableEntityError";
}exports.UnprocessableEntityError = UnprocessableEntityError;
class RateLimitError extends ClientError {
  name = "RateLimitError";
}exports.RateLimitError = RateLimitError;
class InternalServerError extends ClientError {
  name = "InternalServerError";
}exports.InternalServerError = InternalServerError;
class BadGatewayError extends ClientError {
  name = "BadGatewayError";
}exports.BadGatewayError = BadGatewayError;
class ServiceUnavailableError extends ClientError {
  name = "ServiceUnavailableError";
}exports.ServiceUnavailableError = ServiceUnavailableError;
class GatewayTimeoutError extends ClientError {
  name = "GatewayTimeoutError";
}

/** A 2xx whose body is no value of its operation: the text (null past the size cap), the parse error its cause. */exports.GatewayTimeoutError = GatewayTimeoutError;
class DecodeError extends ClientError {
  /* a literal, so a declared error with a string body never reads as one */
  name = "DecodeError";
}exports.DecodeError = DecodeError;

const STATUS_ERRORS = {
  400: BadRequestError,
  401: UnauthorizedError,
  403: ForbiddenError,
  404: NotFoundError,
  409: ConflictError,
  422: UnprocessableEntityError,
  429: RateLimitError,
  500: InternalServerError,
  502: BadGatewayError,
  503: ServiceUnavailableError,
  504: GatewayTimeoutError
};

/** The most specific error class for a status: `UnauthorizedError` for 401, `ClientError` otherwise. */
function clientErrorFor(init) {
  const Cls = (Object.hasOwn(STATUS_ERRORS, init.status) ? STATUS_ERRORS[init.status] : undefined) ?? ClientError;
  return new Cls(init);
}

function isClientError(e) {
  return e instanceof ClientError;
}

/** A request with no answer; the platform error is its `cause`. */
class APIConnectionError extends Error {
  name = "APIConnectionError";
}

/** A send or body read with no answer as APIConnectionError, its cause the platform's; an abort's as it is (f2). */exports.APIConnectionError = APIConnectionError;
function noAnswer(cause, url, init) {
  if (init?.signal?.aborted) return cause;
  const { origin, pathname } = new URL(String(url));
  return new APIConnectionError(`${init?.method} ${origin}${pathname}: the connection failed`, { cause });
}

/** A fetch failure as APIConnectionError; an abort's as it is. */
function connectionErrors(fetch) {
  if (typeof fetch !== "function") return fetch;
  /* asserted, as Bun's fetch type also names `preconnect` */
  return async (input, init) => {
    try {
      return await fetch(input, init);
    } catch (cause) {
      throw noAnswer(cause, input, init);
    }
  };
}

/**
 * Client-side path templates. Two spellings are accepted, segment by segment:
 *
 * - Honey route patterns: `:name` (or `:name?`) takes a whole segment, `*name` (or `*`) takes the
 *   rest of the path. Names follow the router grammar, so `:user-id` is one parameter.
 * - OpenAPI templates: `{name}` anywhere inside a segment (`/ops/{id}:cancel`).
 *
 * Values are percent-encoded. A value that would change the path's shape once a URL parser
 * normalizes it (`""`, `.`, `..`) is rejected, so `{ id: ".." }` can never retarget a request to
 * the parent resource and `{ org: "" }` can never turn `/:org/:repo` into `//repo`.
 */

/** A fresh `{name}` placeholder matcher: a global regex carries `lastIndex`, so none is shared. */
const braces = () => /\{([^{}/]+)\}/g;

class PathParamError extends Error {
  constructor(message) {
    super(message);
    this.name = "PathParamError";
  }
}exports.PathParamError = PathParamError;

function paramValue(params, key) {
  const raw = Object.hasOwn(params, key) ? params[key] : undefined;
  if (raw === undefined || raw === null) return undefined;
  return typeof raw === "string" ? raw : String(raw);
}

function encodeSegmentValue(key, value) {
  if (value === "" || value === "." || value === "..") {
    throw new PathParamError(
      `Invalid path param ${JSON.stringify(key)}: ${JSON.stringify(value)} is not a path segment`
    );
  }
  return encodeURIComponent(value);
}

/** A wildcard value may span segments; each one is encoded and validated on its own. */
function encodeWildcardValue(key, value) {
  if (value === "") return "";
  return value.
  split("/").
  map((part) => encodeSegmentValue(key, part)).
  join("/");
}

/** One `:name`/`:name?` segment, `null` when an optional one is left out. */
function paramSegment(seg, params) {
  const optional = seg.endsWith("?");
  const name = optional ? seg.slice(1, -1) : seg.slice(1);
  const value = paramValue(params, name);
  if (value !== undefined) return encodeSegmentValue(name, value);
  if (optional) return null;
  throw new PathParamError(`Missing path param: ${name}`);
}

/** The trailing `*`/`*name` segment: an unnamed one may be left empty. */
function wildcardSegment(seg, params) {
  const name = seg.length > 1 ? seg.slice(1) : "*";
  const value = paramValue(params, name);
  if (value !== undefined) return encodeWildcardValue(name, value);
  if (seg.length === 1) return "";
  throw new PathParamError(`Missing path param: ${name}`);
}

function interpolatePath(path, params = {}) {
  const segments = path.split("/");
  const out = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.length > 1 && seg.charCodeAt(0) === 58 /* : */) {
      const value = paramSegment(seg, params);
      if (value !== null) out.push(value);
    } else if (seg.charCodeAt(0) === 42 /* * */ && i === segments.length - 1) out.push(wildcardSegment(seg, params));else
    {
      out.push(
        seg.replace(braces(), (_, name) => {
          const value = paramValue(params, name);
          if (value === undefined) throw new PathParamError(`Missing path param: ${name}`);
          return encodeSegmentValue(name, value);
        })
      );
    }
  }
  return out.join("/");
}

/** True when the template still has a placeholder in either spelling. */
function hasPlaceholder(path) {
  for (const seg of path.split("/")) {
    if (seg.length > 1 && seg.charCodeAt(0) === 58) return true;
    if (seg.charCodeAt(0) === 42) return true;
    if (braces().test(seg)) return true;
  }
  return false;
}

/**
 * Substitute the params that are present and leave the others as placeholders. Used for
 * invalidation targets, where a partially resolved target is still a narrower pattern.
 */
function interpolatePartial(path, params) {
  return path.
  split("/").
  map((seg, i, all) => {
    if (seg.length > 1 && seg.charCodeAt(0) === 58) {
      const optional = seg.endsWith("?");
      const name = optional ? seg.slice(1, -1) : seg.slice(1);
      const value = paramValue(params, name);
      return value === undefined ? seg : encodeSegmentValue(name, value);
    }
    if (seg.charCodeAt(0) === 42 && i === all.length - 1) {
      const value = paramValue(params, seg.length > 1 ? seg.slice(1) : "*");
      return value === undefined ? seg : encodeWildcardValue(seg.slice(1), value);
    }
    return seg.replace(braces(), (match, name) => {
      const value = paramValue(params, name);
      return value === undefined ? match : encodeSegmentValue(name, value);
    });
  }).
  join("/");
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The regex source of one literal segment, its `{name}` placeholders matching one segment's text. */
function literalSource(seg) {
  let source = "";
  let last = 0;
  const brace = braces();
  for (let m = brace.exec(seg); m !== null; m = brace.exec(seg)) {
    source += `${escapeRegExp(seg.slice(last, m.index))}[^/]+`;
    last = m.index + m[0].length;
  }
  return source + escapeRegExp(seg.slice(last));
}

/** Compile a template to a regex over concrete paths, using the same segment grammar; the caller caches it. */
function compilePattern(pattern) {
  const segments = pattern.split("/");
  let source = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const sep = i === 0 ? "" : "/";
    if (seg.length > 1 && seg.charCodeAt(0) === 58) source += seg.endsWith("?") ? `(?:${sep}[^/]+)?` : `${sep}[^/]+`;else
    if (seg.charCodeAt(0) === 42 && i === segments.length - 1) source += `(?:${sep}.*)?`;else
    source += sep + literalSource(seg);
  }
  return new RegExp(`^${source}$`);
}

/** What one call sends beyond the path: its parameters, headers, body and timing. */





















/** How a request is read: by its answer (`auto`), as a value (`rest`) or as an event stream (`stream`). */


/** A query or form value as text: a Date by its ISO string; nothing for null, undefined or a symbol. */
function coerceParam(v) {
  if (v === undefined || v === null) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "symbol") return null;
  return String(v);
}

function coerceFormValue(key, v) {
  if (v !== null && typeof v === "object" && !(v instanceof Date)) {
    throw new TypeError(
      `Form field ${JSON.stringify(key)}: nested objects cannot be form-encoded; pass a string (e.g. JSON.stringify) or use json`
    );
  }
  return coerceParam(v);
}

/** The query of `query`: an array repeats its key, null and undefined are left out. */
function defaultSearchParams(query) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      for (const item of v) {
        const s = coerceParam(item);
        if (s !== null) params.append(k, s);
      }
    } else {
      const s = coerceParam(v);
      if (s !== null) params.set(k, s);
    }
  }
  return params;
}

/* RFC 9110's token: what a header name may hold */
const TOKEN = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

/** `value` for the header `name`, else a TypeError naming the header, never the value (Node's Headers quotes it). */
function headerValue(name, value) {
  if (!TOKEN.test(name)) throw new TypeError(`the ${name} header cannot be sent`);
  for (let i = 0; i < value.length; i++) {
    const cp = value.charCodeAt(i);
    if (cp < 0x20 && cp !== 0x09 || cp === 0x7f) throw new TypeError(`the ${name} header's value cannot be sent`);
  }
  return value;
}

/** Each of `layers` over the last, checked; `cookies` joined on; a fresh `x-request-id` unless one is set. */
function headersOf(
layers,
cookies = {},
requestId)
{
  const headers = new Headers();
  for (const layer of layers)
  for (const [k, v] of Object.entries(layer)) if (v !== undefined) headers.set(k, headerValue(k, v));
  const pairs = Object.entries(cookies).
  map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).
  join("; ");
  if (pairs) {
    const existing = headers.get("cookie");
    headers.set("cookie", existing ? `${existing}; ${pairs}` : pairs);
  }
  if (requestId && !headers.has("x-request-id")) headers.set("x-request-id", newClientRequestId());
  return headers;
}

/**
 * RFC 4122 §4.4 UUID for `x-request-id`: `crypto.randomUUID` where it exists, else
 * `getRandomValues`, so older runtimes still work without node:crypto.
 */
function newClientRequestId() {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  if (c && typeof c.getRandomValues === "function") {
    const bytes = c.getRandomValues(new Uint8Array(16));
    bytes[6] = bytes[6] & 0x0f | 0x40;
    bytes[8] = bytes[8] & 0x3f | 0x80;
    let out = "";
    for (let i = 0; i < 16; i++) {
      if (i === 4 || i === 6 || i === 8 || i === 10) out += "-";
      out += bytes[i].toString(16).padStart(2, "0");
    }
    return out;
  }
  throw new Error("honey: no crypto.randomUUID or crypto.getRandomValues in this runtime");
}

function isFileLike(v) {
  return typeof File !== "undefined" && v instanceof File || typeof Blob !== "undefined" && v instanceof Blob;
}

function isFileList(v) {
  return typeof FileList !== "undefined" && v instanceof FileList;
}

/** A form with a file in it, as multipart: fetch sets the boundary, so no content type is set here. */
function multipartBody(entries) {
  const fd = new FormData();
  for (const [k, v] of entries) {
    if (v === undefined || v === null) continue;
    const items = isFileList(v) ? Array.from(v) : Array.isArray(v) ? v : [v];
    for (const item of items) {
      if (isFileLike(item)) fd.append(k, item);else
      {
        const s = coerceFormValue(k, item);
        if (s !== null) fd.append(k, s);
      }
    }
  }
  return fd;
}

/** The body `opts` declares, setting its content type on `headers`; both encodings repeat a key per array item. */
function encodeBody(opts, headers) {
  if (opts.body !== undefined) {
    if (!headers.has("content-type")) headers.set("content-type", "application/octet-stream");
    return opts.body;
  }
  if (opts.json !== undefined) {
    headers.set("content-type", "application/json");
    try {
      return JSON.stringify(opts.json);
    } catch (e) {
      /* nothing was sent: a status-0 error, a result in safe mode like any other failure */
      const message = `JSON serialization failed: ${e instanceof Error ? e.message : String(e)}`;
      throw new ClientError({ body: opts.json, message, response: Response.error(), status: 0 });
    }
  }
  if (opts.form === undefined) return undefined;
  const entries = Object.entries(opts.form);
  if (entries.some(([, v]) => isFileLike(v) || isFileList(v) || Array.isArray(v) && v.some(isFileLike))) {
    return multipartBody(entries);
  }
  headers.set("content-type", "application/x-www-form-urlencoded");
  const params = new URLSearchParams();
  for (const [k, v] of entries) {
    for (const item of Array.isArray(v) ? v : [v]) {
      const s = coerceFormValue(k, item);
      if (s !== null) params.append(k, s);
    }
  }
  return params.toString();
}

/** A body that can be sent a second time (retry, redirect). Streams are consumed by the first send. */
function isReplayable(body) {
  return !(typeof ReadableStream !== "undefined" && body instanceof ReadableStream);
}

function timeoutError(ms) {
  return typeof DOMException === "function" ?
  new DOMException(`Request timed out after ${ms} ms`, "TimeoutError") :
  Object.assign(new Error(`Request timed out after ${ms} ms`), { name: "TimeoutError" });
}

/** A request's signal: the caller's abort, the client's and the timeout as one, alive until `done()`. */








/**
 * The signal for one request, aborting with the first of `sources` (the caller's, the client's
 * dispose) or the timeout: a stream has no timeout; `timeout` 0 or less disables it. Listeners,
 * not `AbortSignal.any`: a combined signal only weakly held can be collected before it fires.
 */
function requestSignal(
sources,
timeout)
{
  const signals = sources.filter((signal) => signal !== undefined);
  const timed = timeout !== undefined && timeout > 0;
  if (!timed && signals.length <= 1) return { done: () => {}, exemptFromTimeout: () => {}, signal: signals[0] };
  const ctrl = new AbortController();
  const timer = timed ? setTimeout(() => ctrl.abort(timeoutError(timeout)), timeout) : undefined;
  timer?.unref?.();
  const listeners = signals.map((signal) => {
    const onAbort = () => ctrl.abort(signal.reason);
    if (signal.aborted) ctrl.abort(signal.reason);else
    signal.addEventListener("abort", onAbort, { once: true });
    return () => signal.removeEventListener("abort", onAbort);
  });
  return {
    done: () => {
      clearTimeout(timer);
      for (const remove of listeners) remove();
    },
    exemptFromTimeout: () => clearTimeout(timer),
    signal: ctrl.signal
  };
}

/** The fetch init for one send: credentials and mode from the config, half-duplex for a stream body. */
function requestInit(
at,
config)
{
  const init = { headers: at.headers, method: at.method };
  if (at.body !== undefined) init.body = at.body;
  if (at.signal !== undefined) init.signal = at.signal;
  if (config.credentials) init.credentials = config.credentials;
  if (config.mode) init.mode = config.mode;
  /* a stream body needs half-duplex on Node's fetch */
  if (at.body !== undefined && !isReplayable(at.body)) init.duplex = "half";
  return init;
}

/** A sent request: its answer, and how to release what it holds once the body is read. */








/** A REST call's answer: its value (the response itself when raw) and the response. */


/** Object keys of `{ 400: ... }` are `400` or `"400"` depending on the TS version. */


/** 0 to N-1 as literals. */


/** Each declared status's error, its body typed; the base ClientError at every other error status, 300 to 599. */








/** A safe call's outcome: its data (and declared headers), or the answer's error; the response on both. */






/** How a REST answer is read: parsed or raw, by its declared media type, within the client's limits. */












/** A server's message as an Error may carry it: ASCII control characters stripped, `max` characters at most. */
function sanitizeMessage(message, max) {
  let out = "";
  for (const ch of message) {
    const code = ch.charCodeAt(0);
    if (code > 31 && code !== 127) out += ch;
  }
  return out.slice(0, max);
}

/** What a client bounds an answer to: its error message's characters, and its body's decoded bytes. */


/** The most bytes a body may hold, decoded, before its read is refused: 100 MiB, as every other SDK's. */
const MAX_RESPONSE_BYTES = exports.MAX_RESPONSE_BYTES = 100 * 1024 * 1024;

/** `response`'s body, read in the chunks it arrives in, refused past `max` decoded bytes with the body cancelled. */
async function bodyBytes(response, max = MAX_RESPONSE_BYTES) {
  const reader = response.body?.getReader();
  if (reader === undefined) return new Uint8Array(0);
  const chunks = [];
  let size = 0;
  for (let next = await reader.read(); !next.done; next = await reader.read()) {
    size += next.value.byteLength;
    if (size > max) {
      /* not awaited: a cloned body's branch settles its cancel only once its twin cancels too */
      reader.cancel().catch(() => {

        /* the refusal stands whether or not the body cancels cleanly */});
      const sent = response.headers.get("content-length");
      const what = [response.headers.get("content-type") ?? "no content type", sent && `${sent} bytes`];
      const message = `Response body is over the ${max}-byte cap (${what.filter(Boolean).join(", ")})`;
      throw new DecodeError({ body: null, message, response, status: response.status });
    }
    chunks.push(next.value);
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, at);
    at += chunk.byteLength;
  }
  return bytes;
}

/** `response`'s body as UTF-8 text, bounded as bodyBytes reads it. */
const bodyText = async (response, max) => new TextDecoder().decode(await bodyBytes(response, max));

/**
 * Read an error body: JSON when it parses, else the text, else null; one past `max` bytes reads as null, and its
 * `preserved` twin is cancelled with it, so the body's source stops.
 */
async function readErrorBody(response, preserved, max) {
  let text;
  try {
    text = await bodyText(response, max);
  } catch {
    /* an unreadable body still answers with its status */
    preserved.body?.cancel().catch(() => {

      /* the twin may already be gone */});
    return null;
  }
  if (text.length === 0) return null;
  try {
    return JSON.parse(text);
  } catch {
    /* not JSON: the text itself is the body */
    return text;
  }
}

/** The typed error a non-2xx answer becomes, its response kept readable, its body and message bounded by `limits`. */
async function errorFromResponse(response, limits = {}) {
  const preserved = response.clone();
  const body = await readErrorBody(response, preserved, limits.maxResponseBytes);
  const message =
  typeof body === "object" && body !== null && "message" in body ?
  body["message"] :
  undefined;
  const text =
  typeof message === "string" && message.length > 0 ?
  `HTTP ${response.status}: ${sanitizeMessage(message, limits.maxErrorMessageChars ?? 512)}` :
  `HTTP ${response.status}`;
  return clientErrorFor({ body, message: text, response: preserved, status: response.status });
}

/** A body with no content to read: 204/205/304 and every answer to HEAD. */
function hasNoBody(response, method) {
  return response.status === 204 || response.status === 205 || response.status === 304 || method === "HEAD";
}

/**
 * A 2xx body as a value. An operation declaring no body (`declared` null) reads as null, as a 204
 * does. A declared text or binary answer reads as that type, so an empty one is `""` or zero bytes;
 * otherwise by its content type: JSON parsed, text as text, anything else as bytes (A1), and null
 * when empty.
 */
async function parseBody(
response,
method,
declared,
max)
{
  if (declared === null || hasNoBody(response, method.toUpperCase())) {
    await response.body?.cancel().catch(() => {

      /* nothing to read: a cancel that fails changes nothing */});
    return null;
  }
  if (declared !== undefined) {
    if (isTextMediaType(parseMediaType(declared))) return bodyText(response, max);
    return bodyBytes(response, max);
  }
  const type = parseMediaType(response.headers.get("content-type"));
  if (isJsonMediaType(type)) {
    const text = await bodyText(response, max);
    if (text.length === 0) return null;
    try {
      return JSON.parse(text);
    } catch (cause) {
      const message = "Response body is not valid JSON";
      throw new DecodeError({ body: text, cause, message, response, status: response.status });
    }
  }
  if (isTextMediaType(type)) return bodyText(response, max);
  const bytes = await bodyBytes(response, max);
  return bytes.byteLength === 0 ? null : bytes;
}

/** The declared response headers (A2), by lower-case name, each one only when the answer carries it. */
function declaredHeaders(response, names) {
  const out = {};
  for (const name of names) {
    const value = response.headers.get(name);
    if (value !== null) out[name] = value;
  }
  return out;
}

/**
 * A REST answer read into its value, or the response itself when raw. A non-2xx throws its ClientError, an
 * undecodable 2xx DecodeError, and a body read that fails no answer (f2).
 */
async function finishRequest(sent, reading) {
  const { response } = sent;
  try {
    if (!response.ok) throw await errorFromResponse(response, reading.limits);
    if (reading.raw) return { data: response, response };
    const max = reading.limits?.maxResponseBytes;
    return { data: await parseBody(response, reading.method, reading.declared, max), response };
  } catch (e) {
    throw e instanceof ClientError ? e : sent.failed(e);
  } finally {
    sent.done();
  }
}

/** `answer` as a safe call's Result (bit 21 i): an answer's error its Err; no answer, or none sent, thrown (f2). */
async function resultOf(answer, names) {
  try {
    const { data, response } = await answer;
    const ok = { data, ok: true, response };
    return names ? Object.assign(ok, { headers: declaredHeaders(response, names) }) : ok;
  } catch (e) {
    if (e instanceof ClientError && e.status !== 0) return { error: e, ok: false, response: e.response };
    throw e;
  }
}










/** What the SDK knows of a read's staleness, handed to the request and response hooks. */







































/**
 * - `same-origin` (default): follow redirects that stay on the base URL's origin; a cross-origin
 *   redirect is returned unfollowed (a non-2xx result). In browsers, which hide redirect targets
 *   from script, the platform follows and applies CORS to the target.
 * - `follow`: also follow cross-origin redirects. Such a hop carries only `Accept`,
 *   `Accept-Language` and `User-Agent` (no credentials, auth header, configured, per-call or
 *   `onRequest` header) and never replays a body.
 * - `manual` / `error`: passed to `fetch`.
 */


/**
 * One `onLog` entry: what happened to which operation and how long it took. `operation` is `METHOD` and the
 * path template, the same spelling a hook's `ctx.path` carries (`GET /items/{id}`).
 */





























































const REDIRECT_STATUSES = [301, 302, 303, 307, 308];
const MAX_REDIRECTS = 20;

/** Browsers hide redirect targets from script (`opaqueredirect`), so the platform must follow. */
function platformFollowsRedirects() {
  const g = globalThis;
  return typeof g.document !== "undefined" || typeof g.WorkerGlobalScope !== "undefined";
}

/** The request for the next hop, or `null` when this redirect must be returned unfollowed. */
function nextHop(response, init, crossOrigin) {
  const next = { ...init, headers: new Headers(init.headers) };
  if (response.status === 307 || response.status === 308) {
    /* a body is replayed only to the same origin, and only when it can be sent twice */
    if (init.body != null && (crossOrigin || !isReplayable(init.body))) return null;
  } else {
    /* 303, and 301/302 for POST: the browser behavior is GET without a body */
    const method = (init.method ?? "GET").toUpperCase();
    if (response.status === 303 ? method !== "HEAD" : method === "POST") {
      next.method = "GET";
      delete next.body;
      next.headers.delete("content-type");
    }
  }
  if (crossOrigin) next.headers = crossOriginHeaders(next.headers);
  return next;
}

/** Where a redirect leads, when it is one this client follows: http(s), and same-origin unless `follow`. */
function redirectTarget(response, current, origin, policy) {
  const location = response.headers.get("location");
  if (!REDIRECT_STATUSES.includes(response.status) || location === null) return null;
  let target;
  try {
    target = new URL(location, current);
  } catch {
    /* an unparseable Location is returned as the answer it is */
    return null;
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") return null;
  return target.origin !== origin && policy !== "follow" ? null : target;
}

/**
 * Send `init` to `url`, following redirects as `policy` says: hop by hop, so a cross-origin hop
 * carries only the safe headers and never a body.
 */
async function fetchFollowing(
fetch,
url,
init,
{ origin, policy })
{
  if (policy === "manual" || policy === "error" || platformFollowsRedirects()) {
    return fetch(url.toString(), policy === "same-origin" ? init : { ...init, redirect: policy });
  }
  let current = url;
  let currentInit = { ...init, redirect: "manual" };
  for (let hop = 0;; hop++) {
    const response = await fetch(current.toString(), currentInit);
    const target = hop >= MAX_REDIRECTS ? null : redirectTarget(response, current, origin, policy);
    const next = target === null ? null : nextHop(response, currentInit, target.origin !== origin);
    if (target === null || next === null) return response;
    await response.body?.cancel().catch(() => {

      /* the redirect's own body is never read */});
    current = target;
    currentInit = next;
  }
}

/** Where a response hook runs: the request as sent, its answer, and how to send it again. */












/**
 * `init` as a `Request` can take it: a body that cannot be sent twice is left out, never set to
 * `undefined`, which `RequestInit` does not declare.
 */
function replayable(init) {
  if (isReplayable(init.body)) return init;
  const { body: _body, ...rest } = init;
  return rest;
}

/** `ctx` with the read's stale view, when the SDK tracks one. */
function withMeta(ctx, meta) {
  if (meta) Object.assign(ctx, { invalidatedBy: meta.invalidatedBy, isStale: meta.isStale, selector: meta.selector });
  return ctx;
}

/** Let each `onRequest` hook see the request and change it; resolves to the body it now sends. */
async function runRequestHooks(
hooks,
ctx,
meta)
{
  withMeta(ctx, meta);
  for (const hook of hooks) await hook(ctx);
  return ctx.body;
}

/** Let each `onResponse` hook see the answer and replace it. */
async function runResponseHooks(
hooks,
at)
{
  let request;
  const { init } = at;
  const ctx = {
    isRetry: at.isRetry,
    method: at.method,
    path: at.path,
    get request() {
      /* built on demand: constructing a Request per response is not free */
      request ??= new Request(at.url.toString(), replayable(init));
      return request;
    },
    response: at.response,
    retry: () => at.isRetry ? Promise.resolve(ctx.response) : at.retry(),
    state: at.state,
    url: at.url.toString()
  };
  withMeta(ctx, at.meta);
  for (const hook of hooks) {
    const result = await hook(ctx);
    if (result instanceof Response) ctx.response = result;
  }
  return ctx.response;
}

/** The `onLog` entries of one exchange: its start now, then its answer or its failure, each with its duration. */
function exchangeLog(
onLog,
operation)
{
  const start = Date.now();
  onLog?.({ duration_ms: 0, event: "request_start", level: "debug", operation });
  const took = () => Date.now() - start;
  return {
    answered: (response) => {
      const level = response.status >= 400 ? "warn" : "info";
      onLog?.({ duration_ms: took(), event: "response_received", level, operation, status: response.status });
    },
    failed: (error) => {
      const status = error?.status;
      const entry = { duration_ms: took(), error, event: "error", level: "error", operation };
      onLog?.(typeof status === "number" ? { ...entry, status } : entry);
    }
  };
}

/** One server-sent event; `data` is the raw text, or the parsed value when the operation declares JSON events. */








/* the siblings' caps, in UTF-8 bytes */
const MAX_LINE = 1 << 20;
const MAX_EVENT = 8 << 20;

/** `text`'s UTF-8 bytes, counted until past `max`. */
function bytesOf(text, max = Infinity) {
  let bytes = 0;
  for (let i = 0; i < text.length && bytes <= max; i++) {
    const unit = text.charCodeAt(i);
    bytes += unit < 0x80 ? 1 : unit < 0x800 || unit >= 0xd800 && unit < 0xe000 ? 2 : 3;
  }
  return bytes;
}

/** Whether `line` is over `max` UTF-8 bytes; a third of `max` in code units is within it, uncounted. */
const overLine = (line, max) => line.length * 3 > max && bytesOf(line, max) > max;

/** One event being read: its fields as they arrive, dispatched on a blank line. */
class EventFields {
  #max;
  #data = [];
  #size = 0;
  #hasData = false;
  #event;
  #lastId = "";
  #retry;

  constructor(max) {
    this.#max = max;
  }

  /** The event so far, when it has data; every field but the sticky id resets. */
  dispatch() {
    const out = this.#hasData ? { data: this.#data.join("\n") } : undefined;
    if (out) {
      if (this.#event !== undefined && this.#event !== "") out.event = this.#event;
      if (this.#lastId !== "") out.id = this.#lastId;
      if (this.#retry !== undefined) out.retry = this.#retry;
      this.#retry = undefined;
    }
    this.#data = [];
    this.#size = 0;
    this.#hasData = false;
    this.#event = undefined;
    return out;
  }

  /** One `field: value` line; a comment or an unknown field changes nothing. */
  read(line) {
    if (line.charCodeAt(0) === 58 /* : */) return;
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.charCodeAt(0) === 32) value = value.slice(1);
    if (field === "data") {
      this.#size += bytesOf(value) + (this.#hasData ? 1 : 0);
      if (this.#size > this.#max) throw new Error(`SSE event exceeds ${this.#max} bytes`);
      this.#data.push(value);
      this.#hasData = true;
    } else if (field === "event") this.#event = value;else
    if (field === "id") {
      if (!value.includes("\0")) this.#lastId = value;
    } else if (field === "retry" && /^\d+$/.test(value)) this.#retry = Number(value);
  }
}

/** The complete lines at the head of `pending` (CRLF, LF or CR), and what is left after them. */
function completeLines(pending) {
  const lines = [];
  let start = 0;
  let end = 0;
  while (start < pending.length) {
    end = start;
    while (end < pending.length && pending.charCodeAt(end) !== 10 && pending.charCodeAt(end) !== 13) end++;
    if (end === pending.length) break;
    /* a CR as the last character may be the first half of CRLF */
    if (pending.charCodeAt(end) === 13 && end === pending.length - 1) break;
    lines.push(pending.slice(start, end));
    start = end + (pending.charCodeAt(end) === 13 && pending.charCodeAt(end + 1) === 10 ? 2 : 1);
  }
  return { lines, rest: pending.slice(start) };
}

/** The open line as its pieces and their UTF-8 bytes: joining it per chunk was quadratic. */
function openLine(max) {
  let pieces = [];
  let bytes = 0;
  return {
    /** The lines `text` completes; with no line end, and no CR before it, it extends the open line. */
    take(text) {
      const last = pieces[pieces.length - 1];
      if (!/[\r\n]/.test(text) && last?.charCodeAt(last.length - 1) !== 13) {
        pieces.push(text);
        bytes += bytesOf(text, max);
        return [];
      }
      const { lines, rest } = completeLines(pieces.join("") + text);
      pieces = rest === "" ? [] : [rest];
      bytes = bytesOf(rest, max);
      return lines;
    },
    over: () => bytes > max,
    /** only a CR is open, held back as a possible CRLF's first half */
    lone: () => pieces.length === 1 && pieces[0] === "\r"
  };
}

/** `stream`'s reader, and a read whose failure throws `failed`'s error for it. */
function readerOf(stream, failed = (cause) => cause) {
  const reader = stream.getReader();
  const read = () =>
  /* no answer (f2) */
  reader.read().catch((cause) => {
    throw failed(cause);
  });
  return { read, reader };
}

/**
 * Parse a `text/event-stream` body per the WHATWG "event stream interpretation" rules: lines end
 * at CRLF, LF or CR; a leading BOM is skipped; `id` persists until changed and an `id` holding NUL
 * is ignored; `retry` counts only when all ASCII digits; an event still open when the stream ends
 * is discarded. A line over `maxLineBytes` (1 MiB) or an event's data over `maxEventBytes` (8 MiB), in UTF-8 bytes,
 * throws after every event completed before it, as does a failed read, by `failed`. Leaving a `for await` early (a
 * break, return or throw) cancels the body's reader, which frees the connection.
 */
async function* parseSSEStream(
stream,
opts)




{
  const decoder = new TextDecoder();
  const { failed, maxEventBytes = MAX_EVENT, maxLineBytes: maxLine = MAX_LINE } = opts ?? {};
  const { read, reader } = readerOf(stream, failed);
  const fields = new EventFields(maxEventBytes);
  const open = openLine(maxLine);
  let first = true;
  try {
    for (let chunk = await read(); !chunk.done; chunk = await read()) {
      let text = decoder.decode(chunk.value, { stream: true });
      if (first && text.length > 0) {
        if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
        first = false;
      }
      for (const line of open.take(text)) {
        if (overLine(line, maxLine)) throw new Error(`SSE line exceeds ${maxLine} bytes`);
        const out = line === "" ? fields.dispatch() : fields.read(line);
        if (out) yield out;
      }
      if (open.over()) throw new Error(`SSE line exceeds ${maxLine} bytes`);
    }
    /* a lone CR held back at the end of the stream still ends a blank line; anything else open is discarded */
    if (open.lone()) {
      const out = fields.dispatch();
      if (out) yield out;
    }
  } finally {
    await reader.cancel().catch(() => {

      /* the stream is done either way */});
    reader.releaseLock();
  }
}

/** One request, ready to send: where, with what, and the hooks' view of it. */


/** One call: its method, path template and options; `refreshes: false` leaves a 401 to the realtime loop. */


/** The realtime loop's refresh key, exported by the SDK under no name. */
const REFRESH_AUTH = exports.REFRESH_AUTH = /* @__PURE__ */Symbol("honey.refreshAuth");

/** The send and the config, for the stream functions beside the client. */
const SEND = exports.SEND = /* @__PURE__ */Symbol("honey.send");
const CONFIG = exports.CONFIG = /* @__PURE__ */Symbol("honey.config");

/** One operation of a generated SDK: the call, how it is read, and its stale view for the hooks. */






/** Ignore a failed cancel: the body is being discarded either way. */
const discard = (response) =>
response.body?.cancel().catch(() => {

  /* discarded */});

class HTTPClient {
  #config;
  #fetch;
  #base;
  #token = null;
  #refreshing = null;

  #disposal;

  /** `disposal` aborts every request in flight and refuses later ones (a generated SDK's `dispose()`). */
  constructor(config, disposal) {
    this.#config = config;
    this.#fetch = connectionErrors(bindDefaultFetch(config.fetch));
    this.#disposal = disposal;
  }

  /** The base URL, parsed once; a per-call base (C2) is parsed for that call. */
  #baseFor(opts) {
    if (opts.baseURL !== undefined) return parseClientBaseURL(opts.baseURL);
    this.#base ??= parseClientBaseURL(this.#config.baseURL);
    return this.#base;
  }

  get #authName() {
    return this.#config.authHeaderName ?? "Authorization";
  }

  get #authPrefix() {
    return this.#config.authHeaderPrefix ?? (this.#config.authHeaderName === undefined ? "Bearer " : "");
  }

  #query(search) {
    const params = (this.#config.buildSearchParams ?? defaultSearchParams)(search);
    if (this.#config.sortSearchParams) params.sort();
    return params;
  }

  /** Resolve `path` against the base URL, keeping the base path and query, and assert it stays there. */
  #url(path, opts) {
    const resolved = interpolatePath(path, opts.params);
    const base = this.#baseFor(opts);
    const basePath = base.pathname.endsWith("/") ? base.pathname : `${base.pathname}/`;
    const url = new URL(base.href);
    url.pathname = `${basePath}${resolved.startsWith("/") ? resolved.slice(1) : resolved}`;
    url.hash = "";
    /* params are validated, so this only fires on a malformed template; never send it anywhere else */
    if (url.origin !== base.origin || !url.pathname.startsWith(basePath.slice(0, -1))) {
      throw new Error(`Request path ${JSON.stringify(path)} resolves outside the base URL`);
    }
    if (opts.search) for (const [k, v] of this.#query(opts.search).entries()) url.searchParams.append(k, v);
    return url;
  }

  async #headers(opts, ctx) {
    const configured = this.#config.headers;
    const resolved = typeof configured === "function" ? await configured(ctx) : configured;
    /* a refreshed token replaces the configured one; per-call headers still win */
    const auth = this.#token === null ? {} : { [this.#authName]: `${this.#authPrefix}${this.#token}` };
    return headersOf([resolved ?? {}, auth, opts.headers ?? {}], opts.cookies, this.#config.requestId !== false);
  }

  /** Share one `onAuthExpired` call between concurrent 401s; reuse a token another request already got. */
  #refresh(rejectedToken) {
    if (this.#token !== null && rejectedToken !== this.#token) return Promise.resolve(this.#token);
    if (this.#refreshing) return this.#refreshing;
    const hook = this.#config.onAuthExpired;
    if (!hook) return Promise.resolve(null);
    this.#refreshing = Promise.resolve().
    then(() => hook({ rejectedToken })).
    then((token) => {
      this.#token = typeof token === "string" && token.length > 0 ? token : null;
      return this.#token;
    }).
    finally(() => {
      this.#refreshing = null;
    });
    return this.#refreshing;
  }

  get [CONFIG]() {
    return this.#config;
  }

  /** One request sent: its hooks run, its auth refreshed, its redirects followed. */
  [SEND](call, kind, meta) {
    return this.#send(call, kind, meta);
  }

  /** The client's one shared refresh; whether a new token is in place. */
  async [REFRESH_AUTH]() {
    return (await this.#refresh(this.#token)) !== null;
  }

  /** Build the request and let the `onRequest` hooks see and change it. */
  async #prepare({ method, opts, path }, kind, meta) {
    const url = this.#url(path, opts);
    const headers = await this.#headers(opts, { method, path });
    if (kind === "stream") {
      headers.set("accept", "text/event-stream");
      if (opts.lastEventId) headers.set("last-event-id", opts.lastEventId);
    }
    const prepared = { body: encodeBody(opts, headers), headers, url };
    if (!this.#config.onRequest) return prepared;
    const ctx = { body: prepared.body, headers, method, path, state: this.#config.state ?? {}, url: url.toString() };
    prepared.body = await runRequestHooks(this.#config.onRequest, ctx, meta);
    return prepared;
  }

  /** Send, following redirects; on a 401 with a refresh hook, retry once with the fresh token. */
  async #transmit(url, init, isRetry) {
    const options = { origin: url.origin, policy: this.#config.redirect ?? "same-origin" };
    const response = await fetchFollowing(this.#fetch, url, init, options);
    if (response.status !== 401 || !this.#config.onAuthExpired || isRetry || !isReplayable(init.body)) return response;
    const sent = init.headers.get(this.#authName);
    const rejected = sent?.startsWith(this.#authPrefix) ? sent.slice(this.#authPrefix.length) : sent ?? null;
    const token = await this.#refresh(rejected);
    if (token === null) return response;
    const headers = new Headers(init.headers);
    headers.set(this.#authName, `${this.#authPrefix}${token}`);
    init.headers = headers;
    await discard(response);
    return fetchFollowing(this.#fetch, url, { ...init }, options);
  }

  /** Build, send and post-process one request: hooks, auth refresh, redirects. */
  async #send(call, kind, meta, isRetry = false) {
    const { method, opts, path } = call;
    const { body, headers, url } = await this.#prepare(call, kind, meta);
    const timeout = opts.timeout ?? this.#config.timeout;
    const { done, exemptFromTimeout, signal } = requestSignal([opts.signal, this.#disposal], timeout);
    const cleanups = [done];
    const finish = () => {
      for (const fn of cleanups.splice(0)) fn();
    };
    const init = requestInit({ body, headers, method, signal }, this.#config);
    const log = exchangeLog(this.#config.onLog, `${method.toUpperCase()} ${path}`);
    try {
      signal?.throwIfAborted();
      let response = await this.#transmit(url, init, isRetry || call.refreshes === false);
      log.answered(response);
      if (this.#config.onResponse) {
        const retry = async () => {
          const again = await this.#send(call, kind, meta, true);
          cleanups.push(again.done);
          return again.response;
        };
        const state = this.#config.state ?? {};
        const at = { init, isRetry, meta, method, path, response, retry, state, url };
        response = await runResponseHooks(this.#config.onResponse, at);
      }
      return { done: finish, exemptFromTimeout, failed: (cause) => noAnswer(cause, url, init), response };
    } catch (e) {
      finish();
      log.failed(e);
      throw e;
    }
  }

  #reading(method, opts) {
    return { limits: this.#config, method, raw: opts.raw };
  }

  /** The parsed body; a non-2xx throws its ClientError (a per-status subclass). */
  async request(method, path, opts, meta) {
    return (await this.requestOperation({ meta, method, opts, path })).data;
  }

  /** One REST operation's answer, read as `op` says: parsed, or raw. */
  async requestOperation(op) {
    const sent = await this.#send(op, "rest", op.meta);
    return finishRequest(sent, { ...this.#reading(op.method, op.opts), declared: op.declared });
  }

  buildUrl(path, opts) {
    return this.#url(path, opts).toString();
  }

  buildPath(path, opts) {
    const resolved = interpolatePath(path, opts.params);
    const qs = opts.search ? this.#query(opts.search).toString() : "";
    return qs ? `${resolved}?${qs}` : resolved;
  }
}

/** An event stream's call: its stale view, and what runs once its answer is ok. */exports.HTTPClient = HTTPClient;


/** Whether `response` answers with an event stream. */
function isEventStream(response) {
  return parseMediaType(response.headers.get("content-type"))?.essence === "text/event-stream";
}

/** An event stream sent when its iteration starts: `open`'s events. */
const later = (open) => ({
  async *[Symbol.asyncIterator]() {
    yield* (await open()).data;
  }
});

/** The events of a sent stream, read as they arrive; the request is done when iteration ends. */exports.later = later;
function iterate(http, sent) {
  const config = http[CONFIG];
  const caps = { maxEventBytes: config.sseMaxEventBytes, maxLineBytes: config.sseMaxLineBytes };
  return {
    async *[Symbol.asyncIterator]() {
      try {
        if (sent.response.body) yield* parseSSEStream(sent.response.body, { ...caps, failed: sent.failed });
      } finally {
        sent.done();
      }
    }
  };
}

/**
 * One request whose shape is decided by the answer: an event stream becomes an
 * `AsyncIterable<SSEEvent>` (never buffered, exempt from the timeout once headers arrive);
 * anything else is read as in `request`.
 */
async function requestAuto(
http,
method,
path,
opts)
{
  const sent = await http[SEND]({ method, opts, path }, "auto");
  if (!sent.response.ok || !isEventStream(sent.response) || opts.raw)
  return finishRequest(sent, { limits: http[CONFIG], method, raw: opts.raw });
  sent.exemptFromTimeout();
  return { data: iterate(http, sent), response: sent.response };
}

function requestStream(
http,
method,
path,
opts)
{
  return streamOperation(http, { method, opts, path });
}

/** An event stream, sent when iteration starts; `onOpen` runs once the answer is ok. */
function streamOperation(http, op) {
  return later(() => openStream(http, op));
}

/** An event stream opened: its non-2xx thrown as its ClientError, `onOpen` run, its events read as they arrive. */
async function openStream(
http,
op)
{
  const sent = await http[SEND](op, "stream", op.meta);
  /* the timeout bounded the open; the stream itself is never cut by it */
  sent.exemptFromTimeout();
  if (!sent.response.ok) {
    try {
      throw await errorFromResponse(sent.response, http[CONFIG]);
    } finally {
      sent.done();
    }
  }
  op.onOpen?.(sent.response);
  return { data: iterate(http, sent), response: sent.response };
}

/**
 * Resolve invalidation targets by substituting the mutation's params. Params that are absent stay
 * placeholders, so a partially resolved target is a narrower pattern, never dropped: `PUT
 * /orgs/{org}` invalidating `GET /orgs/:org/members/:id` marks `GET /orgs/acme/members/:id`.
 */
function resolveInvalidationTargets(
targets,
params)
{
  return targets.map((target) => {
    const space = target.indexOf(" ");
    if (space === -1 || !params) return target;
    try {
      return `${target.slice(0, space)} ${interpolatePartial(target.slice(space + 1), params)}`;
    } catch {
      /* a param value that is not a path segment cannot address a resource; keep the pattern */
      return target;
    }
  });
}

/* Bound memory: which concrete paths have already refreshed against a pattern-level mark, and the
   compiled patterns, are capped; the marks and their sources are capped by `StaleLimits`. */
const MAX_REFRESHED = 1024;
const MAX_PATTERNS = 1024;









/** Drop the oldest value of an insertion-ordered set once it holds `max`. */
function capped(set, max) {
  if (set.size < max) return;
  const oldest = set.values().next().value;
  if (oldest !== undefined) set.delete(oldest);
}

/** How many exact marks the index keeps, and how many mutations each mark remembers. */


/**
 * Stale marks, split by kind so a concrete key is never re-read as a pattern (a path may contain
 * `:`), and a lookup scans only patterns for its own method.
 */
class StaleIndex {
  exact = new Map();
  patterns = new Map();
  #compiled = new Map();
  #limits;

  constructor(limits) {
    this.#limits = limits;
  }

  /** Whether `path` matches the route pattern `pattern` (`:name`, `{name}`, `*`), literal text escaped. */
  matches(path, pattern) {
    let re = this.#compiled.get(pattern);
    if (re === undefined) {
      if (this.#compiled.size >= MAX_PATTERNS) this.#compiled.delete(this.#compiled.keys().next().value);
      re = compilePattern(pattern);
      this.#compiled.set(pattern, re);
    }
    return re.test(path);
  }

  /** Mark `target` stale on behalf of `mutation`, until `at.until`. */
  mark(target, mutation, at) {
    const { seq, until } = at;
    const space = target.indexOf(" ");
    const method = target.slice(0, space);
    const isPattern = hasPlaceholder(target.slice(space + 1));
    let table = this.exact;
    if (isPattern) {
      table = this.patterns.get(method) ?? new Map();
      this.patterns.set(method, table);
    }
    const existing = table.get(target);
    if (!existing) {
      table.set(target, { by: new Set([mutation]), refreshed: isPattern ? new Set() : undefined, seq, until });
      if (!isPattern) this.#bound(at.now);
      return;
    }
    existing.by.delete(mutation);
    capped(existing.by, this.#limits.maxSources);
    existing.by.add(mutation);
    existing.until = until;
    existing.seq = seq;
    /* a new mutation re-marks every instance */
    existing.refreshed?.clear();
  }

  /** Past `maxEntries` exact marks, drop the expired ones, then the oldest live ones. */
  #bound(now) {
    const { maxEntries } = this.#limits;
    if (this.exact.size <= maxEntries) return;
    for (const [key, entry] of this.exact) if (entry.until <= now) this.exact.delete(key);
    for (const key of this.exact.keys()) {
      if (this.exact.size <= maxEntries) return;
      this.exact.delete(key);
    }
  }

  lookup(selector, path, method, now) {
    const by = new Set();
    const exact = this.exact.get(selector);
    if (exact && exact.until > now) for (const m of exact.by) by.add(m);else
    if (exact) this.exact.delete(selector);
    for (const [key, entry] of this.patterns.get(method) ?? []) {
      if (entry.until <= now) this.patterns.get(method)?.delete(key);else
      if (!entry.refreshed?.has(path) && this.matches(path, key.slice(key.indexOf(" ") + 1))) {
        for (const m of entry.by) by.add(m);
      }
    }
    return { by: [...by], isStale: by.size > 0 };
  }

  /**
   * A successful stale read clears the mark for that resource only: the exact entry, and this
   * concrete path's share of any pattern entry. Marks newer than the read's snapshot stay.
   */
  clear(selector, path, method, snapshot) {
    const exact = this.exact.get(selector);
    if (exact && exact.seq <= snapshot) this.exact.delete(selector);
    for (const [key, entry] of this.patterns.get(method) ?? []) {
      if (entry.seq > snapshot || !entry.refreshed) continue;
      if (!this.matches(path, key.slice(key.indexOf(" ") + 1))) continue;
      capped(entry.refreshed, MAX_REFRESHED);
      entry.refreshed.add(path);
    }
  }
}

/** One operation as the service map holds it: where it goes and how its answer is read. */



























/** Read-after-write tracking: a mutation's `x-invalidate` targets read as stale for `staleTime` ms. */










/** What a REST call takes; a stream, WebSocket or realtime operation's own call types its input further. */




/** The function a non-REST entry is called through: its own adapter, which the service map names. */exports.StaleIndex = StaleIndex;


const isEntry = (node) =>
typeof node === "object" &&
node !== null &&
Object.hasOwn(node, "method") &&
typeof node.method === "string";

/** Only the map's own keys are operations: never `toString`, `constructor` or `then`. */
const childOf = (node, key) =>
Object.hasOwn(node, key) ? node[key] : undefined;

/** The template the runtime interpolates: a wildcard param's `{name}` becomes the rest-of-path `*name`. */
function templateOf(entry) {
  return entry.wildcard === undefined ? entry.path : entry.path.replace(`{${entry.wildcard}}`, `*${entry.wildcard}`);
}

/** A call whose path params cannot form a path, as a status-0 ClientError: no request was sent. */
function pathError(e, entry) {
  return new ClientError({
    body: null,
    message: `${e.message} for ${entry.method} ${entry.path}`,
    response: Response.error(),
    status: 0
  });
}

/** The per-call options an entry adds: its `Accept` and an `Idempotency-Key`. */
function optionsFor(entry, input) {
  const headers = {};
  if (entry.accept) headers["accept"] = entry.accept;
  Object.assign(headers, input.headers);
  if (entry.idempotent && !Object.keys(headers).some((k) => k.toLowerCase() === "idempotency-key"))
  headers["Idempotency-Key"] = input.idempotencyKey ?? newClientRequestId();
  return { ...input, headers };
}

/** The client behind a generated SDK class: operations from the service map, read-after-write tracking, dispose. */
class SdkCore {
  http;
  #config;
  #disposal = new AbortController();
  #stale;
  #seq = 0;

  constructor(config) {
    this.#config = config;
    this.http = new HTTPClient(config, this.#disposal.signal);
    this.#stale = this.#newIndex();
  }

  #newIndex() {
    const invalidation = this.#config.invalidation;
    if (!invalidation || invalidation.staleTime <= 0) return null;
    const maxSources = Math.max(invalidation.maxSourcesPerTarget ?? 16, 1);
    return new StaleIndex({ maxEntries: invalidation.staleMaxEntries ?? 1000, maxSources });
  }

  dispose() {
    this.#disposal.abort(new Error("The client was disposed"));
    this.#stale = this.#newIndex();
  }

  /** The stale view of the read `selector` before it is sent. */
  meta(selector, path, method) {
    if (!this.#stale) return undefined;
    const { by, isStale } = this.#stale.lookup(selector, path, method, Date.now());
    return { invalidatedBy: by, isStale, selector, seqSnapshot: this.#seq };
  }

  /** Mark what a successful mutation `selector` invalidates. */
  mark(entry, params, selector) {
    if (!this.#stale || !entry.invalidate?.length) return;
    const now = Date.now();
    const at = { now, seq: ++this.#seq, until: now + (this.#config.invalidation?.staleTime ?? 0) };
    for (const target of resolveInvalidationTargets(entry.invalidate, params)) this.#stale.mark(target, selector, at);
  }

  /** A REST op's answer, its `x-invalidate` targets marked and its stale mark cleared once it is a 2xx. */
  async request(entry, input) {
    const template = templateOf(entry);
    let path;
    try {
      path = interpolatePath(template, input.params);
    } catch (e) {
      throw e instanceof PathParamError ? pathError(e, entry) : e;
    }
    const selector = `${entry.method} ${path}`;
    const meta = this.meta(selector, path, entry.method);
    const opts = optionsFor(entry, input);
    const declared = entry.empty ? null : entry.accept;
    const settle = () => {
      this.mark(entry, input.params, selector);
      if (meta?.isStale) this.#stale?.clear(selector, path, entry.method, meta.seqSnapshot);
    };
    try {
      const answer = await this.http.requestOperation({ declared, meta, method: entry.method, opts, path: template });
      settle();
      return answer;
    } catch (e) {
      /* a 2xx whose body does not decode still changed what it invalidates */
      if (e instanceof DecodeError) settle();
      throw e;
    }
  }
}

/** The function an entry is called through, named by its member path; a safe one's REST answer a Result. */exports.SdkCore = SdkCore;
function callable(core, entry, name, safe) {
  let fn;
  /* a stream, WebSocket or realtime op is called through the adapter its entry names */
  if (entry.call) fn = entry.call(core, entry, safe);else
  if (safe) fn = (input) => resultOf(core.request(entry, input ?? {}), entry.headers);else
  fn = async (input) => (await core.request(entry, input ?? {})).data;
  Object.defineProperty(fn, "name", { value: name });
  return fn;
}

/** A namespace of the map: each read of a key returns the same function or namespace object. */
function namespace(core, node, path, safe) {
  const members = new Map();
  return new Proxy({}, {
    get(target, key) {
      if (typeof key === "symbol") return Reflect.get(target, key);
      const child = childOf(node, key);
      if (child === undefined) return Reflect.get(target, key);
      return memberOf(core, members, { child, path: [...path, key], safe });
    }
  });
}



/** A member at its node and path, the twin's or not, once: a callable for an entry, a namespace object otherwise. */
function memberOf(core, members, at) {
  const key = at.path.join(".");
  let member = members.get(key);
  if (member === undefined) {
    member = isEntry(at.child) ? callable(core, at.child, key, at.safe) : namespace(core, at.child, at.path, at.safe);
    members.set(key, member);
  }
  return member;
}

/** `config` with the API's auth scheme as its header pair's default. */
function schemeAuth(config, headerName, prefix) {
  if (config.authHeaderName !== undefined) return config;
  return { ...config, authHeaderName: headerName, authHeaderPrefix: config.authHeaderPrefix ?? prefix };
}

/**
 * A generated SDK's base class. The instance is a Proxy over the service map: `sdk.users.create(input)`
 * dispatches the entry at `users.create`; the client's own members (`safe`, `state`, `dispose`, `toString`)
 * always win, and a key the map does not hold reads as `undefined`.
 */
class SDKClient {
  /** the same operations, each answering a Result, never throwing an API answer (bit 21 i) */
  safe;
  state;
  #core;

  constructor(serviceMap, config) {
    this.state = config.state ?? {};
    this.#core = new SdkCore({ ...config, state: this.state });
    const core = this.#core;
    this.safe = namespace(core, serviceMap, [], true);
    const members = new Map();
    return new Proxy(this, {
      get(target, key) {
        if (typeof key === "symbol" || key in target) {
          const value = Reflect.get(target, key);
          return typeof value === "function" ? value.bind(target) : value;
        }
        const child = childOf(serviceMap, key);
        return child === undefined ? undefined : memberOf(core, members, { child, path: [key], safe: false });
      }
    });
  }

  /** Printable: `String(sdk)` is `[object <SdkName>]`. */
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }

  /** Abort every call in flight, refuse later ones, and drop the stale marks. */
  dispose() {
    this.#core.dispose();
  }
}

/** Each event with its `data` parsed as JSON; an event that does not parse fails the stream, naming it. */exports.SDKClient = SDKClient;
function jsonEvents(events) {
  return {
    async *[Symbol.asyncIterator]() {
      for await (const event of events) {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          const name = event.id === undefined ? "an event" : `event ${JSON.stringify(event.id)}`;
          const message = `SSE ${name} is not valid JSON: ${e instanceof Error ? e.message : String(e)}`;
          throw new ClientError({ body: event.data, message, response: Response.error(), status: 0 });
        }
        yield { ...event, data };
      }
    }
  };
}

/** An SSE op opened: its stale view for the hooks, and its `x-invalidate` targets marked once the answer is ok. */
async function open(core, entry, input) {
  const opts = optionsFor(entry, input);
  const template = templateOf(entry);
  let selector;
  let meta;
  try {
    const path = interpolatePath(template, input.params);
    selector = `${entry.method} ${path}`;
    meta = core.meta(selector, path, entry.method);
  } catch {

    /* a bad param fails the stream when it is sent, as for any call */}
  const onOpen = () => {
    if (selector !== undefined) core.mark(entry, input.params, selector);
  };
  const { data, response } = await openStream(core.http, { meta, method: entry.method, onOpen, opts, path: template });
  return { data: entry.sse === "json" ? jsonEvents(data) : data, response };
}

/** An event stream: sent when iterated, or opened into a Result by the safe twin. */
const sseOp = (core, entry, safe) => {
  const opened = (input) => open(core, entry, input ?? {});
  return safe ?
  (input) => resultOf(opened(input)) :
  (input) => later(() => opened(input));
};exports.sseOp = sseOp;
