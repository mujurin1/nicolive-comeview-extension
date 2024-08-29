import { NicoliveClient, NicoliveWatchError, timestampToMs, type NicoliveClientState } from "@mujurin/nicolive-api-ts";
import type { ChunkedMessage } from "@mujurin/nicolive-api-ts/build/gen/dwango_pb";
import { parseIconUrl, timeString } from "../utils";
import { BouyomiChan } from "./BouyomiChan.svelte";
import { autoUpdateCommentCss } from "./CssStyle.svelte";
import type { StoreUser_Nicolive } from "./data";
import { store } from "./store.svelte";

export interface NicoliveMessage {
  type: "listener" | "owner" | "system";
  /** システムメッセージは184とする */
  is184: boolean;

  commentId: string;
  userId: string | number | undefined;
  no: number | undefined;
  iconUrl: string | undefined;
  name: string | null;
  time: string;
  content: string;
  /** コメントに含まれるURL */
  link: string | undefined;
  /** シャープを含むコメントか */
  includeSharp: boolean;
}

/** `"owner" | "listener"` のコメントのユーザー情報 */
export interface NicoliveUser {
  id: string | number;
  firstNo?: number;
  is184: boolean;
  /** 184でもこの値は存在するが、184の場合はストアに保存されない */
  storeUser: StoreUser_Nicolive;

  /** 184のコメ番名. 184のみ値が入る */
  noName184?: string;
}

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
  public messages = $state<NicoliveMessage[]>([]);


  public vposBaseTimeMs?: number;
  /**
   * 接続している放送単位でのユーザーの情報を管理する\
   * システムメッセージのコメントのユーザーは管理しない
   * 
   * `Map`だと内部の値が変更されても通知されないためオブジェクトで管理する
   */
  public users = $state<Record<string | number, NicoliveUser>>({});
  /**
   * 過去メッセージを取得可能か (全て取得しているか)
   */
  public canFetchBackwaardMessage = $state(true);
  /**
   * 過去コメントを取得中か
   */
  public isFetchingBackwardMessage = $state(false);

  public async connect() {
    if (!this.url) return;
    if (!(this.state === "none" || this.state === "disconnected")) return;

    this.cleanup();

    this.state = "connecting";

    try {
      this.client = await NicoliveClient.create(this.url, "now", store.general.fetchConnectingBackward ? 1 : 0, false);
    } catch (e) {
      this.state = "disconnected";
      if (!(e instanceof NicoliveWatchError)) throw e;

      this.errorMessages.push(e.message);
      return;
    }

    this.url = this.client.liveId;

    this.client.onState.on(event => this.state = event);
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
    }
    );
    this.client.onWsMessage.on("messageServer", data => { this.vposBaseTimeMs = new Date(data.vposBaseTime).getTime(); });

    this.client.onMessageEntry.on(message => {
      if (message === "segment") {
        this._canSpeak = true;
      }
    });

    this.client.onMessage.on(this.onMessage);
    this.client.onMessageOld.on(this.onMessageOld);

    document.title = `${this.client.title} - ${this.client.liveId}`;

    // // デバッグ用
    // setDebug(this.client);
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

  // デバッグ用
  public dbgAddMessage(...messages: NicoliveMessage[]) {
    for (const message of messages) {
      this.upsertUser(message);
      this.messages.push(message);
    }
  }

  private readonly onMessage = (chunkedMessage: ChunkedMessage) => {
    const message = parseMessage(chunkedMessage, this);
    if (message == null) return;

    const user = this.upsertUser(message);

    if (this._canSpeak && !(store.general.hideSharp && message.includeSharp)) {
      const storeUser = user?.storeUser;
      let name: string | null = null;
      if (storeUser != null) {
        if (store.general.useYobina && storeUser.yobina != null) name = storeUser.yobina;
        else if (store.general.useKotehan && storeUser.kotehan != null) name = storeUser.kotehan;
        else if (store.general.nameToNo && user?.noName184 != null) name = user.noName184;
        else name = storeUser.name;
      }
      void BouyomiChan.speak(message.content, name);
    }

    this.messages.push(message);
  };

  private readonly onMessageOld = (chunkedMessage: ChunkedMessage[]) => {
    const message = chunkedMessage
      .map(message => {
        const comment = parseMessage(message, this);
        if (comment == null) return;
        this.upsertUser(comment);
        return comment;
      })
      .filter(comment => comment != null);

    this.messages.unshift(...message);
  };

  /**
   * メッセージからユーザー情報を更新・新規作成する\
   * `store`と`this.users`を更新する
   * @returns 更新・作成したユーザー
   */
  private upsertUser(message: NicoliveMessage): NicoliveUser | undefined {
    if (message.type === "system" || message.userId == null) return;

    const [kotehan, yobina] = parseKotehanAndYobina(message.content);
    const user = this.users[message.userId] ?? createUser(message)!;


    // this.users を更新
    if (message.no != null && user.firstNo != null && message.no < user.firstNo) {
      user.firstNo = message.no;
      if (user.is184) user.noName184 = `${message.no}コメ`;
    }
    if (kotehan != null) user.storeUser.kotehan = kotehan === 0 ? undefined : kotehan;
    if (yobina != null) user.storeUser.yobina = yobina === 0 ? undefined : yobina;

    // store を更新
    if (kotehan === 0) user.storeUser.kotehan = undefined;
    if (yobina === 0) user.storeUser.yobina = undefined;

    // 保存する条件
    if (
      user.storeUser.name !== message.name ||
      user.storeUser.kotehan != null ||
      user.storeUser.yobina != null ||
      user.storeUser.format != null
    ) {
      if (message.name !== null) user.storeUser.name = message.name;
      store.nicolive.users_primitable[user.id] = user.storeUser;
    }

    if (this.users[message.userId] == null) {
      this.users[message.userId] = user;
      this.onFirstComment(user);
    }

    return user;
  }

  /**
   * 初コメのユーザー
   */
  private onFirstComment(user: NicoliveUser) {
    this._cleanupAutoUpdateComentCss.push(autoUpdateCommentCss(user));
  }

  private cleanup() {
    for (const cleanupFn of this._cleanupAutoUpdateComentCss) {
      cleanupFn();
    }

    this.client?.dispose();
    this._canSpeak = false;
    this._cleanupAutoUpdateComentCss = [];
    this.messages = [];
    this.users = {};
    this.canFetchBackwaardMessage = true;
    this.errorMessages = [];
    this.isFetchingBackwardMessage = false;
  }
}

