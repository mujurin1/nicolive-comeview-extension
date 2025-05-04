import type { ComejeneStyle } from "../../comejene_share/Message";
import type { ComejeneMotionNames, ComejeneMotionSettings } from "../../comejene_share/Motion";

export interface ComejeneTemplate<Name extends ComejeneMotionNames = ComejeneMotionNames> {
  name: string;
  motion: {
    name: Name;
    setting: ComejeneMotionSettings<Name>;
  };
  style: ComejeneStyle;
}
