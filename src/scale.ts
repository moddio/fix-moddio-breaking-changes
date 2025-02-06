import jsonfile from 'jsonfile'
import fs from 'fs'
import rfdc from 'rfdc'
import { modifyCertainKey } from './utils/object';

fs.readdirSync('./input').map(fileName => {
  jsonfile.readFile(`./input/${fileName}`, function (err, obj: Record<string, any>) {
    if (err) {
      console.error(fileName, err);
    }
    let output = rfdc()(obj);

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
            v[key] = Number(v[key]) / 64
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
            v[key] = Number(v[key]) / 64
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
            v[key] = Number(v[key]) / 64
          }
        });
    });

    console.log(fileName, ' Done!');
    jsonfile.writeFileSync(`./output/${fileName}`, output);
  });
})
