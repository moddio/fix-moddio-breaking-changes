import { AnyObj, modifyCertainKey } from './utils/object';

export const fixDamping = (obj: AnyObj, revert = false) => {
  let output = obj;

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
