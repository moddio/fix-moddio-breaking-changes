import rfdc from 'rfdc'
import { removeCertainKey } from './utils/object';

if (typeof window === 'undefined') {
  const jsonfile = require('jsonfile')
  const fs = require('fs')
  fs.readdirSync('./input').map((fileName: any) => {
    jsonfile.readFile(`./input/${fileName}`, function (err: any, obj: Record<string, any>) {
      if (err) {
        console.error(fileName, err);
      }
      let output = fixDebris(obj);
      console.log(fileName, ' Done!');
      jsonfile.writeFileSync(`./output/${fileName}`, output);
    });
  })

}

export const fixDebris = (obj: any) => {
  let output = rfdc()(obj);
  output.banIps = []
  output.data.map.layers = (output.data.map.layers as Array<any>).filter(layer => layer.type !== 'objectgroup');
  output = removeCertainKey(output, 'debris', { currentParentKey: '', targetParentKey: ['collidesWith', 'destroyOnContactWith'] });
  output = removeCertainKey(output, 'debris', { currentParentKey: '', targetParentKey: ['z-index'] }, (obj) => { obj = { ...obj, layer: 0 } });
  return output
}

