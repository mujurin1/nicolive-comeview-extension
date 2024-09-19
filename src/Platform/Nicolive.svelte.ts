import { NicoliveClient, type NicoliveClientState, NicoliveWatchError, type dwango, timestampToMs } from "@mujurin/nicolive-api-ts";
import { type ExtMessageType, ExtMessenger, type ExtUserKind, type ExtUserType, PlatformsId } from ".";
import { BouyomiChan } from "../function/BouyomiChan";
import { autoUpdateCommentCss } from "../function/CssStyle.svelte";
import { MessageStore } from "../store/MessageStore.svelte";
import { SettingStore } from "../store/SettingStore.svelte";
import { StorageUserStore } from "../store/StorageUserStore.svelte";
import { parseIconUrl, timeString } from "../utils";

export interface NicoliveUser extends ExtUserType<"nicolive"> {
  firstNo?: number;
  is184: boolean;
  /** 184のコメ番名. 184のみ値が入る */
  noName184?: string;
}

export type NicoliveMessage = ExtMessageType<"nicolive"> & {
  /** システムメッセージは184とする */
  is184: boolean;

  no: number | undefined;
};


class _Nicolive {
  /** 接続開始時の過去コメを読み上げないためのフラグ */
  private _canSpeak = false;
  /** ストアを監視してCSSを更新する機能のクリーンアップ関数 */
  private _cleanupAutoUpdateComentCss: (() => void)[] = [];

  public state = $state<"none" | NicoliveClientState>("none");
  public connectWs = $state(false);
  public connectComment = $state(false);

  public url = $state("");
  public errorMessages = $state<string[]>([]);

  public client = $state<NicoliveClient>();


  /**
   * 接続している放送単位でのユーザーの情報を管理する\
   * システムメッセージのコメントのユーザーは管理しない
   * 
   * `Map`だと内部の値が変更されても通知されないためオブジェクトで管理する
   */
  public users = $state<Record<string, NicoliveUser>>({});
  /**
   * 過去メッセージを取得可能か (全て取得しているか)
   */
  public canFetchBackwaardMessage = $state(false);
  /**
   * 過去コメントを取得中か
   */
  public isFetchingBackwardMessage = $state(false);

  constructor() {
    StorageUserStore.nicolive.updated.on("remove", userId => {
      if (this.users[userId] == null) return;

      this.users[userId].storageUser = {
        id: this.users[userId].storageUser.id,
        name: this.users[userId].storageUser.name
      };
    });
    StorageUserStore.nicolive.updated.on("new", user => {
      if (this.users[user.id] == null) return;
      this.users[user.id].storageUser = user;
    });
  }

  public async connect() {
    if (!this.url) return;
    if (!(this.state === "none" || this.state === "disconnected")) return;

    this.cleanup();

    this.state = "connecting";

    try {
      this.client = await NicoliveClient.create(this.url, "now", SettingStore.state.general.fetchConnectingBackward ? 1 : 0, false);
    } catch (e) {
      this.state = "disconnected";
      if (e instanceof NicoliveWatchError) {
        this.errorMessages.push(e.message);
      } else if (e instanceof Error && e.message === "Failed to fetch") {
        this.errorMessages.push("インターネットと接続されていません");
      } else {
        this.errorMessages.push("不明なエラーが発生しました");
        throw e;
      }

      return;
    }

    this.url = this.client.info.liveId;

    this.client.onState.on((event, description) => {
      const oldState = this.state;
      this.state = event;

      if (oldState !== "disconnected" && this.state === "disconnected") {
        ExtMessenger.add(`切断しました. 理由:${description}`);
      } else if (oldState === "disconnected" && this.state === "reconnecting") {
        ExtMessenger.add("再接続中です...");
      } else if (oldState === "reconnecting" && this.state === "opened") {
        ExtMessenger.add("再接続しました");
      }
    });
    this.client.onLog.on("info", message => {
      if (message.type === "reconnect") {
        if (message.sec == null) this.errorMessages = [];
        else this.errorMessages.push(`ネットワークエラーが発生したため再接続中です\n    待機時間: ${message.sec}秒`);
      }
      else this.errorMessages.push(JSON.stringify(message));
    });
    this.client.onLog.on("error", message => {
      let msg = message.type;
      if ("error" in message) msg += `\n${message.error}`;
      this.errorMessages.push(msg);
    });

    this.client.onWsState.on(event => {
      this.connectWs = event === "opened";
    });
    this.client.onMessageState.on(event => {
      this.connectComment = event === "opened";
    });

    this.client.onMessageEntry.on(message => {
      if (message === "segment") {
        this._canSpeak = true;
        this.canFetchBackwaardMessage = this.client!.canFetchBackwardMessage();
      }
    });

    this.client.onMessage.on(this.onMessage);
    this.client.onMessageOld.on(this.onMessageOld);

    document.title = `${this.client.info.title} - ${this.client.info.liveId}`;

    // デバッグ用
    setDebug(this.client);
  }

