import type { NicoliveInfoProviderType } from "@mujurin/nicolive-api-ts";
import { PlatformsId, type ExtMessageType, type ExtUserType } from "./index";

/**
 * MEMO: 元々は`"rankingIn"` `"rankingUpdated"`があるが冗長なのでどちらも`"ranking"`として扱う
 */
export const SystemMessageType = [
  "nicoad", "gift", "enquete",
  // simpleNotification
  "ichiba", "quote", "emotion", "cruise", "programExtended", "ranking" /* "rankingIn", "rankingUpdated" */, "visited"
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
  ranking: "ランキング",
  // rankingIn: "ランクイン",
  // rankingUpdated: "ランキング更新",
  visited: "来場",
};


export type NicoliveMessage =
  | ExtMessageType<"nicolive", "system"> & {
    systemMessageType: SystemMessageType;
  }
  | ExtMessageType<"nicolive", "owner"> &
  {
    no: undefined;
  }
  | (
    ExtMessageType<"nicolive", "user"> &
    {
      no: number | undefined;
      is184: boolean;
    });

export interface NicoliveUser extends ExtUserType<"nicolive"> {
  providerType: NicoliveInfoProviderType;
  firstNo: number | undefined;
  is184: boolean;
  /** 184のコメ番名. 184のみ値が入る */
  noName184?: string;
}


export const NicoliveMessage = {
  builder: (
    messageId: string,
    liveId: string,
    time: string,
  ) => ({
    system: (content: string, systemMessageType: SystemMessageType, link?: string) =>
      NicoliveMessage.system(messageId, liveId, time, content, link, systemMessageType),
    owner: (content: string, user: NicoliveUser, name?: string, link?: string) =>
      NicoliveMessage.owner(messageId, liveId, time, content, link, user, name),
    user: (content: string, user: NicoliveUser, is184: boolean, no: number | undefined, link?: string) =>
      NicoliveMessage.user(messageId, liveId, time, content, link, user, is184, no),
  }),
  system: (
    messageId: string,
    liveId: string,
    time: string,
    content: string,
    link: string | undefined,
    systemMessageType: SystemMessageType,
  ): NicoliveMessage => ({
    platformId: "nicolive",
    id: `nicolive#${messageId}`,
    messageId,
    liveId,
    kind: "system",
    time,
    content,
    link: link ?? getLink(content),
    systemMessageType,
    iconUrl: undefined,
    includeSharp: false,
    tempName: undefined,
  }),
  owner: (
    messageId: string,
    liveId: string,
    time: string,
    content: string,
    link: string | undefined,
    extUser: NicoliveUser,
    name: string | undefined,
  ): NicoliveMessage => ({
    platformId: "nicolive",
    id: `nicolive#${messageId}`,
    messageId,
    liveId,
    kind: "owner",
    time,
    content,
    link: link ?? getLink(content),
    extUser,
    iconUrl: getNicoliveIconUrl(extUser.storageUser.id, false, extUser.providerType),
    no: undefined,
    includeSharp: false,
  }),
  user: (
    messageId: string,
    liveId: string,
    time: string,
    content: string,
    link: string | undefined,
    extUser: NicoliveUser,
    is184: boolean,
    no: number | undefined,
  ): NicoliveMessage => ({
    platformId: "nicolive",
    id: `nicolive#${messageId}`,
    messageId,
    liveId,
    kind: "user",
    time,
    content,
    is184,
    no,
    link: link ?? getLink(content),
    extUser,
    iconUrl: getNicoliveIconUrl(extUser.storageUser.id, is184),
    includeSharp: testIncludeSharp(content),
  })
} as const;


export const NicoliveUser = {
  create: (
    userId: string,
    is184: boolean,
    name: string | undefined,
    no: number | undefined,
    providerType: NicoliveInfoProviderType = "user",
  ): NicoliveUser => ({
    providerType,
    platformId: PlatformsId.nicolive,
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