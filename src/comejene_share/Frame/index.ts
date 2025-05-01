export * from "./Sample/SampleMessage.svelte";
export * from "./Sample/SampleState.svelte";
export * from "./Sample/SampleView.svelte";
export * from "./Stack/StackMessage.svelte";
export * from "./Stack/StackState.svelte";
export * from "./Stack/StackView.svelte";
export * from "./type";

import type { Component } from "svelte";
import { SampleFrameStyle, type SampleFrameSetting } from "./Sample/SampleState.svelte";
import SampleFrame from "./Sample/SampleView.svelte";
import { StackFrameStyle, type StackFrameSetting } from "./Stack/StackState.svelte";
import StackFrame from "./Stack/StackView.svelte";
import type { ComejeneFrameSetting, ComejeneFrameState } from "./type";

export const ComejeneFrameDefinitions = {
  sample: {
    name: "sample",
    component: SampleFrame,
    css: SampleFrameStyle,
  },
  stack: {
    name: "stack",
    component: StackFrame,
    css: StackFrameStyle,
  },
} as const;

export type ComejeneFrameNames = "sample" | "stack";

export type ComejeneFrameSettings<Name extends ComejeneFrameNames = ComejeneFrameNames> = {
  sample: SampleFrameSetting,
  stack: StackFrameSetting,
}[Name];

export interface ComejeneFrameDefinition<Name extends ComejeneFrameNames> {
  name: Name;
  component: typeof ComejeneFrameDefinitions[Name]["component"];
  css: typeof ComejeneFrameDefinitions[Name]["css"];
}

export type ComejeneFrameComponent<
  Setting extends ComejeneFrameSetting = ComejeneFrameSetting,
  State extends ComejeneFrameState = ComejeneFrameState<Setting>,
> = Component<
  { setting: Setting; },
  { state: State; },
  ""
>;
