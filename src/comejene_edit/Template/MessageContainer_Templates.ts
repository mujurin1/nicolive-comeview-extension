import { MessageContainerLayout } from "../../comejene_share";

export const MessageContainerTemplates = {
  "L:I-{N_C}": MessageContainerLayout.new(
    [50, "FLEX"],
    [50, 80, "FLEX"],
    {
      icon: {
        row: { start: 1, end: 2 },
        col: { start: 1, end: 1 },
      },
      name: {
        row: { start: 1, end: 1 },
        col: { start: 2, end: 2 },
      },
      message: {
        row: { start: 2, end: 2 },
        col: { start: 2, end: 3 },
      },
    },
  ),
  "L:I-N-C": MessageContainerLayout.new(
    ["FLEX"],
    ["FIT", 80, "FLEX"],
    {
      icon: {
        row: { start: 1, end: 1 },
        col: { start: 1, end: 1 },
      },
      name: {
        row: { start: 1, end: 1 },
        col: { start: 2, end: 2 },
      },
      message: {
        row: { start: 1, end: 1 },
        col: { start: 3, end: 3 },
      },
    },
  ),
} as const satisfies Record<string, MessageContainerLayout>;

export const MessageContainerTemplateNames = Object.keys(MessageContainerTemplates) as (keyof typeof MessageContainerTemplates)[];
