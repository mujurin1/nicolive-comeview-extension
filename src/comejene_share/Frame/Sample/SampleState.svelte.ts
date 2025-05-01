import type { CSSObject } from "@emotion/css/create-instance";
import { tick } from "svelte";
import type { ComejeneContent } from "../../type";
import { ComejeneFrameStyle, type ComejeneFrameSetting, type ComejeneFrameState } from "../type";
import { SampleMessage } from "./SampleMessage.svelte";


export type SampleFrameSetting = ComejeneFrameSetting<typeof SampleFrameStyle.root>;
export const SampleFrameStyle = ComejeneFrameStyle.create(
  {},
  (customCss, _) => {
    const cssObj: CSSObject = {};

    customCss.updateCss("SampleFrameStyle", [cssObj]);
  }
);


export class SampleFrameState implements ComejeneFrameState<
  SampleFrameSetting,
  SampleMessage
> {
  public setting = $state<SampleFrameSetting>(null!);
  public messages = $state<SampleMessage[]>([]);

  constructor(
    setting: SampleFrameSetting,
  ) {
    this.setting = setting;
  }

  onMount() {
    return () => { };
  }

  public async resetFrameLayout(setting: SampleFrameSetting) {
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
