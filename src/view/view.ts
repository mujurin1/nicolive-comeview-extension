import type  Additional from "./Additional.svelte";
import type  Setting from "./setting/Setting.svelte";

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
