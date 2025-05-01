import type { ComejeneTemplate } from "../comejene_edit/Template/ComejeneTemplate";
import { DefaultComejeneFrames, DefaultComejeneTemplates } from "../comejene_edit/Template/Defaults";
import type { ComejeneMessageFrame } from "../comejene_share/Message";
import { storages } from "../lib/Storage";
import { isNullOrEmptyObject, type DeepReadonly } from "../util/utils";

export interface ComejeneTemplateSorage {
  useTemplateId: string;
  templates: Record<string, ComejeneTemplate>;
  frames: Record<string, ComejeneMessageFrame>;
}

const DefaultComejeneTemplateState: DeepReadonly<ComejeneTemplateSorage> = Object.freeze({
  useTemplateId: Object.keys(DefaultComejeneTemplates)[1],
  templates: DefaultComejeneTemplates,
  frames: {
    "I-{N_/C}": DefaultComejeneFrames["I-{N_/C}"](),
    "I-N-C": DefaultComejeneFrames["I-N-C"](),
  },
});

export interface IComejeneTemplateStore {
  readonly state: DeepReadonly<ComejeneTemplateSorage>;
  // readonly state: ComejeneState;

  save(): Promise<void>;

  getTemplate(templateId: string): DeepReadonly<ComejeneTemplate>;
  getUseTemplate(): DeepReadonly<ComejeneTemplate>;
  setUseTemplateId(templateId: string): void;
}

export const ComejeneTemplateStore: IComejeneTemplateStore = (() => {
  const state = $state<ComejeneTemplateSorage>({
    useTemplateId: Object.keys(DefaultComejeneTemplates)[1],
    frames: {},
    templates: {},
  });

  const externalStoreController = storages.chromeExtentionStorage.addUse(
    "comejene-template",
    {
      onUpdated: (data: Partial<ComejeneTemplateSorage>, type) => {
        // MEMO: useTemplateId は初期読み込み時の見れば良いが常にチェック
        if (isNullOrEmptyObject(data.frames)) state.frames = data.frames;
        if (isNullOrEmptyObject(data.templates)) state.templates = data.templates;
        if (data.useTemplateId != null) state.useTemplateId = data.useTemplateId;

        // 新しいデータが壊れていた場合の対策
        if (ComejeneTemplateStore.getUseTemplate() == null) {
          state.useTemplateId = Object.keys(state.templates)[1];
        }
      },
      onRemoved: (keys) => {
        // 削除はあり得ない
      },
    });

  return {
    state,
    save: async () => {
      await externalStoreController.update($state.snapshot(state));
    },
    getTemplate: (templateId: string) => {
      return state.templates[templateId]
        ?? DefaultComejeneTemplateState.templates[templateId];
    },
    getUseTemplate: () => {
      return ComejeneTemplateStore.getTemplate(state.useTemplateId);
    },
    setUseTemplateId: (templateId: string) => {
      if (
        state.templates[templateId] == null &&
        DefaultComejeneTemplateState.templates[templateId] == null
      ) return;
      state.useTemplateId = templateId;
      // void ComejeneTemplateStore.save();
    },
  };
})();
