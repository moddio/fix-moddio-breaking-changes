import { removeCertainKey } from './utils/object';

export const fixDebris = (obj: any) => {
  let output = obj;
  output.banIps = []
  output.data.map.layers = (output.data.map.layers as Array<any>).filter(layer => layer.type !== 'objectgroup');
  output = removeCertainKey(output, 'debris', { currentParentKey: '', targetParentKey: ['collidesWith', 'destroyOnContactWith'] });
  output = removeCertainKey(output, 'debris', { currentParentKey: '', targetParentKey: ['z-index'] }, (obj) => { obj = { ...obj, layer: 0 } });
  return output
}
