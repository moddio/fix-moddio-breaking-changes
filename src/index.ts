import { fixScale } from "./scale";
import { fixDebris } from "./debris";
import { fixFixture } from "./fixture";
import { removeUnwantedProperties } from "./removeUnwantedProperties";

(window as any).fixes = { fixScale, fixDebris, fixFixture, removeUnwantedProperties };