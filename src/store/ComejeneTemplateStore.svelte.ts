import type { ComejeneTemplate } from "../comejene_edit/Template/ComejeneTemplate";
import { DefaultComejeneTemplates, isDefaultComejeneTemplate } from "../comejene_edit/Template/Defaults";
import type { ComejeneMessageFrame } from "../comejene_share/Message";
import { storages } from "../lib/Storage";
import type { DeepReadonly } from "../util/utils";

export interface ComejeneTemplateSorage {
  useTemplateId: string;
  templates: Record<string, ComejeneTemplate>;
  frames: Record<string, ComejeneMessageFrame>;
}

export interface IComejeneTemplateStore {
  readonly state: DeepReadonly<ComejeneTemplateSorage>;

  getTemplate(templateId: string): ComejeneTemplate;
  addTemplate(template: ComejeneTemplate, use: boolean): string;
  removeTemplate(templateId: string): void;

  setUseTemplateId(templateId: string): void;
  getUseTemplate(): ComejeneTemplate;
  updateUseTemplte(template: ComejeneTemplate): void;
}

export const ComejeneTemplateStore: IComejeneTemplateStore = (() => {
  const state = $state<ComejeneTemplateSorage>({
    useTemplateId: Object.keys(DefaultComejeneTemplates)[1],
    frames: {},
    templates: {},
  });

  const externalStoreControllers = {
    frame: storages.chromeExtentionStorage.addUse(
      "comejene-template-frame",
      {
        onUpdated: (data: { [id: string]: ComejeneMessageFrame; }, type) => {
          if (type === "load") {
            const frameId = Object.keys(data)[0];
            if (frameId == null) return;
            state.frames[frameId] = data[frameId];

            fallbackUseTemplateId();
          }
        },
        onRemoved: (keys) => { }, // 削除はあり得ない
      }),
    templates: storages.chromeExtentionStorage.addUse(
      "comejene-template-templates",
      {
        onUpdated: (data: { [id: string]: ComejeneTemplate; }, type) => {
          if (type === "load") {
            const templateId = Object.keys(data)[0];
            if (templateId == null) return;
            state.templates[templateId] = data[templateId];

            fallbackUseTemplateId();
          }
        },
        onRemoved: (keys) => { }, // 削除はあり得ない
      }),
    useId: storages.chromeExtentionStorage.addUse(
      "comejene-template-use-id",
      {
        onUpdated: (data: { id: string; }, type) => {
          if (type === "load") {
            state.useTemplateId = data.id;
            fallbackUseTemplateId();
          }
        },
        onRemoved: (keys) => { }, // 削除はあり得ない
      }),
  } as const;

  return {
    state,
    // save: async (templateId) => {
    //   const template = state.templates[templateId];
    //   if (template == null) return;
    //   await externalStoreController.update({ [templateId]: template });
    // },

    getTemplate: (templateId) => {
      return state.templates[templateId] ?? DefaultComejeneTemplates[templateId as keyof typeof DefaultComejeneTemplates];
    },
    addTemplate: (template, use): string => {
      const id = crypto.randomUUID();
      state.templates[id] = template;
      void saveTemplate(id);

      if (use) {
        state.useTemplateId = id;
        void saveUse();
      }
      return id;
    },
    removeTemplate: (templateId) => {
      if (state.templates[templateId] == null) return;
      if (state.useTemplateId === templateId) {
        state.useTemplateId = Object.keys(DefaultComejeneTemplates)[1];
        void saveUse();
      }

      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete state.templates[templateId];
      void removeTemplate(templateId);
    },

    setUseTemplateId: (templateId) => {
      if (
        isDefaultComejeneTemplate(templateId) == null
      ) return;
      state.useTemplateId = templateId;
      void saveUse();
    },
    getUseTemplate: () => {
      return ComejeneTemplateStore.getTemplate(state.useTemplateId);
    },
    updateUseTemplte: (template) => {
      state.templates[state.useTemplateId] = $state.snapshot(template);
      void saveTemplate(state.useTemplateId);
    },
  };

  function saveFrame(frameId: string): Promise<void> {
    return externalStoreControllers.frame.update({ [frameId]: $state.snapshot(state.frames[frameId]) });
  }
  function saveTemplate(templateId: string): Promise<void> {
    return externalStoreControllers.templates.update({ [templateId]: $state.snapshot(state.templates[templateId]) });
  }
  function removeTemplate(templateId: string): Promise<void> {
    return externalStoreControllers.templates.remove([templateId]);
  }
  function saveUse(): Promise<void> {
    return externalStoreControllers.useId.update({ id: $state.snapshot(state.useTemplateId) });
  }

  /** 新しいデータが壊れていた場合の対策 */
  function fallbackUseTemplateId() {
    if (ComejeneTemplateStore.getTemplate(state.useTemplateId) != null) return;

    state.useTemplateId = Object.keys(state.templates)[0] ?? Object.keys(DefaultComejeneTemplates)[1];
  }
})();
