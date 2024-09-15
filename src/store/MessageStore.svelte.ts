import type { ExtMessage } from "../Platform";

const _messages = $state<ExtMessage[]>([]);

export const MessageStore = {
  get messages() { return _messages; },
} as const;
