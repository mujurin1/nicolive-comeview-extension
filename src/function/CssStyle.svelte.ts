import type { NicoliveMessage } from "../Platform";
import { NceUserStore, type PlatformId_User } from "../store/NceStore.svelte";
import { SettingStore, type CommentFormat } from "../store/SettingStore.svelte";

function createStyleElement() {
  const map = new Map<string, number>();
  const element = document.createElement("style");
  document.head.appendChild(element);
  return { map, element } as const;
}

const styles = {
  "cm-user": createStyleElement(),
  "cm-system": createStyleElement(),
} as const;

export type StyleNames = keyof typeof styles;

export function getCssClassNameFromMessage(message: NicoliveMessage): string {
  if (message.kind === "system") return "cm-system";
  return getCssClassNameFromUserId(message.user.storageUser.id);
}

export function getCssClassNameFromUserId(userId: string): string {
  if (userId.startsWith("a:"))
    return `cm-id-${userId.slice(2)}`;

  return `cm-id-${userId}`;
}

/**
 * ユーザーのCSSStyleを作成する\
 * ユーザーの状態は`NceUserStore`を参照するため、変更は自動で反映されます
 * @returns CSSStyleを削除してEffectを解除します
 */
export function autoUpdateCommentCss(platformsId: PlatformId_User, userId: string) {
  const className = getCssClassNameFromUserId(userId);
  const unEffect = $effect.root(() => {
    $effect(() => {
      const format = NceUserStore[platformsId].get(userId)?.storageUser?.format;

      if (format == null) {
        clearClass("cm-user", className);
      } else {
        const style = createCssRule(format)!;
        upsertClass("cm-user", className, style);
      }
    });
  });

  return () => {
    unEffect();
    clearClass("cm-user", className);
  };
}

function upsertClass(styleName: StyleNames, className: string, rule: string) {
  const style = styles[styleName];

  const cssRuleIndex = style.map.get(className);
  try {
    if (cssRuleIndex == null) {
      const index = style.element.sheet!.cssRules.length;
      style.element.sheet!.insertRule(`.${className} { ${rule} }`, index);
      style.map.set(className, index);
    } else {
      style.element.sheet!.insertRule(`.${className} { ${rule} }`, cssRuleIndex);
      style.element.sheet!.deleteRule(cssRuleIndex + 1);
    }
  } catch (e) {
    console.error(e);
  }
}

function clearClass(styleName: StyleNames, className: string) {
  const style = styles[styleName];

  const cssRuleIndex = style.map.get(className);
  if (cssRuleIndex == null) return;

  style.element.sheet!.deleteRule(cssRuleIndex);
  style.element.sheet!.insertRule(`.${className} {}`, cssRuleIndex);
}

function _deleteClass(styleName: StyleNames, className: string) {
  const style = styles[styleName];
  const cssRuleIndex = style.map.get(className);
  if (cssRuleIndex != null) style.element.sheet!.deleteRule(cssRuleIndex);
}

function createCssRule(item: CommentFormat): string | undefined {
  let str = "";

  if (item.fontFamily != null) str += `font-family: ${item.fontFamily};`;
  if (item.fontSize != null) str += `font-size: ${item.fontSize}px;`;
  if (item.isBold === true) str += `font-weight: bold;`;
  if (item.isItally === true) str += `font-style: italic;`;
  if (item.backgroundColor != null) str += `background-color: ${item.backgroundColor};`;
  if (item.nameColor != null) str += `.name { color: ${item.nameColor}; }`;
  if (item.contentColor != null) str += `.content { color: ${item.contentColor}; }`;

  if (str === "") return undefined;
  return str;
}


$effect.root(() => {
  $effect(() => {
    const style = createCssRule(SettingStore.state.commentView.commentFormats.default)!;
    // デフォルトのCSSはユーザーよりも優先されないべき
    upsertClass("cm-user", "cm-default", style);
  });
  $effect(() => {
    const style = createCssRule(SettingStore.state.commentView.commentFormats.system)!;
    upsertClass("cm-system", "cm-system", style);
  });
  $effect(() => {
    const style = createCssRule(SettingStore.state.commentView.commentFormats.first)!;
    upsertClass("cm-system", "cm-first", style);
  });
  $effect(() => {
    const style = createCssRule(SettingStore.state.commentView.commentFormats.owner)!;
    upsertClass("cm-system", "cm-owner", style);
  });
});
