export * from "./Sample/SampleMotion.svelte";
export * from "./Sample/SampleMotionMessage.svelte";
export * from "./Sample/SampleState.svelte";
export * from "./Stack/StackMotion.svelte";
export * from "./Stack/StackMotionMessage.svelte";
export * from "./Stack/StackState.svelte";
export * from "./type";

import type { Component } from "svelte";
import SampleMotion from "./Sample/SampleMotion.svelte";
import { SampleMotionStyle, type SampleMotionSetting } from "./Sample/SampleState.svelte";
import StackMotion from "./Stack/StackMotion.svelte";
import { StackMotionStyle, type StackMotionSetting } from "./Stack/StackState.svelte";
import type { ComejeneMotionSetting, ComejeneMotionState } from "./type";

export const ComejeneMotionDefinitions = {
  sample: {
    name: "sample",
    component: SampleMotion,
    css: SampleMotionStyle,
  },
  stack: {
    name: "stack",
    component: StackMotion,
    css: StackMotionStyle,
  },
} as const;

export type ComejeneMotionNames = "sample" | "stack";
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ComejeneMotionSettings = {
  sample: SampleMotionSetting,
  stack: StackMotionSetting,
};

export interface ComejeneMotionDefinition<Name extends ComejeneMotionNames> {
  name: Name;
  component: typeof ComejeneMotionDefinitions[Name]["component"];
  css: typeof ComejeneMotionDefinitions[Name]["css"];
}

export type ComejeneMotionComponent<
  Setting extends ComejeneMotionSetting = ComejeneMotionSetting,
  State extends ComejeneMotionState = ComejeneMotionState<Setting>,
> = Component<
  {
    setting: Setting;
  },
  {
    state: State;
  },
  ""
>;
