export * from "./Interface";
export * from "./Sample/SampleMotion.svelte";
export * from "./Sample/SampleMotionMessage.svelte";
export * from "./Sample/SampleState.svelte";
export * from "./Stack/StackMotion.svelte";
export * from "./Stack/StackMotionMessage.svelte";
export * from "./Stack/StackState.svelte";


import type { Component } from "svelte";
import type { MotionSetting, MotionState } from "./Interface";
import SampleMotion from "./Sample/SampleMotion.svelte";
import { SampleMotionSettingStyle } from "./Sample/SampleState.svelte";
import StackMotion from "./Stack/StackMotion.svelte";
import { StackMotionSettingStyle } from "./Stack/StackState.svelte";

export const MotionDefinitions = {
  sample: {
    name: "sample",
    component: SampleMotion,
    css: SampleMotionSettingStyle,
  },
  stack: {
    name: "stack",
    component: StackMotion,
    css: StackMotionSettingStyle,
  },
} as const;

export type MotionNames = "sample" | "stack";

export interface MotionDefinition<Name extends MotionNames> {
  name: Name;
  component: typeof MotionDefinitions[Name]["component"];
  css: typeof MotionDefinitions[Name]["css"];
}

export type MotionComponent<
  Setting extends MotionSetting = MotionSetting,
  State extends MotionState = MotionState<Setting>,
> = Component<
  {
    setting: Setting;
  },
  {
    state: State;
  },
  ""
>;
