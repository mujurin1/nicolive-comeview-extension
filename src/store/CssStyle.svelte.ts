import type { CommentFormat } from "./data";
import { userStore } from "./n_store.svelte";
import { Nicolive, type NicoliveMessage, type NicoliveUser } from "./Nicolive.svelte";
import { extentionStateHolder } from "./store.svelte";


const cssClassIndexes = new Map<string, number>();
const style = document.createElement("style");
document.head.appendChild(style);

export function getCssClassNameFromMessage(message: NicoliveMessage): string {
  if (message.type === "system") return "cm-system";
  if (message.type === "owner") return "cm-owner";
  return getCssClassNameFromUserId(message.userId!);
}

export function getCssClassNameFromUserId(userId: string | number): string {
  if (typeof userId === "string" && userId.startsWith("a:"))
    return `cm-id-${userId.slice(2)}`;

  return `cm-id-${userId}`;
}

export function autoUpdateCommentCss(user: NicoliveUser) {
  const userId = user.id;
  const className = getCssClassNameFromUserId(userId);
  return $effect.root(() => {
    $effect(() => {
      // eslint-disable-next-line no-unused-expressions
      // extentionStateHolder.state.nicolive.users_primitable[userId + ""]?.format;
      // eslint-disable-next-line no-unused-expressions
      userStore.users[userId].format;
      const format = Nicolive.users[userId + ""].storeUser.format;

      if (format == null) {
        clearClass(className);
      } else {
        const style = createCssRule(format)!;
        upsertClass(className, style);
      }
    });
  });
}

function upsertClass(className: string, rule: string) {
  const cssRuleIndex = cssClassIndexes.get(className);
  if (cssRuleIndex == null) {
    const index = style.sheet!.cssRules.length;
    cssClassIndexes.set(className, index);
    style.sheet!.insertRule(`.${className} { ${rule} }`, index);
  } else {
    style.sheet!.deleteRule(cssRuleIndex);
    style.sheet!.insertRule(`.${className} { ${rule} }`, cssRuleIndex);
  }
}

function clearClass(className: string) {
  const cssRuleIndex = cssClassIndexes.get(className);
  if (cssRuleIndex == null) return;

  style.sheet!.deleteRule(cssRuleIndex);
  style.sheet!.insertRule(`.${className} {}`, cssRuleIndex);
}

function deleteClass(className: string) {
  const cssRuleIndex = cssClassIndexes.get(className);
  if (cssRuleIndex != null) style.sheet!.deleteRule(cssRuleIndex);
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
    const style = createCssRule(extentionStateHolder.state.commentView.commentFormats.default)!;
    upsertClass("cm-default", style);
  });
  $effect(() => {
    const style = createCssRule(extentionStateHolder.state.commentView.commentFormats.system)!;
    upsertClass("cm-system", style);
  });
  $effect(() => {
    const style = createCssRule(extentionStateHolder.state.commentView.commentFormats.firstComment)!;
    upsertClass("cm-firstComment", style);
  });
  $effect(() => {
    const style = createCssRule(extentionStateHolder.state.commentView.commentFormats.owner)!;
    upsertClass("cm-owner", style);
  });
});
