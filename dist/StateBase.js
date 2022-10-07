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

// src/StateBase.ts
var StateBase_exports = {};
__export(StateBase_exports, {
  StateBase: () => StateBase
});
module.exports = __toCommonJS(StateBase_exports);
var StateBase = class {
  constructor(execFns) {
    this.itemIndex = 0;
    this.execFns = execFns;
  }
  updateIndex(itemIndex) {
    this.itemIndex = itemIndex;
  }
  getParam(name) {
    return this.execFns.getNodeParameter(name, this.itemIndex);
  }
  getAllParams() {
    const params = this.execFns.getNode().parameters;
    const paramsWithValues = Object.keys(params).map((name) => [name, this.getParam(name)]);
    return Object.fromEntries(paramsWithValues);
  }
  applyPathParams(path) {
    const rx = new RegExp("{[a-zA-Z_][a-zA-Z0-9]*}", "g");
    const matches = path.match(rx);
    if (matches && matches.length > 0) {
      matches.forEach((match, i) => {
        const value = this.getParam(match.slice(1, -1));
        if (value !== void 0) {
          path = path.replace(match, value);
        }
      });
    }
    return path;
  }
  isParamExists(name) {
    return name in this.execFns.getNode().parameters;
  }
  tryGetParam(name) {
    if (this.isParamExists(name)) {
      return this.getParam(name);
    }
    return void 0;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StateBase
});
