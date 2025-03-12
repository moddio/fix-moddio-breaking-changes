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
        for (let [_, body] of Object.entries(obj)) {
          console.log(body.fixed);
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
