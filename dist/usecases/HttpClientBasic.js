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

// src/usecases/HttpClientBasic.ts
var HttpClientBasic_exports = {};
__export(HttpClientBasic_exports, {
  HttpClientBasic: () => HttpClientBasic
});
module.exports = __toCommonJS(HttpClientBasic_exports);
var normalizeUrl = (url) => url.endsWith("/") ? url.slice(0, -1) : url;
var HttpClientBasic = class {
  constructor(requestFn, creds) {
    this.requestFn = requestFn;
    this.creds = creds;
    this.token = Buffer.from(`${this.creds.username}:${this.creds.password}`).toString("base64");
    this.url = normalizeUrl(this.creds.url);
  }
  request(options) {
    options.headers["Authorization"] = `Basic ${this.token}`;
    return this.requestFn(Object.assign({}, options, { url: this.url + options.url }));
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpClientBasic
});
