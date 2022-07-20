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

// src/usecases/res-op/ResOpResolver.ts
var ResOpResolver_exports = {};
__export(ResOpResolver_exports, {
  ResOpResolver: () => ResOpResolver
});
module.exports = __toCommonJS(ResOpResolver_exports);
var ResOpResolver = class {
  constructor(operations, resourceName, operationName, fallbackOp) {
    this.operations = operations;
    this.resourceName = resourceName;
    this.operationName = operationName;
    this.fallbackOp = fallbackOp;
  }
  getOperationMethod() {
    const res = this.operations[this.resourceName];
    if (!res) {
      throw new Error(`There is no resource: '${this.resourceName}'`);
    }
    const op = res[this.operationName];
    if (!op) {
      if (this.fallbackOp) {
        return this.fallbackOp;
      } else {
        throw new Error(`There is no operation: '${this.operationName}'`);
      }
    } else {
      return op;
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ResOpResolver
});
