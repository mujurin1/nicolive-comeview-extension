import type { ComejeneFrameNames, ComejeneFrameSettings } from "../../comejene_share/Frame";
import type { ComejeneStyle } from "../../comejene_share/Message";

export interface ComejeneTemplate<Name extends ComejeneFrameNames = ComejeneFrameNames> {
  name: string;
  frame: {
    name: Name;
    setting: ComejeneFrameSettings<Name>;
  };
  style: ComejeneStyle;
}
