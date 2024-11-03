import { notifierStore } from "../lib/CustomStore.svelte";
import { SettingStore, type SettingState } from "../store/SettingStore.svelte";
import type { DeepMutable } from "../utils";
import type Additional from "./Additional.svelte";
import type Setting from "./setting/Setting.svelte";

let additionalPage: ReturnType<typeof Additional>;
export const additional = {
  set page(page: typeof additionalPage) { additionalPage = page; },
  get page() { return additionalPage; },
} as const;

let settingPage: ReturnType<typeof Setting>;
export const setting = {
  set page(page: typeof settingPage) { settingPage = page; },
  get page() { return settingPage; },
} as const;


export const settingViewStore = notifierStore(
  SettingStore.state as DeepMutable<SettingState>,
  () => {
    void SettingStore.save();
  }
);