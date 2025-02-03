import type { NceMessage } from "../Platform";

const _messages = $state<NceMessage[]>([]);

export const NceMessageStore = {
  get messages() { return _messages; },

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
