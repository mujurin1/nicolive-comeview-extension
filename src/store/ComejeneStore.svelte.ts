import { ComejeneTemplates, type ComejeneTemplate } from "../comejene_edit/Template/ComejeneTemplate";
import { ComejeneTemplates_MessageContainer } from "../comejene_edit/Template/ComejeneTemplates_MessageContainer";
import type { ComejeneMessageFrame } from "../comejene_share";
import { storages } from "../lib/Storage";
import type { DeepReadonly } from "../utils";



export interface ComejeneState {
  templates: Record<string, ComejeneTemplate>;
  frames: Record<string, ComejeneMessageFrame>;
}

const ComejeneStateDefault: DeepReadonly<ComejeneState> = {
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
        // safeOverwrite(state, data);
        // たぶんこれで良いはず
        if (data.frames != null) state.frames = data.frames;
        if (data.templates != null) state.templates = data.templates;
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
