import type Main from "./Main.svelte";
import type Setting from "./Setting.svelte";


let mainPage: Main;
export const main = {
  set page(page: Main) { mainPage = page; },
  get page() { return mainPage; },
} as const;

let settingPage: Setting;
export const setting = {
  set page(page: Setting) { settingPage = page; },
  get page() { return settingPage; },
} as const;
