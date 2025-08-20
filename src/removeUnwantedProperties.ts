import { modifyCertainKey, removeCertainKey } from './utils/object';

if (typeof window === "undefined") {
  const jsonfile = require("jsonfile");
  const fs = require("fs");
  fs.readdirSync("./input").map((fileName: any) => {
    jsonfile.readFile(
      `./input/${fileName}`,
      function (err: any, obj: Record<string, any>) {
        if (err) {
          console.error(fileName, err);
        }
        let output = removeUnwantedProperties(obj);

        console.log(fileName, " Done!");
        jsonfile.writeFileSync(`./output/${fileName}`, output);
      }
    );
  });
}

export const removeUnwantedProperties = (obj: any) => {
  let output = obj;
  [
    "destroyedOnCollisionWithWall/unit",
    "fitRendering",
    "projectile", // Renamed from "bullet" to "projectile"
    "explosiveTimer",
    "destroyOnContactWith",
    "damageDelay",
    "handle",
    "isStackable", // Exists in Taro but not used
    "bulletDestroyedOnCollisionWithWall/unitType",
    "hits", // Exists in Taro but not used
    "constantSpeed +DestroyedOnCollisionWithWall/unit",
    "reloadRate",
    "knockbackForce", // Exists in Taro but not used
    "bulletDestroyedOnCollisionWithWall/unitForce",
    "bulletDestroyedOnCollisionWithWall/unitStartPosition",
    "bulletDestroyedOnCollisionWithWall/unitDistance",
    "bulletDestroyedOnCollisionWithWall/unit",
    "penetration", // Exists in Taro but not used
    "destroyTimer",
    "delayBeforeUse",
    "ignoreServerStream",
    "movementType",
    "clientPredictedMovement",
    "price", // Consider if this is needed in unit
    "handle", // In unit
    "constants", // Consider if this is needed
    "currency",
    "allowDuplicateIPS",
    "allowDuplicateIPs", // and "allowDuplicateIPS"
    "clientSidePredictionEnabled", // Global property
    "enableMiniMap",
    "sandboxMode",
    "extrapolation",
    "moreIoGames",
    "allowGuestMode", // Consider if this is needed
    "autoSave", // Consider if this is needed
    "canHostPrivateServers", // Consider if this is needed
    "enableVideoChat", // Consider if this is needed
    "holdPosition",
    "isTangible",
    "isFlying",
    "typeWhenDrop",
    "infinite",
    "nextobjectid",
    "orientation",
    "renderorder",
    "tiledversion",
    "explosiveTimer", // Duplicate entry
    "designatedInventorySlot",
    "knockbackForce", // Duplicate entry
    "handle", // Duplicate entry
    "upperAngle",
    "lowerAngle",
    "buffTypes",
  ].forEach(key => {
    output = removeCertainKey(output, key);
  });
  output = removeCertainKey(output, 'debris', { currentParentKey: '', targetParentKey: ['collidesWith', 'destroyOnContactWith'] });
  // output = removeCertainKey(output, 'controls', undefined, undefined, { onlyRemovedWhenNullOrUndefined: true });
  // Convert physics bodies from v2 to v3
  ['scripts'].forEach(key => {
    output = modifyCertainKey(output, key,
      {
        parentKeys: [],
        currentParentKey: '',
        targetParentKey: [],
        insideParentKeys: [],
        excludeKeys: [],
        brotherEntries: [],
        parent: {}
      }, (o) => {
        Object.values(o).forEach((obj) => {

          delete obj.conditions;
          if (obj.moddScript && obj.moddScript !== '') {
            delete obj.actions;
          }
        })
        // console.log(obj)
      });
  });

  ['body'].forEach(key => {
    output = modifyCertainKey(output, key,
      {
        parentKeys: [],
        currentParentKey: '',
        targetParentKey: [],
        insideParentKeys: [],
        excludeKeys: [],
        brotherEntries: [],
        parent: {}
      }, (o) => {
        Object.values(o).forEach((obj) => {

          delete obj.conditions;
          if (obj.moddScript && obj.moddScript !== '') {
            delete obj.actions;
          }
        })
        // console.log(obj)
      });
  });

  ['unitTypes', 'propTypes', 'itemTypes', 'projectileTypes'].forEach(key => {
    output = modifyCertainKey(output, key,
      {
        parentKeys: [],
        currentParentKey: '',
        targetParentKey: [],
        insideParentKeys: [],
        excludeKeys: [],
        brotherEntries: [],
        parent: {}
      }, (o) => {
        Object.values(o).forEach((obj) => {
          if (obj.controls === null) {
            delete obj.controls;
          }
          if (typeof obj.body === 'object') {
            delete obj.body;
          }
        })
        // console.log(obj)
      });
  });

  ['bodyTypes', 'bodies'].forEach(key => {
    output = modifyCertainKey(output, key,
      {
        parentKeys: [],
        currentParentKey: '',
        targetParentKey: [],
        insideParentKeys: [],
        excludeKeys: [],
        brotherEntries: [],
        parent: {}
      }, (o) => {
        Object.values(o).forEach((obj) => {
          ["linearDamping", "angularDamping"].forEach((k) => {
            if (typeof obj[k] === 'number') {
              const v = obj[k];
              obj[k] = { x: v, y: v, z: v }
            }
          })
        })
        // console.log(obj)
      });
  });
  output.engineVersion = '3.0.12'
  return output
}
