import { ComejeneTemplates, type ComejeneTemplate } from "../comejene_edit/Template/ComejeneTemplate";
import { ComejeneTemplates_MessageContainer } from "../comejene_edit/Template/ComejeneTemplates_MessageContainer";
import type { ComejeneMessageFrame } from "../comejene_share/Message";
import { storages } from "../lib/Storage";
import type { DeepReadonly } from "../utils";



export interface ComejeneState {
  useTemplateId: string;
  templates: Record<string, ComejeneTemplate>;
  frames: Record<string, ComejeneMessageFrame>;
}

const ComejeneStateDefault: DeepReadonly<ComejeneState> = {
  useTemplateId: Object.keys(ComejeneTemplates)[0],
  templates: ComejeneTemplates,
  frames: {
    "I-{N_/C}": ComejeneTemplates_MessageContainer["I-{N_/C}"](),
    "I-N-C": ComejeneTemplates_MessageContainer["I-N-C"](),
  },
};

export interface ComejeneStore {
  // readonly state: DeepReadonly<ComejeneState>;
  readonly state: ComejeneState;

  save(): Promise<void>;
}

export const ComejeneStore: ComejeneStore = (() => {
  const state = $state(structuredClone(ComejeneStateDefault) as ComejeneState);

  const externalStoreController = storages.chromeExtentionStorage.addUse(
    "comejene",
    {
      onUpdated: (data: Partial<ComejeneState>, type) => {
        if (type === "load") {
          // 初期読み込み時のみ変更する値
          if (data.useTemplateId != null) state.useTemplateId = data.useTemplateId;
        }
        if (data.frames != null) state.frames = data.frames;
        if (data.templates != null) state.templates = data.templates;

        if (state.templates[state.useTemplateId] == null) {
          state.useTemplateId = Object.keys(state.templates)[0];
        }
      },
      onRemoved: (keys) => {
        // 削除はあり得ない
      },
    });

  return {
    get state() { return state; },
    save: async () => {
      await externalStoreController.update($state.snapshot(state));
    },
  };
})();
