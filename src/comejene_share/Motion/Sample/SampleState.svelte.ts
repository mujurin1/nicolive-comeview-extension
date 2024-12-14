import type { CSSObject } from "@emotion/css/create-instance";
import { tick } from "svelte";
import type { ComejeneContent } from "../../type";
import { ComejeneMotionStyle, type ComejeneMotionSetting, type ComejeneMotionState } from "../type";
import { SampleMotionMessage } from "./SampleMotionMessage.svelte";


export type SampleMotionSetting = ComejeneMotionSetting<typeof SampleMotionStyle.root>;
export const SampleMotionStyle = ComejeneMotionStyle.create(
  {},
  (customCss, _) => {
    const cssObj: CSSObject = {};

    customCss.updateCss("SampleMotionStyle", [cssObj]);
  }
);


export class SampleMotionState implements ComejeneMotionState<
  SampleMotionSetting,
  SampleMotionMessage
> {
  public setting = $state<SampleMotionSetting>(null!);
  public messages = $state<SampleMotionMessage[]>([]);

  constructor(
    setting: SampleMotionSetting,
  ) {
    this.setting = setting;
  }

  onMount() {
    return () => { };
  }

  public async resetMotionLayout(setting: SampleMotionSetting) {
    this.setting = setting;
    await this.resetLayout();
  }

  public async resetLayout() { }

  public async addMessage(content: ComejeneContent) {
    const message = new SampleMotionMessage(content);
    this.messages.push(message);
    // await tick するまでは message.node は生成されない
    await tick();
  }
}
