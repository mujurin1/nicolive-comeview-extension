import { ComejeneMessageFrame } from "../../comejene_share";

export const ComejeneTemplates_MessageContainer = {
  "I-{N_/C}": () => ComejeneMessageFrame.new(
    ["FIT", "FLEX"],
    ["FIT", "FIT", "FLEX"],
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
  "I-N-C": () => ComejeneMessageFrame.new(
    ["FLEX"],
    ["FIT", "FIT", "FLEX"],
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
} as const satisfies Record<string, () => ComejeneMessageFrame>;

export const MessageContainerTemplateNames = Object.keys(ComejeneTemplates_MessageContainer) as (keyof typeof ComejeneTemplates_MessageContainer)[];