  public close() {
    this.client?.close();
  }

  public async fetchBackword(maxBackwords: number) {
    if (this.client == null) return;
    this.isFetchingBackwardMessage = true;

    await this.client.fetchBackwardMessages(maxBackwords);
    this.isFetchingBackwardMessage = this.client.isFetchingBackwardMessage;
    this.canFetchBackwaardMessage = this.client.canFetchBackwardMessage();
  }

  public async reconnect() {
    if (this.client == null) return;
    if (this.state === "reconnecting") return;

    this._canSpeak = false;
    await this.client.reconnect();
    this._canSpeak = true;
  }

  public getUser(userId: string): NicoliveUser | undefined {
    return Nicolive.users[userId];
  }

  private cleanup() {
    for (const cleanupFn of this._cleanupAutoUpdateComentCss) {
      cleanupFn();
    }

    MessageStore.cleanup();
    this.client?.close();
    this._canSpeak = false;
    this._cleanupAutoUpdateComentCss = [];
    this.users = {};
    this.canFetchBackwaardMessage = true;
    this.errorMessages = [];
    this.isFetchingBackwardMessage = false;
  }

  // // デバッグ用
  // public dbgAddMessage(...messages: NicoliveMessage[]) {
  //   for (const message of messages) {
  //     this.upsertUser(message);
  //     this.messages.push(message);
  //   }
  // }

  private readonly onMessage = (chunkedMessage: dwango.ChunkedMessage) => {
    const message = this.parseMessage(chunkedMessage);
    if (message == null) return;

    if (this._canSpeak && !(SettingStore.state.general.hideSharp && message.includeSharp)) {
      let name: string | undefined;
      if (message.extUser != null) {
        const storeUser = message.extUser.storageUser;
        if (SettingStore.state.general.useYobina && storeUser.yobina != null) name = storeUser.yobina;
        else if (SettingStore.state.yomiage.speachNames.コテハン && SettingStore.state.general.useKotehan && storeUser.kotehan != null) name = storeUser.kotehan;
        else if (SettingStore.state.yomiage.speachNames.コメ番 && SettingStore.state.general.nameToNo && message.extUser?.noName184 != null) name = message.extUser.noName184;
        else if (SettingStore.state.yomiage.speachNames.ユーザー名 && storeUser.name != null) name = storeUser.name;
      }
      void BouyomiChan.speak(message.content, name);
    }

    MessageStore.messages.push(message);
  };

  private readonly onMessageOld = (chunkedMessages: dwango.ChunkedMessage[]) => {
    const messages: NicoliveMessage[] = [];
    for (const chunkedMessage of chunkedMessages) {
      const message = this.parseMessage(chunkedMessage);
      if (message == null) continue;

      messages.push(message);
    }

    MessageStore.messages.unshift(...messages);
  };

  private parseMessage(chunkedMessage: dwango.ChunkedMessage): NicoliveMessage | undefined {
    const part = this.parseMessagePart(chunkedMessage);
    if (part == null) return;

    if (part.kind === "system") {
      return {
        ...NicoliveMessagePart.delete(part),
        liveId: this.url,
        kind: part.kind,
        extUser: undefined,
      };
    }

    const extUser = this.upsertUser(part)!;

    return {
      ...NicoliveMessagePart.delete(part),
      liveId: this.url,
      kind: part.kind,
      extUser,
    };
  }

