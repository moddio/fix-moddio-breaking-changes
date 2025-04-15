import { fixDebris } from "./debris";
import { fixScale } from "./scale";
import { fixFixture } from "./fixture";
import { fixDamping } from "./damping";
import { lockXYRotations } from './lockXYRotations';
import { offsetColliders } from "offsetColliders";

if (typeof window === 'undefined') {
  const jsonfile = require('jsonfile')
  const fs = require('fs')
  fs.readdirSync('./input').map((fileName: any) => {
    jsonfile.readFile(`./input/${fileName}`, function (err: any, obj: Record<string, any>) {

      if (err) {
        console.error(fileName, err);
      }

      let output = obj;

      // Order matters
      output = fixDebris(output);
      output = fixScale(output);
      output = fixFixture(output);
      output = fixDamping(output);
      output = lockXYRotations(output);
      output = offsetColliders(output);

      // output.worldId = "";
      output.engineVersion = "3.0.8";
      output.clientPhysicsEngine = "rapier2d";
      output.physicsEngine = "rapier2d";
      // output.clientSidePredictionEnabled = false;
      // output.data.settings.gravity = { x: 0, y: 0, z: -9.81 };
      const physicsScale = 1 / 64;
      output.data.settings.gravity.x = (output.data.settings.gravity.x ?? 0) * physicsScale;
      output.data.settings.gravity.y = (output.data.settings.gravity.y ?? 0) * physicsScale;
      output.data.settings.gravity.z = (output.data.settings.gravity.z ?? 0) * physicsScale;

      jsonfile.writeFileSync(`./output/${fileName}`, output);

      console.log(fileName, ' Done!');
    });
  })
}
