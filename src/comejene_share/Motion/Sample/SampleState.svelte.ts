import type { CSSObject } from "@emotion/css/create-instance";
import { tick } from "svelte";
import type { ComejeneContent } from "../../Message/ContentType";
import { ComejeneMotionStyle, type ComejeneMotionSetting, type ComejeneMotionState } from "../type";
import { SampleMessage } from "./SampleMessage.svelte";


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
  SampleMessage
> {
  public setting = $state<SampleMotionSetting>(null!);
  public messages = $state<SampleMessage[]>([]);

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
    const message = new SampleMessage(content);
    this.messages.push(message);
    // await tick するまでは message.node は生成されない
    await tick();
  }
}
