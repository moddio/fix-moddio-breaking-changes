import rfdc from 'rfdc'
import { AnyObj, modifyCertainKey } from './utils/object';

export const fixFixture = (obj: AnyObj) => {
  let output = obj;

  // Remove old unused physics body objects from unitTypes
  ['unitTypes'].forEach(key => {
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
        for (let [_, body] of Object.entries(obj)) {
          let hasBody = false;

          for (let [key, _] of Object.entries(body)) {
            if (key === 'body') {
              hasBody = true;
              break;
            }
          }

          if (hasBody) {
            delete body['body'];
          }
        }
      });
  });

  // Convert physics bodies from v2 to v3
  ['bodies', 'bodyTypes'].forEach(key => {
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
          const width = +(body.width ?? 0.625);
          const height = +(body.height ?? 0.625);
          const depth = +(body.depth ?? 0.625);

          delete body.width;
          delete body.height;
          delete body.depth;

          if (!body.fixtures)
            continue;

          const newFixtures: any[] = rfdc()(body.fixtures);

          newFixtures.forEach((fixture: any, idx) => {
            fixture.size = { x: width, y: height, z: depth };
            fixture.offset = { x: 0, y: 0, z: 0 };

            if (fixture.shape?.type) {
              fixture.type = fixture.shape.type;
              delete fixture.shape;
            }
          });

          const newObj: any = {};
          for (let [k, v] of Object.entries(body)) {
            if (['collidesWith'].includes(k)) {
              newFixtures.forEach((fixture: any, idx) => fixture[k] = v );
              delete newObj[k];
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
