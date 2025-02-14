"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/.pnpm/rfdc@1.4.1/node_modules/rfdc/index.js
  var require_rfdc = __commonJS({
    "node_modules/.pnpm/rfdc@1.4.1/node_modules/rfdc/index.js"(exports, module) {
      "use strict";
      module.exports = rfdc4;
      function copyBuffer(cur) {
        if (cur instanceof Buffer) {
          return Buffer.from(cur);
        }
        return new cur.constructor(cur.buffer.slice(), cur.byteOffset, cur.length);
      }
      function rfdc4(opts) {
        opts = opts || {};
        if (opts.circles) return rfdcCircles(opts);
        const constructorHandlers = /* @__PURE__ */ new Map();
        constructorHandlers.set(Date, (o) => new Date(o));
        constructorHandlers.set(Map, (o, fn) => new Map(cloneArray(Array.from(o), fn)));
        constructorHandlers.set(Set, (o, fn) => new Set(cloneArray(Array.from(o), fn)));
        if (opts.constructorHandlers) {
          for (const handler2 of opts.constructorHandlers) {
            constructorHandlers.set(handler2[0], handler2[1]);
          }
        }
        let handler = null;
        return opts.proto ? cloneProto : clone;
        function cloneArray(a, fn) {
          const keys = Object.keys(a);
          const a2 = new Array(keys.length);
          for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const cur = a[k];
            if (typeof cur !== "object" || cur === null) {
              a2[k] = cur;
            } else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) {
              a2[k] = handler(cur, fn);
            } else if (ArrayBuffer.isView(cur)) {
              a2[k] = copyBuffer(cur);
            } else {
              a2[k] = fn(cur);
            }
          }
          return a2;
        }
        function clone(o) {
          if (typeof o !== "object" || o === null) return o;
          if (Array.isArray(o)) return cloneArray(o, clone);
          if (o.constructor !== Object && (handler = constructorHandlers.get(o.constructor))) {
            return handler(o, clone);
          }
          const o2 = {};
          for (const k in o) {
            if (Object.hasOwnProperty.call(o, k) === false) continue;
            const cur = o[k];
            if (typeof cur !== "object" || cur === null) {
              o2[k] = cur;
            } else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) {
              o2[k] = handler(cur, clone);
            } else if (ArrayBuffer.isView(cur)) {
              o2[k] = copyBuffer(cur);
            } else {
              o2[k] = clone(cur);
            }
          }
          return o2;
        }
        function cloneProto(o) {
          if (typeof o !== "object" || o === null) return o;
          if (Array.isArray(o)) return cloneArray(o, cloneProto);
          if (o.constructor !== Object && (handler = constructorHandlers.get(o.constructor))) {
            return handler(o, cloneProto);
          }
          const o2 = {};
          for (const k in o) {
            const cur = o[k];
            if (typeof cur !== "object" || cur === null) {
              o2[k] = cur;
            } else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) {
              o2[k] = handler(cur, cloneProto);
            } else if (ArrayBuffer.isView(cur)) {
              o2[k] = copyBuffer(cur);
            } else {
              o2[k] = cloneProto(cur);
            }
          }
          return o2;
        }
      }
      function rfdcCircles(opts) {
        const refs = [];
        const refsNew = [];
        const constructorHandlers = /* @__PURE__ */ new Map();
        constructorHandlers.set(Date, (o) => new Date(o));
        constructorHandlers.set(Map, (o, fn) => new Map(cloneArray(Array.from(o), fn)));
        constructorHandlers.set(Set, (o, fn) => new Set(cloneArray(Array.from(o), fn)));
        if (opts.constructorHandlers) {
          for (const handler2 of opts.constructorHandlers) {
            constructorHandlers.set(handler2[0], handler2[1]);
          }
        }
        let handler = null;
        return opts.proto ? cloneProto : clone;
        function cloneArray(a, fn) {
          const keys = Object.keys(a);
          const a2 = new Array(keys.length);
          for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const cur = a[k];
            if (typeof cur !== "object" || cur === null) {
              a2[k] = cur;
            } else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) {
              a2[k] = handler(cur, fn);
            } else if (ArrayBuffer.isView(cur)) {
              a2[k] = copyBuffer(cur);
            } else {
              const index = refs.indexOf(cur);
              if (index !== -1) {
                a2[k] = refsNew[index];
              } else {
                a2[k] = fn(cur);
              }
            }
          }
          return a2;
        }
        function clone(o) {
          if (typeof o !== "object" || o === null) return o;
          if (Array.isArray(o)) return cloneArray(o, clone);
          if (o.constructor !== Object && (handler = constructorHandlers.get(o.constructor))) {
            return handler(o, clone);
          }
          const o2 = {};
          refs.push(o);
          refsNew.push(o2);
          for (const k in o) {
            if (Object.hasOwnProperty.call(o, k) === false) continue;
            const cur = o[k];
            if (typeof cur !== "object" || cur === null) {
              o2[k] = cur;
            } else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) {
              o2[k] = handler(cur, clone);
            } else if (ArrayBuffer.isView(cur)) {
              o2[k] = copyBuffer(cur);
            } else {
              const i = refs.indexOf(cur);
              if (i !== -1) {
                o2[k] = refsNew[i];
              } else {
                o2[k] = clone(cur);
              }
            }
          }
          refs.pop();
          refsNew.pop();
          return o2;
        }
        function cloneProto(o) {
          if (typeof o !== "object" || o === null) return o;
          if (Array.isArray(o)) return cloneArray(o, cloneProto);
          if (o.constructor !== Object && (handler = constructorHandlers.get(o.constructor))) {
            return handler(o, cloneProto);
          }
          const o2 = {};
          refs.push(o);
          refsNew.push(o2);
          for (const k in o) {
            const cur = o[k];
            if (typeof cur !== "object" || cur === null) {
              o2[k] = cur;
            } else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) {
              o2[k] = handler(cur, cloneProto);
            } else if (ArrayBuffer.isView(cur)) {
              o2[k] = copyBuffer(cur);
            } else {
              const i = refs.indexOf(cur);
              if (i !== -1) {
                o2[k] = refsNew[i];
              } else {
                o2[k] = cloneProto(cur);
              }
            }
          }
          refs.pop();
          refsNew.pop();
          return o2;
        }
      }
    }
  });

  // node_modules/.pnpm/universalify@2.0.1/node_modules/universalify/index.js
  var require_universalify = __commonJS({
    "node_modules/.pnpm/universalify@2.0.1/node_modules/universalify/index.js"(exports) {
      "use strict";
      exports.fromCallback = function(fn) {
        return Object.defineProperty(function(...args) {
          if (typeof args[args.length - 1] === "function") fn.apply(this, args);
          else {
            return new Promise((resolve, reject) => {
              args.push((err, res) => err != null ? reject(err) : resolve(res));
              fn.apply(this, args);
            });
          }
        }, "name", { value: fn.name });
      };
      exports.fromPromise = function(fn) {
        return Object.defineProperty(function(...args) {
          const cb = args[args.length - 1];
          if (typeof cb !== "function") return fn.apply(this, args);
          else {
            args.pop();
            fn.apply(this, args).then((r) => cb(null, r), cb);
          }
        }, "name", { value: fn.name });
      };
    }
  });

  // node_modules/.pnpm/jsonfile@6.1.0/node_modules/jsonfile/utils.js
  var require_utils = __commonJS({
    "node_modules/.pnpm/jsonfile@6.1.0/node_modules/jsonfile/utils.js"(exports, module) {
      function stringify(obj, { EOL = "\n", finalEOL = true, replacer = null, spaces } = {}) {
        const EOF = finalEOL ? EOL : "";
        const str = JSON.stringify(obj, replacer, spaces);
        return str.replace(/\n/g, EOL) + EOF;
      }
      function stripBom(content) {
        if (Buffer.isBuffer(content)) content = content.toString("utf8");
        return content.replace(/^\uFEFF/, "");
      }
      module.exports = { stringify, stripBom };
    }
  });

  // node_modules/.pnpm/jsonfile@6.1.0/node_modules/jsonfile/index.js
  var require_jsonfile = __commonJS({
    "node_modules/.pnpm/jsonfile@6.1.0/node_modules/jsonfile/index.js"(exports, module) {
      var _fs;
      try {
        _fs = __require("graceful-fs");
      } catch (_) {
        _fs = __require("fs");
      }
      var universalify = require_universalify();
      var { stringify, stripBom } = require_utils();
      async function _readFile(file, options = {}) {
        if (typeof options === "string") {
          options = { encoding: options };
        }
        const fs = options.fs || _fs;
        const shouldThrow = "throws" in options ? options.throws : true;
        let data = await universalify.fromCallback(fs.readFile)(file, options);
        data = stripBom(data);
        let obj;
        try {
          obj = JSON.parse(data, options ? options.reviver : null);
        } catch (err) {
          if (shouldThrow) {
            err.message = `${file}: ${err.message}`;
            throw err;
          } else {
            return null;
          }
        }
        return obj;
      }
      var readFile = universalify.fromPromise(_readFile);
      function readFileSync(file, options = {}) {
        if (typeof options === "string") {
          options = { encoding: options };
        }
        const fs = options.fs || _fs;
        const shouldThrow = "throws" in options ? options.throws : true;
        try {
          let content = fs.readFileSync(file, options);
          content = stripBom(content);
          return JSON.parse(content, options.reviver);
        } catch (err) {
          if (shouldThrow) {
            err.message = `${file}: ${err.message}`;
            throw err;
          } else {
            return null;
          }
        }
      }
      async function _writeFile(file, obj, options = {}) {
        const fs = options.fs || _fs;
        const str = stringify(obj, options);
        await universalify.fromCallback(fs.writeFile)(file, str, options);
      }
      var writeFile = universalify.fromPromise(_writeFile);
      function writeFileSync(file, obj, options = {}) {
        const fs = options.fs || _fs;
        const str = stringify(obj, options);
        return fs.writeFileSync(file, str, options);
      }
      var jsonfile = {
        readFile,
        readFileSync,
        writeFile,
        writeFileSync
      };
      module.exports = jsonfile;
    }
  });

  // src/scale.ts
  var import_rfdc2 = __toESM(require_rfdc());

  // src/utils/object.ts
  var import_rfdc = __toESM(require_rfdc());
  var removeCertainKey = (obj, targetKey, parentKey, effect) => {
    const newObj = {};
    let should_trigger_effect = false;
    if (obj === void 0 || obj === null || Array.isArray(obj)) {
      return obj;
    }
    for (let [k, v] of Object.entries(obj)) {
      switch (typeof v) {
        case "object": {
          const nowParentKey = (0, import_rfdc.default)()(parentKey);
          if (nowParentKey) {
            nowParentKey.currentParentKey = k;
          }
          newObj[k] = removeCertainKey(v, targetKey, nowParentKey, effect);
          break;
        }
        default: {
          if (parentKey === void 0 || parentKey.targetParentKey.includes(parentKey.currentParentKey)) {
            if (targetKey === k) {
              should_trigger_effect = true;
              break;
            }
          }
          newObj[k] = v;
          break;
        }
      }
    }
    if (should_trigger_effect) {
      effect?.(newObj);
    }
    return newObj;
  };
  var modifyCertainKey = (obj, targetKey, parentKey, effect, force = false) => {
    const newObj = Array.isArray(obj) ? [] : {};
    let should_trigger_effect = false;
    if (obj === void 0 || obj === null) {
      return obj;
    }
    if (parentKey) {
      parentKey.parent = obj;
    }
    for (let [k, v] of Object.entries(obj)) {
      switch (typeof v) {
        case "object": {
          const nowParentKey = (0, import_rfdc.default)()(parentKey);
          if (nowParentKey) {
            nowParentKey.parentKeys.push(k);
            nowParentKey.currentParentKey = k;
          }
          let force_to_update = false;
          if (parentKey === void 0 || !parentKey.excludeKeys.includes(parentKey.currentParentKey) && parentKey.brotherEntries.some(([k2, v2]) => parentKey.parent[k2] === v2)) {
            force_to_update = true;
          }
          newObj[k] = modifyCertainKey(v, targetKey, nowParentKey, effect, force || force_to_update);
          break;
        }
        default: {
          if (parentKey === void 0 || !parentKey.excludeKeys.includes(parentKey.currentParentKey) && parentKey.targetParentKey.includes(parentKey.currentParentKey)) {
            if (targetKey === k) {
              should_trigger_effect = true;
            }
          }
          if (parentKey === void 0 || !parentKey.excludeKeys.includes(parentKey.currentParentKey) && parentKey.insideParentKeys.some((key) => !parentKey.excludeKeys.includes(key) && parentKey.parentKeys.includes(key))) {
            if (targetKey === k) {
              should_trigger_effect = true;
            }
          }
          let force_to_update = false;
          if (parentKey === void 0 || !parentKey.excludeKeys.includes(parentKey.currentParentKey) && parentKey.brotherEntries.some(([k2, v2]) => parentKey.parent[k2] === v2)) {
            force_to_update = true;
          }
          if (force || force_to_update) {
            should_trigger_effect = true;
          }
          newObj[k] = v;
          break;
        }
      }
    }
    if (should_trigger_effect) {
      effect?.(newObj);
    }
    return newObj;
  };

  // src/scale.ts
  if (typeof window === "undefined") {
    const jsonfile = require_jsonfile();
    const fs = __require("fs");
    fs.readdirSync("./input").map((fileName) => {
      jsonfile.readFile(`./input/${fileName}`, function(err, obj) {
        if (err) {
          console.error(fileName, err);
        }
        let output = fixScale(obj);
        console.log(fileName, " Done!");
        jsonfile.writeFileSync(`./output/${fileName}`, output);
      });
    });
  }
  var fixScale = (obj, revert = false) => {
    let output = (0, import_rfdc2.default)()(obj);
    const scaleRatio = revert ? 64 : 1 / 64;
    const physicsRatio = revert ? 1 / (30 / 64) : 30 / 64;
    ["x", "y", "z", "width", "height", "depth"].forEach((key) => {
      output = modifyCertainKey(
        output,
        key,
        {
          parentKeys: [],
          currentParentKey: "",
          targetParentKey: ["position", "size"],
          insideParentKeys: ["bodies"],
          excludeKeys: ["z-index", "rotate", "mountRotation"],
          brotherEntries: [["dataType", "region"], ["function", "xyCoordinate"]],
          parent: {}
        },
        (v) => {
          if (typeof v[key] === "number" || typeof v[key] === "string") {
            v[key] = Number(v[key]) * scaleRatio;
          }
        }
      );
    });
    ["default"].forEach((key) => {
      output = modifyCertainKey(
        output,
        key,
        {
          parentKeys: [],
          currentParentKey: "",
          targetParentKey: ["zoom"],
          insideParentKeys: [],
          excludeKeys: [],
          brotherEntries: [],
          parent: {}
        },
        (v) => {
          if (typeof v[key] === "number" || typeof v[key] === "string") {
            v[key] = Number(v[key]) * scaleRatio;
          }
        }
      );
    });
    ["range", "maxAttackRange", "sensorRadius"].forEach((key) => {
      output = modifyCertainKey(
        output,
        key,
        {
          parentKeys: [],
          currentParentKey: "",
          targetParentKey: ["visibilityMask", "ai"],
          insideParentKeys: [],
          excludeKeys: [],
          brotherEntries: [],
          parent: {}
        },
        (v) => {
          if (typeof v[key] === "number" || typeof v[key] === "string") {
            v[key] = Number(v[key]) * scaleRatio;
          }
        }
      );
    });
    ["min", "max", "value"].forEach((key) => {
      output = modifyCertainKey(
        output,
        key,
        {
          parentKeys: [],
          currentParentKey: "",
          targetParentKey: ["speed"],
          insideParentKeys: [],
          excludeKeys: [],
          brotherEntries: [],
          parent: {}
        },
        (v) => {
          if (typeof v[key] === "number" || typeof v[key] === "string") {
            v[key] = Number(v[key]) * physicsRatio;
          }
        }
      );
    });
    return output;
  };

  // src/debris.ts
  var import_rfdc3 = __toESM(require_rfdc());
  if (typeof window === "undefined") {
    const jsonfile = require_jsonfile();
    const fs = __require("fs");
    fs.readdirSync("./input").map((fileName) => {
      jsonfile.readFile(`./input/${fileName}`, function(err, obj) {
        if (err) {
          console.error(fileName, err);
        }
        let output = fixDebris(obj);
        console.log(fileName, " Done!");
        jsonfile.writeFileSync(`./output/${fileName}`, output);
      });
    });
  }
  var fixDebris = (obj) => {
    let output = (0, import_rfdc3.default)()(obj);
    output.banIps = [];
    output.data.map.layers = output.data.map.layers.filter((layer) => layer.type !== "objectgroup");
    output = removeCertainKey(output, "debris", { currentParentKey: "", targetParentKey: ["collidesWith", "destroyOnContactWith"] });
    output = removeCertainKey(output, "debris", { currentParentKey: "", targetParentKey: ["z-index"] }, (obj2) => {
      obj2 = { ...obj2, layer: 0 };
    });
    return output;
  };

  // src/index.ts
  window.fixes = { fixScale, fixDebris };
})();
