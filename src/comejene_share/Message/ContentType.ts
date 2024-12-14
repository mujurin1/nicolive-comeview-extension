
/**
 * メッセージの要素の種類
 */
export const ComejeneContentTypes = ["img", "text"] as const;
export type ComejeneContentTypes = typeof ComejeneContentTypes[number];

/**
 * メッセージの要素のキー
 */
export const ComejeneContentKeys = ["icon", "name", "message"] as const;
export type ComejeneContentKeys = typeof ComejeneContentKeys[number];

export const ComejeneContentKeyToType = {
  icon: "img",
  name: "text",
  message: "text",
} as const satisfies Record<ComejeneContentKeys, ComejeneContentTypes>;
