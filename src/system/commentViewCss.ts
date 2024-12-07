import { autoUpdateCommentCss } from "../function/CssStyle.svelte";
import type { PlatformId_User } from "../store/NceStore.svelte";

const cssHooks = {
  nicolive: new Map<string, () => void>(),
} as const satisfies Record<PlatformId_User, Map<string, () => void>>;

export const CommentViewCss = {
  hook: (platformsId: PlatformId_User, userId: string) => {
    if (cssHooks[platformsId].has(userId)) return;

    cssHooks[platformsId].set(userId, autoUpdateCommentCss(platformsId, userId));
  },
  unhook: (platformsId: PlatformId_User, userId: string) =>
    cssHooks[platformsId].delete(userId),
} as const;
