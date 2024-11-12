export * from "./Interface";
export * from "./Sample/SampleMotion.svelte";
export * from "./Sample/SampleMotionMessage.svelte";
export * from "./Sample/SampleState.svelte";
export * from "./Stack/StackMotion.svelte";
export * from "./Stack/StackMotionMessage.svelte";
export * from "./Stack/StackState.svelte";


import type { Component } from "svelte";
import type { MotionSettingModel, MotionState } from "./Interface";
import SampleMotion from "./Sample/SampleMotion.svelte";
import { SampleMotionSettingStyle, type SampleMotionSetting } from "./Sample/SampleState.svelte";
import StackMotion from "./Stack/StackMotion.svelte";
import { StackMotionSettingStyle, type StackMotionSetting } from "./Stack/StackState.svelte";

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
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type MotionSettings = {
  sample: SampleMotionSetting,
  stack: StackMotionSetting,
};

export interface MotionDefinition<Name extends MotionNames> {
  name: Name;
  component: typeof MotionDefinitions[Name]["component"];
  css: typeof MotionDefinitions[Name]["css"];
}

export type MotionComponent<
  Setting extends MotionSettingModel = MotionSettingModel,
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
