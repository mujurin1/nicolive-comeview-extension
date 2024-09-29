import type { ExtMessage } from "../Platform";

const _messages = $state<ExtMessage[]>([]);

export const MessageStore = {
  get messages() { return _messages; },

  add: (message: ExtMessage) => _messages.push(message),
  remove: (messageId: string): boolean => {
    const index = _messages.findIndex(message => message.id === messageId);
    if (index === -1) return false;

    _messages.splice(index, 1);
    return true;
  },
  cleanup: () => {
    _messages.length = 0;
  },
} as const;
