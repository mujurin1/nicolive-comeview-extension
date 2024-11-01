export * from "./OBS";
export * from "./type";


import { ComejeneEnv_BrowserEx } from "./BrowserEx";
import { ComejeneEnv_OBS } from "./OBS";

export type ComejeneEnvTypes = keyof typeof comejeneEnvs;
export const comejeneEnvs = {
  obs: ComejeneEnv_OBS,
  browserEx: ComejeneEnv_BrowserEx,
} as const;


export function checkComejeneEnvType(): ComejeneEnvTypes {
  if ("obsstudio" in window) return "obs";

  return "browserEx";
}
