export * from "./NicoliveType";

import { NicoliveClient, type NicoliveClientState, NicoliveDisconectReasonDescription, NicoliveWatchError, type dwango, timestampToMs } from "@mujurin/nicolive-api-ts";
import { ExtMessenger } from ".";
import { BouyomiChan } from "../function/BouyomiChan";
import { autoUpdateCommentCss } from "../function/CssStyle.svelte";
import { MessageStore } from "../store/MessageStore.svelte";
import { SettingStore } from "../store/SettingStore.svelte";
import { StorageUserStore } from "../store/StorageUserStore.svelte";
import { timeString } from "../utils";
import { NicoliveMessage, NicoliveUser, type SystemMessageType } from "./NicoliveType";


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
    this.createOwner();

    this.client.onState.on((event, description) => {
      const oldState = this.state;
      this.state = event;

      if (oldState !== "disconnected" && this.state === "disconnected") {
        const desc = typeof description === "object"
          ? `${description[0]}: ${NicoliveDisconectReasonDescription[description[1]!]}`
          : description;
        ExtMessenger.add(`切断しました. 理由:${desc}`);
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

  public async reconnect() {
    if (this.client == null) return;
    if (this.state === "reconnecting") return;

    this._canSpeak = false;
    await this.client.reconnect();
    this._canSpeak = true;
  }

  public getUser(userId: string | undefined): NicoliveUser | undefined {
    return Nicolive.users[userId!];
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

  private readonly onMessage = (chunkedMessage: dwango.ChunkedMessage) => {
    const message = this.createMessage(chunkedMessage);
    if (message == null) return;

    if (
      this._canSpeak && (
        message.kind !== "user" ||
        !(SettingStore.state.general.hideSharp && message.includeSharp)
      )
    ) {
      let name: string | undefined;
      if (message.kind !== "system") {
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
      const message = this.createMessage(chunkedMessage);
      if (message == null) continue;

      messages.push(message);
    }

    MessageStore.messages.unshift(...messages);
  };

  private createMessage({ meta, payload }: dwango.ChunkedMessage): NicoliveMessage | undefined {
    if (meta == null) return;

    const messageId = meta.id;
    const time = timeString(timestampToMs(meta.at!) - this.client!.beginTime.getTime());

    const builder = NicoliveMessage.builder(messageId, this.url, time);

    if (payload.case === "message") {
      const data = payload.value.data;
      if (data.case === "chat") {
        const userId = data.value.hashedUserId ?? data.value.rawUserId + "";
        const is184 = data.value.rawUserId == null;
        let user = this.getUser(userId);
        if (user == null) {
          user = NicoliveUser.create(userId, is184, is184 ? undefined : data.value.name, data.value.no);
        }

        // MEMO: この代入は svelte の更新のルールに従うため
        user = this.upsertUser(user, data.value.content, data.value.no);
        return builder.user(data.value.content, user, is184, data.value.no);
      } else {
        let content: string;
        let type: SystemMessageType;

        if (data.case === "nicoad") {
          type = "nicoad";
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
          type = "gift";
          const { contributionRank: rank, advertiserName: giftUser, itemName, point } = data.value;
          content = rank == null ? "" : `【ギフト貢献${rank}位】`;
          content += `${giftUser}さんがギフト「${itemName}（${point}pt）」を贈りました`;
        } else if (data.case === "simpleNotification") {
          if (data.value.message.case == null) return;
          type = "gift";
          content = data.value.message.value;
        } else
          return;
        return builder.system(content, type);
      }
    } else if (payload.case === "state") {
      if (payload.value.marquee != null) {
        const operatorComment = payload.value.marquee.display?.operatorComment;
        if (operatorComment == null) return;
        const content = operatorComment.content;
        const user = this.upsertUser(this.getUser(this.client!.info.owner.id)!, content);

        return builder.owner(content, user, operatorComment.link);
      } else {
        let content: string;
        let type: SystemMessageType;

        if (payload.value.enquete != null) {
          if (payload.value.enquete.choices.length === 0) return;
          type = "enquete";
          content = payload.value.enquete.choices[0].perMille == null
            ? "【アンケート開始】" : "【アンケート結果】";
          content += payload.value.enquete.question;
          for (let i = 0; i < payload.value.enquete.choices.length; i++) {
            const choice = payload.value.enquete.choices[i];
            content += `\n　${i}:`;
            if (choice.perMille != null) content += `${choice.perMille / 10}% `;
            content += choice.description;
          }
        } else
          return;

        return builder.system(content, type);
      }
    } else
      return;
  }

  /**
   * ユーザー情報を更新する
   * @returns `this.messages` から取り出したユーザー
   */
  private upsertUser(user: NicoliveUser, comment: string, no?: number): NicoliveUser {
    const isNew = this.getUser(user.storageUser.id) == null;
    if (isNew) {
      this.users[user.storageUser.id] = user;
    }

    // this.messages から返すことで svelte の更新のルールに則る
    user = this.users[user.storageUser.id];

    if (no != null && (user.firstNo == null || no < user.firstNo)) {
      user.firstNo = no;
      if (user.is184) user.noName184 = `${no}コメ`;
    }

    const koteyobi = parseKotehanAndYobina(comment);

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

  private onFirstComment(user: NicoliveUser) {
    this._cleanupAutoUpdateComentCss.push(autoUpdateCommentCss(user.storageUser.id));
  }

  private createOwner() {
    const { id, name } = this.client!.info.owner;
    this.upsertUser(
      NicoliveUser.create(id!, false, name, undefined),
      ""
    );
  }
}

export const Nicolive = new _Nicolive();

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
  client.onState.on((event, description) => {
    if (typeof description === "object")
      console.log(`wsClient: ${event}  desc:${description}  ${NicoliveDisconectReasonDescription[description[1]]}`);
    else console.log(`wsClient: ${event}  desc:${description}`);
  });
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
