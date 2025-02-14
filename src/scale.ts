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
  const scaleRatio = revert ? 64 : 1 / 64;
  const physicsRatio = revert ? 1 / (30 / 64) : 30 / 64;

  ['x', 'y', 'z', 'width', 'height', 'depth'].forEach(key => {
    output = modifyCertainKey(output, key,
      {
        parentKeys: [],
        currentParentKey: '',
        targetParentKey: ['position', 'size'],
        insideParentKeys: ['bodies'],
        excludeKeys: ['z-index', 'rotate', 'mountRotation'],
        brotherEntries: [["dataType", "region"], ["function", "xyCoordinate"]],
        parent: {}
      }, (v) => {
        if (typeof v[key] === 'number' || typeof v[key] === 'string') {
          v[key] = Number(v[key]) * scaleRatio
        }
      });
  });

  ['default'].forEach(key => {
    output = modifyCertainKey(output, key,
      {
        parentKeys: [],
        currentParentKey: '',
        targetParentKey: ['zoom'],
        insideParentKeys: [],
        excludeKeys: [],
        brotherEntries: [],
        parent: {}
      }, (v) => {
        if (typeof v[key] === 'number' || typeof v[key] === 'string') {
          v[key] = Number(v[key]) * scaleRatio
        }
      });
  });

  ['range', 'maxAttackRange', 'sensorRadius'].forEach(key => {
    output = modifyCertainKey(output, key,
      {
        parentKeys: [],
        currentParentKey: '',
        targetParentKey: ['visibilityMask', 'ai'],
        insideParentKeys: [],
        excludeKeys: [],
        brotherEntries: [],
        parent: {}
      }, (v) => {
        if (typeof v[key] === 'number' || typeof v[key] === 'string') {
          v[key] = Number(v[key]) * scaleRatio
        }
      });
  });

  ['min', 'max', 'value'].forEach(key => {
    output = modifyCertainKey(output, key,
      {
        parentKeys: [],
        currentParentKey: '',
        targetParentKey: ['speed'],
        insideParentKeys: [],
        excludeKeys: [],
        brotherEntries: [],
        parent: {}
      }, (v) => {
        if (typeof v[key] === 'number' || typeof v[key] === 'string') {
          v[key] = Number(v[key]) * physicsRatio
        }
      });
  });

  return output;
}
