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
      let output = fixScale(obj);

      console.log(fileName, ' Done!');
      jsonfile.writeFileSync(`./output/${fileName}`, output);
    });
  })

}

export const fixScale = (obj: AnyObj, revert = false) => {
  let output = rfdc()(obj);

  ['linearDamping'].forEach(key => {
    output = modifyCertainKey(output, key,
      {
        parentKeys: [],
        currentParentKey: '',
        targetParentKey: [],
        insideParentKeys: ['bodies'],
        excludeKeys: [],
        brotherEntries: [],
        parent: {}
      }, (v) => {
        if (typeof v[key] === 'number' || typeof v[key] === 'string') {
          const value = Number(v[key]);
          v[key] = { x: value, y: value, z: 0 }
        }
      });
  });

   ['angularDamping'].forEach(key => {
    output = modifyCertainKey(output, key,
      {
        parentKeys: [],
        currentParentKey: '',
        targetParentKey: [],
        insideParentKeys: ['bodies'],
        excludeKeys: [],
        brotherEntries: [],
        parent: {}
      }, (v) => {
        if (typeof v[key] === 'number' || typeof v[key] === 'string') {
          const value = Number(v[key]);
          v[key] = { x: value, y: value, z: value }
        }
      });
  });

  return output;
}
