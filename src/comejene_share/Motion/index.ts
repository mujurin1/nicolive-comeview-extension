export * from "./Sample/SampleMessage.svelte";
export * from "./Sample/SampleState.svelte";
export * from "./Sample/SampleView.svelte";
export * from "./Stack/StackMessage.svelte";
export * from "./Stack/StackState.svelte";
export * from "./Stack/StackView.svelte";
export * from "./type";

import type { Component } from "svelte";
import { SampleMotionStyle, type SampleMotionSetting } from "./Sample/SampleState.svelte";
import SampleView from "./Sample/SampleView.svelte";
import { StackMotionStyle, type StackMotionSetting } from "./Stack/StackState.svelte";
import StackView from "./Stack/StackView.svelte";
import type { ComejeneMotionSetting, ComejeneMotionState } from "./type";

export const ComejeneMotionDefinitions = {
  sample: {
    name: "sample",
    component: SampleView,
    css: SampleMotionStyle,
  },
  stack: {
    name: "stack",
    component: StackView,
    css: StackMotionStyle,
  },
} as const;

export type ComejeneMotionNames = "sample" | "stack";

export type ComejeneMotionSettings<Name extends ComejeneMotionNames = ComejeneMotionNames> = {
  sample: SampleMotionSetting,
  stack: StackMotionSetting,
}[Name];

export interface ComejeneMotionDefinition<Name extends ComejeneMotionNames> {
  name: Name;
  component: typeof ComejeneMotionDefinitions[Name]["component"];
  css: typeof ComejeneMotionDefinitions[Name]["css"];
}

export type ComejeneMotionComponent<
  Setting extends ComejeneMotionSetting = ComejeneMotionSetting,
  State extends ComejeneMotionState = ComejeneMotionState<Setting>,
> = Component<
  { setting: Setting; },
  { state: State; },
  ""
>;