  /**
   * メッセージからユーザー情報を更新・新規作成する\
   * `store`と`this.users`を更新する
   * @returns 更新・作成したユーザー
   */
  private upsertUser(part: NicoliveMessagePart): NicoliveUser | undefined {
    if (part.kind === "system" || part.userId == null) return;

    const koteyobi = parseKotehanAndYobina(part.content);
    const isNew = this.users[part.userId] == null;

    // MEMO: kind:system は弾いているので createUser が undefined を返すことはあり得ない
    if (isNew) this.users[part.userId] = createUser(part)!;
    // MEMO: svelte の $state 参照を経由する必要があるため必ず this.users から取り出す必要がある
    const user = this.users[part.userId];

    // this.users を更新
    if (part.kind === "user" && part.no != null && (user.firstNo == null || part.no < user.firstNo)) {
      user.firstNo = part.no;
      if (user.is184) user.noName184 = `${part.no}コメ`;
    }

    // StorageUserStore を更新
    if (koteyobi != null) {
      if (koteyobi.kotehan != null) user.storageUser.kotehan = koteyobi.kotehan === 0 ? undefined : koteyobi.kotehan;
      if (koteyobi.yobina != null) user.storageUser.yobina = koteyobi.yobina === 0 ? undefined : koteyobi.yobina;
      StorageUserStore.nicolive.upsert(user.storageUser);
    }

    if (isNew) {
      this.onFirstComment(user);
    }

    return user;
  }

  /**
   * 初コメのユーザー
   */
  private onFirstComment(user: NicoliveUser) {
    this._cleanupAutoUpdateComentCss.push(autoUpdateCommentCss(user.storageUser.id));
  }