export const Nicolive = new _Nicolive();


function parseMessage({ meta, payload }: ChunkedMessage, nicolive: _Nicolive): NicoliveMessage | undefined {
  if (meta == null) return;

  const commentId = meta.id!;
  let userId: string | number | undefined;
  let type: NicoliveMessage["type"];
  let no: number | undefined;
  let iconUrl: string | undefined;
  let is184: boolean;
  let name: string | undefined;
  let time = timestampToMs(meta.at!) - nicolive.client!.beginTime.getTime();
  let content: string;
  let link: string | undefined;


  if (payload.case === "message") {
    const data = payload.value.data;
    if (data.case === "chat") {
      type = "listener";
      userId = data.value.hashedUserId ?? Number(data.value.rawUserId)!;
      is184 = data.value.rawUserId == null;
      no = data.value.no;
      iconUrl = parseIconUrl(userId);
      name = data.value.name;
      time = data.value.vpos * 10 - (nicolive.client!.beginTime.getTime() - nicolive.vposBaseTimeMs!);
      content = data.value.content;
    } else if (data.case === "nicoad") {
      type = "system";
      is184 = true;
      if (data.value.versions.case === "v0") {
        const { latest, ranking } = data.value.versions.value;
        const i = latest?.message == null ? "" : `「${latest?.message}」`;
        content = ranking == null ? "" : `【広告貢献${ranking}位】`;
        content = `提供：${latest?.advertiser}さん${i}（${latest?.point}pt）`;
      } else if (data.value.versions.case === "v1") {
        content = data.value.versions.value.message;
      } else {
        content = "ニコニ広告されました";
      }
    } else if (data.case === "gift") {
      type = "system";
      is184 = true;
      const { contributionRank: rank, advertiserName: giftUser, itemName, point } = data.value;
      // なぜか message は空文字
      // content = data.value.message;
      content = rank == null ? "" : `【ギフト貢献${rank}位】`;
      content += `${giftUser}さんがギフト「${itemName}（${point}pt）」を贈りました`;
    } else if (data.case === "simpleNotification") {
      type = "system";
      is184 = true;
      content = data.value.message.value!;
    } else return;
  } else if (payload.case === "state") {
    type = "owner";
    is184 = false;
    const operatorComment = payload.value.marquee?.display?.operatorComment;
    if (operatorComment == null) return;
    userId = nicolive.client!.ownerId;
    iconUrl = parseIconUrl(userId);
    name = nicolive.client!.ownerName;
    content = operatorComment.content!;
    link = operatorComment.link;
  } else
    return;

  if (store.general.urlToLink && link == null) {
    link = /.*(https?:\/\/\S*).*/.exec(content)?.[1];
  }

  return {
    type,
    commentId,
    userId,
    no,
    iconUrl,
    is184,
    name: name ?? null,
    time: timeString(time),
    content,
    link,
    includeSharp: /[♯#＃]/.test(content),
  };
}

function createUser(message: NicoliveMessage): NicoliveUser | undefined {
  if (message.type === "system" || message.userId == null) return;

  let noName184: string | undefined;
  if (message.is184 && message.no != null) {
    noName184 = `${message.no}コメ`;
  }

  return {
    id: message.userId,
    firstNo: message.no,
    is184: message.is184,
    storeUser: store.nicolive.users_primitable[message.userId] ?? {
      id: message.userId,
      name: message.name,
      kotehan: undefined,
      yobina: undefined,
    },
    noName184,
  };
}

/**
 * 文字列からコテハンと呼び名をパースする\
 * `0`は削除するフラグ
 * @param str パースする文字列
 * @returns [コテハン, 呼び名]
 */
function parseKotehanAndYobina(str: string): [string | 0 | undefined, string | 0 | undefined] {
  if (!store.general.useKotehan && !store.general.useYobina) return [undefined, undefined];

  const reg = /[@＠](\s|[^\s@＠]+)?[^@＠]*(?:[@＠](\s|[^\s@＠]+))?/.exec(str);
  if (reg == null) return [undefined, undefined];

  const kotehan = store.general.useKotehan ? reg[1] : undefined;
  const yobina = store.general.useYobina ? reg[2] : undefined;

  return [
    /\s/.test(kotehan!) ? 0 : kotehan,
    /\s/.test(yobina!) ? 0 : yobina,
  ];
}


function setDebug(client: NicoliveClient) {
  client.onWsState.on(event => { console.log(`wsClient: ${event}`); });
  client.onWsMessage._debugAllOn(event => { console.log("wsMsg: ", event); });
  client.onMessageState.on(event => { console.log(`commentClient: ${event}`); });
  client.onMessageEntry.on(event => { console.log(`commentEntry: ${event}`); });
  client.onMessage.on(x);
  client.onMessageOld.on(msgs => { x(...msgs); });

  client.onLog._debugAllOn(event => { console.log("state: ", event.data[0]); });

  function x(...messages: ChunkedMessage[]) {
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
