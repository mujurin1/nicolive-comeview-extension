import { notifierStore } from "../lib/CustomStore.svelte";
import { SettingStore, type SettingState } from "../store/SettingStore.svelte";
import type { DeepMutable } from "../utils";
import type Additional from "./Additional.svelte";
import type Setting from "./setting/Setting.svelte";

let additionalPage: Additional;
export const additional = {
  set page(page: Additional) { additionalPage = page; },
  get page() { return additionalPage; },
} as const;

let settingPage: Setting;
export const setting = {
  set page(page: Setting) { settingPage = page; },
  get page() { return settingPage; },
} as const;


export const settingViewStore = notifierStore(
  SettingStore.state as DeepMutable<SettingState>,
  () => {
    void SettingStore.save();
  }
);