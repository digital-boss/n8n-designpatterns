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

// src/getNodeExecFn.ts
var getNodeExecFn_exports = {};
__export(getNodeExecFn_exports, {
  getNodeExecFn: () => getNodeExecFn
});
module.exports = __toCommonJS(getNodeExecFn_exports);
var getNodeExecFn = (execItem) => async function() {
  const items = this.getInputData();
  const length = items.length;
  const returnData = [];
  for (let itemIndex = 0; itemIndex < length; itemIndex++) {
    try {
      const result = await execItem(itemIndex);
      if (result.constructor === Array) {
        returnData.push.apply(returnData, result);
      } else {
        returnData.push(result);
      }
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({ error: error.message });
        continue;
      }
      throw error;
    }
  }
  return [this.helpers.returnJsonArray(returnData)];
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getNodeExecFn
});
