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
var src_exports = {};
__export(src_exports, {
  NodeExecutorBase: () => NodeExecutorBase,
  StateBase: () => StateBase,
  StaticDataBase: () => StaticDataBase,
  getNodeExecFn: () => getNodeExecFn
});
module.exports = __toCommonJS(src_exports);

// src/getNodeExecFn.ts
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

// src/StateBase.ts
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
};

// src/StaticDataBase.ts
var StaticDataBase = class {
  constructor(execFns) {
    this.execFns = execFns;
  }
  get global() {
    return this.execFns.getWorkflowStaticData("global");
  }
  get node() {
    return this.execFns.getWorkflowStaticData("node");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NodeExecutorBase,
  StateBase,
  StaticDataBase,
  getNodeExecFn
});