import { ComejeneTemplates, type ComejeneTemplate } from "../comejene_edit/Template/ComejeneTemplate";
import type { ComejeneContent } from "../comejene_share";
import {
  comejeneEnvs,
  type ComejeneEnvTypes,
  type ComejeneEvent,
  type ComejeneSender,
  type ComejeneSenderOptions,
  type ComejeneSenderState
} from "../comejene_share/ViewEnvironment";

const senders = $state<ComejeneSender[]>([]);
let nextId = 1;

let temp: () => ComejeneTemplate = () => ComejeneTemplates.$default$Debug;
function getTemplate(): ComejeneTemplate {
  return temp();
}

export interface ComejeneSenderSetting<E extends ComejeneEnvTypes = ComejeneEnvTypes> {
  readonly type: E;
  readonly id: number;
  name: string;
  options: ComejeneSenderOptions<E>;
  readonly state: ComejeneSenderState;
}

export const ComejeneSenderController = {
  _set: (_t: () => ComejeneTemplate) => {
    temp = _t;
  },
  get senders(): ComejeneSenderSetting[] {
    return senders;
  },
  has: (id: number): boolean => {
    return senders.find(sender => sender.id === id) != null;
  },
  createAndConnect: <E extends ComejeneEnvTypes>(env: E, options?: ComejeneSenderOptions<E>): Promise<boolean> => {
    const sender = ComejeneSenderController.create(env);
    if (options != null) sender.options = options;
    return ComejeneSenderController.connectAt(sender);
  },
  create: <E extends ComejeneEnvTypes>(env: E): ComejeneSenderSetting<E> => {
    const id = nextId++;
    const sender = new comejeneEnvs[env].sender(id);
    senders.push(sender);
    return sender as ComejeneSenderSetting<E>;
  },

  connect: (): Promise<boolean>[] => {
    return senders.map(sender => ComejeneSenderController.connectAt(sender));
  },
  close: (): Promise<void>[] => {
    return senders.map(sender => ComejeneSenderController.closeAt(sender));
  },
  closeAndDelete: (): Promise<void>[] => {
    return senders.map(sender => ComejeneSenderController.closeAndDeleteAt(sender));
  },
  /** @param lowPriority 低優先度のメッセージか @default false */
  send: (message: ComejeneEvent, lowPriority = false): void => {
    for (const sender of senders) ComejeneSenderController.sendAt(sender, message, lowPriority);
  },
  sendContent: (content: ComejeneContent): void => {
    for (const sender of senders) ComejeneSenderController.sendContentAt(sender, content);
  },
  sendReset: (): void => {
    for (const sender of senders) ComejeneSenderController.sendResetAt(sender);
  },
  sendMotionSetting: (): void => {
    for (const sender of senders) ComejeneSenderController.sendMotionSettingAt(sender);
  },
  sendComejeneStyle: (): void => {
    for (const sender of senders) ComejeneSenderController.sendComejeneStyleAt(sender);
  },

  connectAt: async (setting: ComejeneSenderSetting): Promise<boolean> => {
    const sender = setting as ComejeneSender;
    if (!await sender.connect()) return false;
    return true;
  },
  closeAt: async (setting: ComejeneSenderSetting): Promise<void> => {
    const sender = setting as ComejeneSender;
    return sender?.close();
  },
  closeAndDeleteAt: async (setting: ComejeneSenderSetting): Promise<void> => {
    const sender = setting as ComejeneSender;
    await ComejeneSenderController.closeAt(sender);
    const index = senders.findIndex(sender => sender.id === setting.id);
    if (index === -1) return;
    senders.splice(index, 1);
  },
  /** @param lowPriority 低優先度のメッセージか @default false */
  sendAt: (setting: ComejeneSenderSetting, message: ComejeneEvent, lowPriority = false): void => {
    (setting as ComejeneSender).send(message, lowPriority);
  },
  sendContentAt: (setting: ComejeneSenderSetting, content: ComejeneContent): void => {
    sendContent(setting as ComejeneSender, content);
  },
  sendResetAt: (setting: ComejeneSenderSetting): void => {
    sendReset(setting as ComejeneSender, getTemplate());
  },
  sendMotionSettingAt: (setting: ComejeneSenderSetting): void => {
    sendMotionSetting(setting as ComejeneSender, getTemplate());
  },
  sendComejeneStyleAt: (setting: ComejeneSenderSetting): void => {
    sendComejeneStyle(setting as ComejeneSender, getTemplate());
  },
} as const;



function sendReset(sender: ComejeneSender, template: ComejeneTemplate) {
  const { motion: { name, setting }, style } = template;
  sender.resetSenderState();
  sender.send({
    type: "comejene-reset",
    motionName: name,
    motionSetting: setting,
    comejeneStyle: style,
  });
}
function sendContent(sender: ComejeneSender, content: ComejeneContent) {
  sender.send({ type: "content", content });
}
function sendMotionSetting(sender: ComejeneSender, template: ComejeneTemplate) {
  const { motion: { setting } } = template;
  sender.send({ type: "change-motion-setting", motionSetting: setting }, true);
}
function sendComejeneStyle(sender: ComejeneSender, template: ComejeneTemplate) {
  const { style } = template;
  sender.send({ type: "change-style", comejeneStyle: style }, true);
}
