import type { ExtMessage } from "../Platform";

const _messages = $state<ExtMessage[]>([]);

export const MessageStore = {
  get messages() { return _messages; },

  cleanup() {
    _messages.length = 0;
  }
} as const;
