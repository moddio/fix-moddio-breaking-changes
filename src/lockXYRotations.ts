import { AnyObj, modifyCertainKey } from "./utils/object";

export const lockXYRotations = (obj: AnyObj, revert = false) => {
  let output = obj;

  ["bodies"].forEach((key) => {
    output = modifyCertainKey(
      output,
      key,
      {
        parentKeys: [],
        currentParentKey: "",
        targetParentKey: [],
        insideParentKeys: [],
        excludeKeys: [],
        brotherEntries: [],
        parent: {},
      },
      (obj) => {
        for (let [_, body] of Object.entries(obj)) {
          if (!body.fixed) {
            body.fixed = {
              rx: false,
              ry: false,
              rz: false,
            };
          }

          body.fixed.rx = true;
          body.fixed.ry = true;
        }
      }
    );
  });

  return output;
};
