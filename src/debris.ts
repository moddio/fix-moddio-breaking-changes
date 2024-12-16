import jsonfile from 'jsonfile'
import fs from 'fs'
import rfdc from 'rfdc'
import { removeCertainKey } from './utils/object';

fs.readdirSync('./input').map(fileName => {
  jsonfile.readFile(`./input/${fileName}`, function (err, obj: Record<string, any>) {
    if (err) {
      console.error(fileName, err);
    }
    let output = rfdc()(obj);
    output.data.map.layers = (output.data.map.layers as Array<any>).filter(layer => layer.type !== 'objectgroup');
    output.banIps = []
    output = removeCertainKey(output, 'debris', { currentParentKey: '', targetParentKey: ['collidesWith', 'destroyOnContactWith'] });
    console.log(fileName, ' Done!');
    jsonfile.writeFileSync(`./output/${fileName}`, output);
  });
})
