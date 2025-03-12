import rfdc from "rfdc";
import { AnyObj, modifyCertainKey } from "./utils/object";

if (typeof window === "undefined") {
  const jsonfile = require("jsonfile");
  const fs = require("fs");
  fs.readdirSync("./input").map((fileName: any) => {
    jsonfile.readFile(
      `./input/${fileName}`,
      function (err: any, obj: Record<string, any>) {
        if (err) {
          console.error(fileName, err);
        }
        let output = offsetColliders(obj);

        console.log(fileName, " Done!");
        jsonfile.writeFileSync(`./output/${fileName}`, output);
      }
    );
  });
}

export const offsetColliders = (obj: AnyObj, revert = false) => {
  let output = rfdc()(obj);

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
              const fixtureDepth = fixture.scale.z ?? 0;
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
