// import { ComejeneTemplates, type ComejeneTemplate } from "../comejene_edit/Template/ComejeneTemplate";
// import type { ComejeneContent } from "../comejene_share";
// import type {
//   ComejeneEnvTypes,
//   ComejeneEvent,
//   ComejeneSender
// } from "../comejene_share/ViewEnvironment";
// import { storageInit } from "../lib/Storage";

// const senders = $state<ComejeneSender[]>([]);
// let selectTemplate = $state<ComejeneTemplate>(ComejeneTemplates.__default__Debug);

// export const ComejeneSenderController = {
//   get selectTemplate(): ComejeneTemplate {
//     return selectTemplate;
//   },
//   set selectTemplate(value) {
//     selectTemplate = value;
//     ComejeneSenderController.sendReset();
//   },
//   get senders(): readonly ComejeneSender[] {
//     return senders;
//   },

//   resetFromStorage: async (): Promise<void> => {
//     await storageInit();
//     ComejeneSenderController.selectTemplate = ComejeneStore.state.templates[ComejeneStore.state.useTemplateId] as ComejeneTemplate;
//   },

//   has: (id: string): boolean => {
//     return senders.find(sender => sender.id === id) != null;
//   },
//   // createAndConnect: <E extends ComejeneEnvTypes>(env: E, options?: ComejeneSenderOption<E>): Promise<boolean> => {
//   //   const sender = ComejeneSenderController.create(env);
//   //   if (options != null) sender.option = options;
//   //   return ComejeneSenderController.connectAt(sender);
//   // },
//   // create: <E extends ComejeneEnvTypes>(env: E): ComejeneSender<E> => {
//   //   const id = nextId++;
//   //   const sender = new comejeneEnvs[env].sender(id);
//   //   senders.push(sender);
//   //   return sender as ComejeneSender<E>;
//   // },

//   addSenderAndConnect: <E extends ComejeneEnvTypes>(sender: ComejeneSender<E>): Promise<boolean> => {
//     ComejeneSenderController.addSender(sender);
//     return ComejeneSenderController.connectAt(sender);
//   },
//   addSender: <E extends ComejeneEnvTypes>(sender: ComejeneSender<E>): void => {
//     senders.push(sender as ComejeneSender);
//   },

//   connect: (): Promise<boolean>[] => {
//     return senders.map(sender => ComejeneSenderController.connectAt(sender));
//   },
//   close: (): Promise<void>[] => {
//     return senders.map(sender => ComejeneSenderController.closeAt(sender));
//   },
//   closeAndDelete: (): Promise<void>[] => {
//     return senders.map(sender => ComejeneSenderController.closeAndDeleteAt(sender));
//   },
//   /** @param lowPriority 低優先度のメッセージか @default false */
//   send: (message: ComejeneEvent, lowPriority = false): void => {
//     for (const sender of senders) ComejeneSenderController.sendAt(sender, message, lowPriority);
//   },
//   sendContent: (content: ComejeneContent): void => {
//     for (const sender of senders) ComejeneSenderController.sendContentAt(sender, content);
//   },
//   sendReset: (): void => {
//     for (const sender of senders) ComejeneSenderController.sendResetAt(sender);
//   },
//   sendMotionSetting: (): void => {
//     for (const sender of senders) ComejeneSenderController.sendMotionSettingAt(sender);
//   },
//   sendComejeneStyle: (): void => {
//     for (const sender of senders) ComejeneSenderController.sendComejeneStyleAt(sender);
//   },

//   connectAt: async (sender: ComejeneSender): Promise<boolean> => {
//     if (!await sender.connect()) return false;
//     return true;
//   },
//   closeAt: async (sender: ComejeneSender): Promise<void> => {
//     return sender?.close();
//   },
//   closeAndDeleteAt: async (sender: ComejeneSender): Promise<void> => {
//     await ComejeneSenderController.closeAt(sender);
//     const index = senders.findIndex(sender => sender.id === sender.id);
//     if (index === -1) return;
//     senders.splice(index, 1);
//   },
//   /** @param lowPriority 低優先度のメッセージか @default false */
//   sendAt: (sender: ComejeneSender, message: ComejeneEvent, lowPriority = false): void => {
//     sender.send(message, lowPriority);
//   },
//   sendResetAt: (sender: ComejeneSender): void => {
//     const { motion: { name, setting }, style } = selectTemplate;
//     sender.resetSenderState();
//     sender.send({
//       type: "comejene-reset",
//       motionName: name,
//       motionSetting: setting,
//       comejeneStyle: style,
//     });
//   },
//   sendContentAt: (sender: ComejeneSender, content: ComejeneContent): void => {
//     sender.send({ type: "content", content });
//   },
//   sendMotionSettingAt: (sender: ComejeneSender): void => {
//     const { motion: { setting } } = selectTemplate;
//     sender.send({ type: "change-motion-setting", motionSetting: setting }, true);
//   },
//   sendComejeneStyleAt: (sender: ComejeneSender): void => {
//     const { style } = selectTemplate;
//     sender.send({ type: "change-style", comejeneStyle: style }, true);
//   },
// } as const;
