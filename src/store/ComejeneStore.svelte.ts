import { storages } from "../lib/Storage";
import { safeOverwrite, type DeepReadonly } from "../utils";



export interface ComejeneState {

}

const ComejeneStateDefault: DeepReadonly<ComejeneState> = {

};

export interface ComejeneStore {
  readonly state: DeepReadonly<ComejeneState>;

  save(): Promise<void>;
}

export const ComejeneStore: ComejeneStore = (() => {
  const state = $state(structuredClone(ComejeneStateDefault) as ComejeneState);

  const externalStoreController = storages.chromeExtentionStorage.addUse(
    "comejene",
    {
      onUpdated: (data: Partial<ComejeneState>, type) => {
        // if (type === "change") unsetNotChangeProperty(data);
        safeOverwrite(state, data);
      },
      onRemoved: (keys) => {

      },
    });

  return {
    get state() { return state; },
    save: async () => {
      await externalStoreController.update($state.snapshot(state));
    },
  };
})();
