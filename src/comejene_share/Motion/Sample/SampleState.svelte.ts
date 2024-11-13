import type { CSSObject } from "@emotion/css/create-instance";
import { tick } from "svelte";
import type { ReceiveContents } from "../../type";
import { MotionSettingStyle, type MotionSettingModel, type MotionState } from "../Interface";
import { SampleMotionMessage } from "./SampleMotionMessage.svelte";


export type SampleMotionSetting = MotionSettingModel<typeof SampleMotionSettingStyle.definition>;
export const SampleMotionSettingStyle = MotionSettingStyle.create(
  {},
  (customCss, _) => {
    const cssObj: CSSObject = {};

    customCss.updateCss("SampleMotionSettingStyle", [cssObj]);
  }
);


export class SampleMotionState implements MotionState<
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

  public async addMessage(contents: ReceiveContents) {
    const message = new SampleMotionMessage(contents);
    this.messages.push(message);
    // await tick するまでは message.node は生成されない
    await tick();
  }
}