  private parseMessagePart({ meta, payload }: dwango.ChunkedMessage): NicoliveMessagePart | undefined {
    if (meta == null) return;

    const messageId = meta.id;
    let userId: string | undefined;
    let kind: ExtUserKind;
    let no: number | undefined;
    let iconUrl: string | undefined;
    let is184: boolean;
    let name: string | undefined;
    const time = timestampToMs(meta.at!) - this.client!.beginTime.getTime();
    let content: string;
    let link: string | undefined;

    if (payload.case === "message") {
      const data = payload.value.data;
      if (data.case === "chat") {
        kind = "user";
        userId = data.value.hashedUserId ?? data.value.rawUserId + "";
        is184 = data.value.rawUserId == null;
        no = data.value.no;
        iconUrl = parseIconUrl(userId);
        if (!is184) name = data.value.name;
        content = data.value.content;
      } else if (data.case === "nicoad") {
        kind = "system";
        is184 = true;
        if (data.value.versions.case === "v0") {
          const { latest, ranking } = data.value.versions.value;
          const i = latest?.message == null ? "" : `「${latest?.message}」`;
          content = ranking == null ? "" : `【広告貢献${ranking}位】`;
          content += `提供：${latest?.advertiser}さん${i}（${latest?.point}pt）`;
        } else if (data.value.versions.case === "v1") {
          content = data.value.versions.value.message;
        } else {
          content = "ニコニ広告されました";
        }
      } else if (data.case === "gift") {
        kind = "system";
        is184 = true;
        const { contributionRank: rank, advertiserName: giftUser, itemName, point } = data.value;
        // なぜか message は空文字
        // content = data.value.message;
        content = rank == null ? "" : `【ギフト貢献${rank}位】`;
        content += `${giftUser}さんがギフト「${itemName}（${point}pt）」を贈りました`;
      } else if (data.case === "simpleNotification") {
        kind = "system";
        is184 = true;
        content = data.value.message.value!;
      } else return;
    } else if (payload.case === "state") {
      if (payload.value.marquee != null) {
        kind = "owner";
        is184 = false;
        const operatorComment = payload.value.marquee.display?.operatorComment;
        if (operatorComment == null) return;
        userId = this.client!.info.owner.id;
        iconUrl = parseIconUrl(userId);
        name = this.client!.info.owner.name;
        content = operatorComment.content!;
        link = operatorComment.link;
      } else if (payload.value.enquete != null) {
        if (payload.value.enquete.choices.length === 0) return;
        kind = "system";
        is184 = false;
        const isStart = payload.value.enquete.choices[0].perMille == null;
        content = isStart ? "【アンケート開始】" : "【アンケート結果】";
        content += payload.value.enquete.question;
        for (let i = 0; i < payload.value.enquete.choices.length; i++) {
          const choice = payload.value.enquete.choices[i];
          content += `\n　${i}:`;
          if (choice.perMille != null) content += `${choice.perMille / 10}% `;
          content += choice.description;
        }
      } else
        return;
    } else
      return;

    if (link == null) {
      link = /.*(https?:\/\/\S*).*/.exec(content)?.[1];
      if (link == null) {
        const smId = /.*(sm\d+).*/.exec(content)?.[1];
        if (smId != null) {
          link = `https://www.nicovideo.jp/watch/${smId}`;
        }
      }
    }

    return {
      id: `${PlatformsId.nicolive}#${messageId}`,
      platformId: PlatformsId.nicolive,
      messageId,
      kind,
      extUser: undefined,

      userId,
      name,

      no,
      iconUrl,
      is184,
      time: timeString(time),
      content,
      link,
      includeSharp: kind === "user" && /[♯#＃]/.test(content),
    };
  }
}

export const Nicolive = new _Nicolive();

function createUser(part: NicoliveMessagePart): NicoliveUser | undefined {
  if (part.kind === "system" || part.userId == null) return;

  let noName184: string | undefined;
  if (part.is184 && part.no != null) {
    noName184 = `${part.no}コメ`;
  }

  return {
    platformId: PlatformsId.nicolive,
    storageUser: StorageUserStore.nicolive.users[part.userId] ?? {
      id: part.userId,
      name: part.name,
      kotehan: undefined,
      yobina: undefined,
    },
    firstNo: part.kind === "user" ? part.no : undefined,
    is184: part.is184,
    noName184,
  };
}

/**
 * 文字列からコテハンと呼び名をパースする\
 * `0`は削除するフラグ
 * @param str パースする文字列
 */
function parseKotehanAndYobina(str: string): { kotehan?: string | 0; yobina?: string | 0; } | undefined {
  let kotehan: string | 0 | undefined;
  let yobina: string | 0 | undefined;

  if (!SettingStore.state.general.useKotehan && !SettingStore.state.general.useYobina) return undefined;

  const reg = /[@＠](\s|[^\s@＠]+)?[^@＠]*(?:[@＠](\s|[^\s@＠]+))?/.exec(str);
  if (reg == null) return undefined;

  if (SettingStore.state.general.useKotehan && reg[0] != null)
    kotehan = /\s/.test(reg[0]) ? 0 : reg[0];
  if (SettingStore.state.general.useYobina && reg[1] != null)
    yobina = /\s/.test(reg[1]) ? 0 : reg[1];


  if (kotehan == null && yobina == null) return undefined;
  return { kotehan, yobina };
}


function setDebug(client: NicoliveClient) {
  client.onState.on((event, description) => { console.log(`wsClient: ${event}  desc:${description}`); });
  client.onWsState.on(event => { console.log(`wsClient: ${event}`); });
  client.onWsMessage._debugAllOn(event => { console.log("wsMsg: ", event); });
  client.onMessageState.on(event => { console.log(`commentClient: ${event}`); });
  client.onMessageEntry.on(event => { console.log(`commentEntry: ${event}`); });
  client.onMessage.on(x);
  client.onMessageOld.on(msgs => { x(...msgs); });

  client.onLog._debugAllOn(event => { console.log("state: ", event.data[0]); });

  function x(...messages: dwango.ChunkedMessage[]) {
    for (const { meta: _meta, payload: { value, case: _case } } of messages) {
      const meta =
        _meta == null
          ? "none"
          : {
            ..._meta,
            "#date": _meta.at == null ? "-" : new Date(timestampToMs(_meta.at)).toLocaleString(),
          };
      if (_case === "state") {
        console.log("###", _case, meta, value);
      } else if (_case === "signal") {
        console.log("###", _case, meta, value);
      } else if (_case === "message") {
        console.log("###", _case, value.data.case, meta);
        console.log(value.data.value);
      }
    }
  }
}


interface NicoliveMessagePart {
  id: `nicolive#${string}`;
  platformId: "nicolive";
  messageId: string;
  kind: ExtUserKind;
  extUser: undefined;

  no: number | undefined;
  iconUrl: string | undefined;
  is184: boolean;
  time: string;
  content: string;
  link: string | undefined;
  includeSharp: boolean;

  // 以下は本体にはないので削除する必要がある
  userId: string | undefined;
  name: string | undefined;
}
const NicoliveMessagePart = {
  delete: (part: NicoliveMessagePart) => {
    delete part["userId"];
    delete part["name"];
    return part;
  }
} as const;
