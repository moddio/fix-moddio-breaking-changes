import { AnyObj, modifyCertainKey } from "./utils/object";

export const fixScale = (obj: AnyObj, revert = false) => {
  let output = obj;
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
        brotherEntries: [
          ["dataType", "region"],
          ["function", "xyCoordinate"],
        ],
        parent: {},
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
        parent: {},
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
        parent: {},
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
        parent: {},
      },
      (v) => {
        if (typeof v[key] === "number" || typeof v[key] === "string") {
          v[key] = Number(v[key]) * physicsRatio;
        }
      }
    );
  });

  ["baseSpeed"].forEach((key) => {
    output = modifyCertainKey(
      output,
      key,
      {
        parentKeys: [],
        currentParentKey: "",
        targetParentKey: [],
        insideParentKeys: ["unitTypes"],
        excludeKeys: [],
        brotherEntries: [],
        parent: {},
      },
      (v) => {
        if (typeof v[key] === "number" || typeof v[key] === "string") {
          v[key] = Number(v[key]) * physicsRatio;
        }
      }
    );
  });

  [
    "offsetX",
    "offsetY",
    "height",
    "width",
    "depth",
    "x",
    "y",
    "z",
    "rotation",
  ].forEach((key) => {
    output = modifyCertainKey(
      output,
      key,
      {
        parentKeys: [],
        currentParentKey: "",
        targetParentKey: [
          "damageHitBox",
          "bulletStartPosition",
          "unitAnchor",
          "itemAnchor",
          "selected",
          "dropped",
          "default",
          "unselected",
          "spawnPosition",
          "body",
          "holdPosition",
        ],
        insideParentKeys: [],
        excludeKeys: [],
        brotherEntries: [],
        parent: {},
      },
      (v) => {
        if (typeof v[key] === "number" || typeof v[key] === "string") {
          v[key] = Number(v[key]) * scaleRatio;
        }
      }
    );
  });

  return output;
};
