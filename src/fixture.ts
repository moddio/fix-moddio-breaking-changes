import rfdc from 'rfdc'
import { AnyObj, modifyCertainKey } from './utils/object';

if (typeof window === 'undefined') {
  const jsonfile = require('jsonfile')
  const fs = require('fs')
  fs.readdirSync('./input').map((fileName: any) => {
    jsonfile.readFile(`./input/${fileName}`, function (err: any, obj: Record<string, any>) {
      if (err) {
        console.error(fileName, err);
      }
      let output = fixFixture(obj, process.argv[2] === '--moveUpHalfDepth');
      console.log(fileName, ' Done!');
      jsonfile.writeFileSync(`./output/${fileName}`, output);
    });
  })

}

export const fixFixture = (obj: AnyObj, moveUpHalfDepth = false) => {
  let output = rfdc()(obj);
  const keysNeededToMove = ['collidesWith', 'allowSleep', 'bullet'];
  const map = { "width": "x", "height": "y", "depth": "z" };
  ['bodies'].forEach(key => {
    output = modifyCertainKey(output, key,
      {
        parentKeys: [],
        currentParentKey: '',
        targetParentKey: [],
        insideParentKeys: [],
        excludeKeys: [],
        brotherEntries: [],
        parent: {}
      }, (obj) => {
        for (let [bodyKey, body] of Object.entries(obj)) {
          const newFixtures: any[] = rfdc()(body.fixtures);
          const newObj: any = {};
          for (let [k, v] of Object.entries(body)) {
            if (keysNeededToMove.includes(k)) {
              newFixtures.forEach((fixture: any, idx) => {
                if (!fixture.scale) {
                  fixture.scale = {
                    x: 1,
                    y: 1,
                    z: 1,
                  }
                }

                if (!fixture.offset) {
                  fixture.offset = {
                    x: 0,
                    y: 0,
                    z: 0,
                  }
                }

                if (body.fixtures[idx].size === undefined || body.fixtures[idx].size.width === undefined) {
                  fixture.fitRendering = true;
                }

                switch (fixture.shape.type) {
                  case 'rectangle': {
                    if (fixture.size) {
                      ['width', 'height', 'depth'].forEach(key => {
                        if (fixture.size[key]) {
                          fixture.scale[map[key as keyof typeof map]] = Number(fixture.size[key]);
                        }
                      })
                    }
                    break;
                  }
                  case 'circle': {
                    if (fixture.size) {
                      ['width', 'height', 'depth'].forEach(key => {
                        if (fixture.size[key]) {
                          fixture.scale = {
                            x: Number(Math.max(Math.max(fixture.size.width ?? 0, fixture.size.height ?? 0), fixture.size.depth ?? 0)),
                            y: Number(Math.max(Math.max(fixture.size.width ?? 0, fixture.size.height ?? 0), fixture.size.depth ?? 0)),
                            z: Number(Math.max(Math.max(fixture.size.width ?? 0, fixture.size.height ?? 0), fixture.size.depth ?? 0)),
                          };
                        }
                      });
                    }
                    break;
                  }
                  case 'capsule': {
                    // FIXME: now needs to handle the capsule mannually;
                    break;
                  }
                }

                ['size'].forEach(key => {
                  delete fixture[key]
                })

                if (moveUpHalfDepth) {
                  fixture.offset.z = body.fixtures[idx].size?.depth ? body.fixtures[idx].size.depth / 2 : body.depth ? body.depth / 2 : 0;
                }

                fixture[k] = v;
              });
            } else {
              newObj[k] = v;
            }
          }
          newObj.fixtures = newFixtures;
          obj[bodyKey] = newObj;
        }
      });
  });

  return output;
}

export const moveUpHalfDepth = (obj: AnyObj, revert = false) => {
  let output = rfdc()(obj);
  const keysNeededToMove = ['collidesWith', 'allowSleep', 'bullet'];
  const map = { "width": "x", "height": "y", "depth": "z" };
  ['bodies'].forEach(key => {
    output = modifyCertainKey(output, key,
      {
        parentKeys: [],
        currentParentKey: '',
        targetParentKey: [],
        insideParentKeys: [],
        excludeKeys: [],
        brotherEntries: [],
        parent: {}
      }, (obj) => {
        for (let [bodyKey, body] of Object.entries(obj)) {
          const newFixtures: any[] = rfdc()(body.fixtures);
          const newObj: any = {};
          for (let [k, v] of Object.entries(body)) {
            if (keysNeededToMove.includes(k)) {
              newFixtures.forEach((fixture: any, idx) => {
                if (!fixture.scale) {
                  fixture.scale = {
                    x: 1,
                    y: 1,
                    z: 1,
                  }
                }

                if (body.fixtures[idx].size === undefined || body.fixtures[idx].size.width === undefined) {
                  fixture.fitRendering = true;
                }

                switch (fixture.shape.type) {
                  case 'rectangle': {
                    if (fixture.size) {
                      ['width', 'height', 'depth'].forEach(key => {
                        if (fixture.size[key]) {
                          fixture.scale[map[key as keyof typeof map]] = Number(fixture.size[key]);
                        }
                      })
                    }
                    break;
                  }
                  case 'circle': {
                    if (fixture.size) {
                      ['width', 'height', 'depth'].forEach(key => {
                        if (fixture.size[key]) {
                          fixture.scale = {
                            x: Number(Math.max(Math.max(fixture.size.width ?? 0, fixture.size.height ?? 0), fixture.size.depth ?? 0)),
                            y: Number(Math.max(Math.max(fixture.size.width ?? 0, fixture.size.height ?? 0), fixture.size.depth ?? 0)),
                            z: Number(Math.max(Math.max(fixture.size.width ?? 0, fixture.size.height ?? 0), fixture.size.depth ?? 0)),
                          };
                        }
                      });
                    }
                    break;
                  }
                  case 'capsule': {
                    // FIXME: now needs to handle the capsule mannually;
                    break;
                  }
                }

                ['size'].forEach(key => {
                  delete fixture[key]
                })

                fixture[k] = v;
              });
            } else {
              newObj[k] = v;
            }
          }
          newObj.fixtures = newFixtures;
          obj[bodyKey] = newObj;
        }
      });
  });

  return output;
}
