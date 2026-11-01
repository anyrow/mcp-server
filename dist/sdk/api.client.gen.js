"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.Api = void 0;var _apiRuntime = require("./api.runtime.gen");
var _apiMap = require("./api.map.gen");


class Api extends _apiRuntime.SDKClient {
  constructor(config) {
    super(_apiMap.serviceMap, (0, _apiRuntime.schemeAuth)({ ...config, baseURL: config.baseURL ?? "/api" }, "Authorization", "ApiKey "));
  }
}

/* declaration merge: the Proxy-backed class carries the typed operations, and their safe twins */exports.Api = Api;
