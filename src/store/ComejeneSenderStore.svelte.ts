import type { ComejeneTemplate } from "../comejene_edit/Template/ComejeneTemplate";
import { getDummyContent } from "../comejene_edit/util/utils";
import type { ComejeneContent } from "../comejene_share";
import type { ComejeneStyle } from "../comejene_share/Message";
import { comejeneEnvs, type ComejeneEnvTypes, type ComejeneEvent, type ComejeneSender, type ComejeneSenderOption } from "../comejene_share/ViewEnvironment";
import { storages } from "../lib/Storage";
import { objectToArray } from "../util/utils";
import { ComejeneTemplateStore } from "./ComejeneTemplateStore.svelte";

type ComejeneSenderStorage = Record<string, ComejeneSenderOption>;

// type Options = Record<string, ComejeneSenderOption>;
type Senders = Record<string, ComejeneSender>;

type OmitIdOption = Omit<ComejeneSenderOption, "id" | "autoConnect"> & { id?: string; };

export interface IComejeneSenderStore {
  // //#region Storage に保存されるデータ
  // readonly options: Readonly<Options>;
  // //#endregion Storage に保存されるデータ

  readonly senders: Readonly<Senders>;

  save(sender: ComejeneSender): Promise<void>;

  // Storage の状態を操作する関数
  /**
   * @param option `id`が指定されていない場合は自動でセットされる
   */
  addSender(option: OmitIdOption): ComejeneSender;
  deleteSender(sender: ComejeneSender): void;

  connect(): void;
  /**
   * @param lowPriority 低優先度のメッセージか @default false
   */
  send(message: ComejeneEvent, lowPriority?: boolean): void;
  sendContent(content: ComejeneContent): void;
  sendReset(sendDummyCount?: number): void;
  sendResetAt(sender: ComejeneSender): void;
  sendFrameSetting(template?: ComejeneTemplate): void;
  sendComejeneStyle(template?: ComejeneTemplate): void;

  sendDummyContent(icon?: string, name?: string, message?: string): void;
}

export const ComejeneSenderStore: IComejeneSenderStore = (() => {
  // const options = $state<Options>({});
  const senders = $state<Senders>({});

  const externalStoreController = storages.chromeExtentionStorage.addUse(
    "comejene-sender",
    {
      onUpdated: (data: Partial<ComejeneSenderStorage>, type) => {
        if (type === "load") {
          for (const key in data) {
            const option = data[key]!;
            const sender = new comejeneEnvs[option.type].sender(option as any);
            senders[sender.id] = sender;
            if (sender.option.autoConnect) {
              void sender.connect();
            }
          }
        }
      },
      onRemoved: (keys) => {
        // TODO: 削除の対応をするかはTODO
        // for (const key of keys) {
        //   // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        //   delete options[key];
        //   // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        //   senders[key].close();
        //   delete senders[key];
        // }
      },
    });

  return {
    senders,

    save: async (sender) => {
      return externalStoreController.update({ [sender.id]: $state.snapshot(sender.option) });

      // TODO: 変更したオプションだけセットすれば良い
      const _options = objectToArray(
        senders,
        (_, sender) => $state.snapshot(sender.option),
      )
        .reduce((acc, option) => {
          if (option.type !== "browserEx") acc[option.id] = option;
          return acc;
        }, {} as ComejeneSenderStorage);

      await externalStoreController.update(_options);
    },

    //#region Sender の状態を操作する関数
    addSender: <T extends ComejeneEnvTypes>(option: OmitIdOption) => {
      option.id ??= crypto.randomUUID();
      const _option = option as ComejeneSenderOption<T>;

      const sender = new comejeneEnvs[_option.type].sender(_option as any);
      senders[sender.id] = sender;

      if (option.type !== "browserEx") {
        void externalStoreController.update({ [sender.id]: _option });
      }

      return sender;
    },
    deleteSender: (sender) => {
      if (sender == null) return;
      void sender.close();

      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete senders[sender.id];

      void externalStoreController.remove([sender.id]);
    },
    //#endregion Sender の状態を操作する関数

    //#region Sender と通信する関数
    connect: (): void => {
      for (const id in senders) {
        const sender = senders[id];
        void sender.connect();
      }
    },
    /** @param lowPriority 低優先度のメッセージか @default false */
    send: (message, lowPriority = false): void => {
      for (const id in senders) {
        const sender = senders[id];
        sender.send(message, lowPriority);
      }
    },
    sendContent: (content): void => {
      for (const id in senders) {
        const sender = senders[id];
        sender.send({ type: "content", content });
      }
    },
    sendReset: (sendDummyCount): void => {
      for (const id in senders) {
        ComejeneSenderStore.sendResetAt(senders[id]);
      }

      if (sendDummyCount != null) {
        for (let i = 0; i < sendDummyCount; i++) {
          ComejeneSenderStore.sendDummyContent();
        }
      }
    },
    sendResetAt: (sender): void => {
      const { frame: { name, setting }, style } = ComejeneTemplateStore.getUseTemplate();
      sender.resetSenderState();
      sender.send({
        type: "reset-all",
        frameName: name,
        frameSetting: setting,
        comejeneStyle: style as ComejeneStyle,
      });
    },
    sendFrameSetting: (template): void => {
      const { frame: { setting } } = template ?? ComejeneTemplateStore.getUseTemplate();
      for (const id in senders) {
        const sender = senders[id];
        sender.send({ type: "reset-frame", frameSetting: setting }, true);
      }
    },
    sendComejeneStyle: (template): void => {
      const { style } = template ?? ComejeneTemplateStore.getUseTemplate();
      for (const id in senders) {
        const sender = senders[id];
        sender.send({ type: "reset-style", comejeneStyle: style as ComejeneStyle }, true);
      }
    },
    //#endregion Sender と通信する関数

    //#region デバッグ・テスト用関数
    sendDummyContent: (
      icon = "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg",
      name = "なまえ",
      message = getDummyContent(),
    ): void => {
      ComejeneSenderStore.sendContent({ icon, name, message, });
    },
    //#endregion デバッグ・テスト用関数
  };
})();
