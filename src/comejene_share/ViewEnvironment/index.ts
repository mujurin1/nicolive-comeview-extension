export * from "./OBS";
export * from "./type";


import type { Template } from "../../comejene_edit/Template/Templates";
import type { ReceiveContents } from "../type";
import { ComejeneEnv_BrowserEx } from "./BrowserEx";
import { ComejeneEnv_OBS } from "./OBS";
import type { ComejeneEvent, ComejeneSender } from "./type";


export type ComejeneEnvTypes = keyof typeof comejeneEnvs;
export const comejeneEnvs = {
  obs: ComejeneEnv_OBS,
  browserEx: ComejeneEnv_BrowserEx,
} as const;

/**
 * 現在の実行環境をチェックする
 * @returns 
 */
export function checkComejeneEnvType(): ComejeneEnvTypes {
  if ("obsstudio" in window) return "obs";
  // TODO: N Air の場合
  return "browserEx";
}

type SenderSets<T extends any[]> = { [K in keyof T]: readonly [ComejeneSender<T[K]>, ...ExcludeNever<[T[K]]>] };

export class ComejeneSenderController {
  public senders = new Set<ComejeneSender>();

  constructor(
    private readonly getTemplate: () => Template,
  ) { }

  public initialize<SenderOptions extends any[]>(senders: SenderSets<SenderOptions>) {
    return Promise.all(
      senders.map(([sender, option]) =>
        this.upsertAndConnect(sender, option)
      )
    );
  }

  public get(name: string): ComejeneSender | undefined {
    for (const sender of this.senders)
      if (sender.name === name) return sender;
    return undefined;
  }

  /**
   * 追加をして初期化も行う
   * @param sender 
   * @param options 
   * @returns 接続に成功したか
   */
  public async upsertAndConnect<SenderOptions>(sender: ComejeneSender<SenderOptions>, ...options: ExcludeNever<[SenderOptions]>): Promise<boolean> {
    this.senders.add(sender);
    if (!await sender.connect(...options)) return false;
    sender.reset();

    const { motion: { name, setting }, style } = this.getTemplate();
    sender.send({
      type: "comejene-reset",
      motionName: name,
      motionSetting: setting,
      messageContent: style,
    });

    return true;
  }

  /**
   * 削除をして後処理も行う
   * @param name 削除するComejeneSender名
   * @returns 
   */
  public deleteAndClose(name: string): boolean {
    const sender = this.get(name);
    if (sender == null) return false;
    sender.close();
    return this.senders.delete(sender);
  }

  public send(message: ComejeneEvent, lowPriority = false) {
    for (const sender of this.senders) {
      sender.send(message, lowPriority);
    }
  }

  public sendComment(contents: ReceiveContents) {
    this.send({
      type: "content",
      contents,
    });
  }

  public sendReset() {
    const { motion: { name, setting }, style } = this.getTemplate();
    for (const sender of this.senders) {
      sender.reset();
    }

    this.send({
      type: "comejene-reset",
      motionName: name,
      motionSetting: setting,
      messageContent: style,
    });
  }

  public sendMotionSetting() {
    const { motion: { setting } } = this.getTemplate();
    this.send({ type: "change-motion-setting", motionSetting: setting }, true);
  }

  public sendMessageContent() {
    const { style } = this.getTemplate();
    this.send({ type: "change-message-content", messageContent: style }, true);
  }
}

type ExcludeNever<T> = T extends [never] ? [] : T;
