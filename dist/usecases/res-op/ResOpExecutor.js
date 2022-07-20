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

// src/usecases/res-op/ResOpExecutor.ts
var ResOpExecutor_exports = {};
__export(ResOpExecutor_exports, {
  ResOpExecutor: () => ResOpExecutor
});
module.exports = __toCommonJS(ResOpExecutor_exports);

// src/NodeExecutorBase.ts
var NodeExecutorBase = class {
  constructor(node) {
    this.itemIndex = 0;
    this.execute = async (itemIndex) => {
      this.itemIndex = itemIndex;
      this.state.updateIndex(this.itemIndex);
      return this.executeCurrentItem();
    };
    this.state = node;
  }
};

// src/usecases/res-op/ResOpExecutor.ts
var ResOpExecutor = class extends NodeExecutorBase {
  constructor(state, resolver, client) {
    super(state);
    this.resolver = resolver;
    this.client = client;
  }
  executeCurrentItem() {
    const opFn = this.resolver.getOperationMethod();
    return opFn(this.client, this.state);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ResOpExecutor
});
