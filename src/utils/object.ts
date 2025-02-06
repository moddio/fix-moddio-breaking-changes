import rfdc from "rfdc";

export type AnyObj = Record<string, any>

export const removeCertainKey = (obj: AnyObj, targetKey: string, parentKey?: { currentParentKey: string, targetParentKey: string[] }, effect?: (obj: AnyObj) => void): AnyObj => {
  const newObj: AnyObj = {}
  let should_trigger_effect = false;
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
        newObj[k] = removeCertainKey(v, targetKey, nowParentKey, effect)
        break;
      }

      default: {
        if (parentKey === undefined || parentKey.targetParentKey.includes(parentKey.currentParentKey)) {
          if (targetKey === k) {
            should_trigger_effect = true;
            break;
          }
        }

        newObj[k] = v;
        break;
      }
    }
  }
  if (should_trigger_effect) {
    effect?.(newObj);
  }
  return newObj;
}

export const modifyCertainKey = (obj: AnyObj,
  targetKey: string,
  parentKey?: {
    parentKeys: string[],
    currentParentKey: string,
    targetParentKey: string[],
    insideParentKeys: string[],
    excludeKeys: string[],
    brotherEntries: [string, any][],
    parent: AnyObj,
  },
  effect?: (obj: AnyObj) => void,
  force = false
): AnyObj => {
  const newObj: AnyObj = Array.isArray(obj) ? [] : {}
  let should_trigger_effect = false;
  if (obj === undefined || obj === null) {
    return obj;
  }

  if (parentKey) {
    parentKey.parent = obj;
  }

  for (let [k, v] of Object.entries(obj)) {
    switch (typeof v) {
      case 'object': {
        const nowParentKey = rfdc()(parentKey);
        if (nowParentKey) {
          nowParentKey.parentKeys.push(k);
          nowParentKey.currentParentKey = k;
        }
        let force_to_update = false;

        if (parentKey === undefined || (!parentKey.excludeKeys.includes(parentKey.currentParentKey) && parentKey.brotherEntries.some(([k, v]) => parentKey.parent[k] === v))) {
          force_to_update = true;
        }

        newObj[k] = modifyCertainKey(v, targetKey, nowParentKey, effect, force || force_to_update)
        break;
      }

      default: {
        if (parentKey === undefined || (!parentKey.excludeKeys.includes(parentKey.currentParentKey) && parentKey.targetParentKey.includes(parentKey.currentParentKey))) {
          if (targetKey === k) {
            should_trigger_effect = true;
          }
        }

        if (parentKey === undefined || (!parentKey.excludeKeys.includes(parentKey.currentParentKey) && parentKey.insideParentKeys.some(key => !parentKey.excludeKeys.includes(key) && parentKey.parentKeys.includes(key)))) {
          if (targetKey === k) {
            should_trigger_effect = true;
          }
        }

        let force_to_update = false
        if (parentKey === undefined || (!parentKey.excludeKeys.includes(parentKey.currentParentKey) && parentKey.brotherEntries.some(([k, v]) => parentKey.parent[k] === v))) {
          force_to_update = true;
        }

        if (force || force_to_update) {
          should_trigger_effect = true;
        }

        newObj[k] = v;
        break;
      }
    }
  }
  if (should_trigger_effect) {
    effect?.(newObj);
  }
  return newObj;
}