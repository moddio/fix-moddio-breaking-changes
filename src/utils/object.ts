import rfdc from "rfdc";

export type AnyObj = Record<string, any>

export const removeCertainKey = (obj: AnyObj, targetKey: string, parentKey?: { currentParentKey: string, targetParentKey: string[] }): AnyObj => {
  const newObj: AnyObj = {}
  if (obj === undefined || obj === null || Array.isArray(obj)) {
    return obj;
  }

  for (let [k, v] of Object.entries(obj)) {
    switch (typeof v) {
      case 'object': {
        const nowParentKey = rfdc()(parentKey);
        if (nowParentKey) {
          nowParentKey.currentParentKey = k;
        }
        newObj[k] = removeCertainKey(v, targetKey, nowParentKey)
        break;
      }

      default: {
        if (parentKey === undefined || parentKey.targetParentKey.includes(parentKey.currentParentKey)) {
          if (targetKey === k) {
            break;
          }
        }

        newObj[k] = v;
        break;
      }
    }
  }
  return newObj;
}