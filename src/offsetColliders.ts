import { AnyObj, modifyCertainKey } from "./utils/object";

export const offsetColliders = (obj: AnyObj, revert = false) => {
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
        for (let [bodyKey, body] of Object.entries(obj)) {
          for (let [k, v] of Object.entries(body)) {
            body.fixtures.forEach((fixture: any) => {
              const depth = body.depth ?? 0;
              const fixtureDepth = fixture.size.z ?? 0;
              const hz = (fixture.fitRendering ? depth : fixtureDepth) / 2
              fixture.offset.z = hz;
            });
          }
        }
      }
    );
  });

  return output;
};
