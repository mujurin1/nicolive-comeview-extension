import type { NicoliveInfoProviderType } from "@mujurin/nicolive-api-ts";
import { PlatformsId, type ExtMessageType, type NceUserType } from "./index";

/**
 * MEMO: `"rankingIn"`,`"rankingUpdated"` は冗長なのでどちらも`"ranking"`として扱う
 */
export const SystemMessageType = [
  "nicoad", "gift", "enquete",
  // simpleNotification
  "ichiba", "quote", "emotion", "cruise", "programExtended", "ranking" /* "rankingIn", "rankingUpdated" */, "visited",
] as const;
export type SystemMessageType = typeof SystemMessageType[number];
export const SystemMessageTypeDisplayName = {
  nicoad: "広告",
  gift: "ギフト",
  enquete: "アンケート",
  ichiba: "放送ネタ",
  quote: "引用",
  emotion: "エモーション",
  cruise: "クルーズ",
  programExtended: "延長",
  /** `rankingIn`,`rankingUpdated` の2つを兼用する独自定義 */
  ranking: "ランキング",
  // rankingIn: "ランクイン",
  // rankingUpdated: "ランキング更新",
  visited: "来場",
} as const satisfies Record<SystemMessageType, string>;


export type NicoliveMessage = NicoliveMessageSystem | NicoliveMessageOwner | NicoliveMessageUser;
export interface NicoliveMessageSystem extends ExtMessageType<"nicolive", "system"> {
  systemMessageType: SystemMessageType;
}
export interface NicoliveMessageOwner extends ExtMessageType<"nicolive", "owner"> {
  no: undefined;
}
export interface NicoliveMessageUser extends ExtMessageType<"nicolive", "user"> {
  no: number | undefined;
  is184: boolean;
}

export interface NicoliveUser extends NceUserType<"nicolive"> {
  providerType: NicoliveInfoProviderType;
  /** 初コメの番号 */
  firstNo: number | undefined;
  is184: boolean;
  /** 184のコメ番名. 184のみ値が入る */
  noName184?: string;
}

export type NicoliveMessageBuilder = ReturnType<typeof NicoliveMessage.builder>;
export const NicoliveMessage = {
  builder: (
    messageId: string,
    connectionId: string,
    time: string,
  ) => ({
    system: (content: string, systemMessageType: SystemMessageType, link?: string) =>
      NicoliveMessage.system(messageId, connectionId, time, content, link, systemMessageType),
    owner: (content: string, user: NicoliveUser, name?: string, link?: string) =>
      NicoliveMessage.owner(messageId, connectionId, time, content, link, user, name),
    user: (content: string, user: NicoliveUser, is184: boolean, no: number | undefined, link?: string) =>
      NicoliveMessage.user(messageId, connectionId, time, content, link, user, is184, no),
  }),
  system: (
    messageId: string,
    connectionId: string,
    time: string,
    content: string,
    link: string | undefined,
    systemMessageType: SystemMessageType,
  ): NicoliveMessageSystem => ({
    platformId: "nicolive",
    id: `nicolive#${messageId}`,
    messageId,
    connectionId,
    kind: "system",
    time,
    content,
    link: link ?? getLink(content),
    systemMessageType,
    includeSharp: false,
    tempName: undefined,
  }),
  owner: (
    messageId: string,
    connectionId: string,
    time: string,
    content: string,
    link: string | undefined,
    user: NicoliveUser,
    name: string | undefined,
  ): NicoliveMessageOwner => ({
    platformId: "nicolive",
    id: `nicolive#${messageId}`,
    messageId,
    connectionId,
    kind: "owner",
    time,
    content,
    link: link ?? getLink(content),
    user,
    no: undefined,
    includeSharp: false,
    tempName: name,
  }),
  user: (
    messageId: string,
    connectionId: string,
    time: string,
    content: string,
    link: string | undefined,
    user: NicoliveUser,
    is184: boolean,
    no: number | undefined,
  ): NicoliveMessageUser => ({
    platformId: "nicolive",
    id: `nicolive#${messageId}`,
    messageId,
    connectionId,
    kind: "user",
    time,
    content,
    is184,
    no,
    link: link ?? getLink(content),
    user,
    includeSharp: testIncludeSharp(content),
    tempName: undefined,
    get isFirstComment() { return no != null && user.firstNo === no; },
  }),
} as const;


export const NicoliveUser = {
  create: (
    userId: string,
    is184: boolean,
    name: string | undefined,
    no: number | undefined,
    providerType: NicoliveInfoProviderType,
  ): NicoliveUser => ({
    providerType,
    platformId: PlatformsId.nicolive,
    iconUrl: getNicoliveIconUrl(userId, is184),
    storageUser: {
      id: userId,
      name: name,
      kotehan: undefined,
      yobina: undefined,
    },
    firstNo: no,
    is184,
    noName184: is184 && no != null ? `${no}コメ` : undefined,
  })
} as const;


export const nicoliveNoneIcon = "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg";

export function onErrorImage(e: Event): void {
  const img = e.currentTarget as HTMLImageElement;
  if (img.src === nicoliveNoneIcon) return;
  img.src = nicoliveNoneIcon;
}

export function getNicoliveIconUrl(userId: string, is184 = false, providerType: NicoliveInfoProviderType = "user"): string {
  if (is184) return nicoliveNoneIcon;

  if (providerType === "user") {
    const num = +userId;
    if (isNaN(num)) return nicoliveNoneIcon;
    return `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${Math.floor(num / 1e4)}/${userId}.jpg`;
  } else {
    return `https://secure-dcdn.cdn.nimg.jp/comch/channel-icon/128x128/${userId}.jpg`;
  }
}

function testIncludeSharp(text: string): boolean {
  return /[♯#＃]/.test(text);
}

function getLink(text: string): string | undefined {
  const url = /.*(https?:\/\/\S*).*/.exec(text)?.[1];
  if (url != null) return url;

  const smId = /.*(sm\d+).*/.exec(text)?.[1];
  if (smId != null) return `https://www.nicovideo.jp/watch/${smId}`;
}
