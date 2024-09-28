export * from "./NicoliveType";

import { type dwango, getNicoliveId, type INicoliveServerConnector, isAbortError, type NicoliveMessageServerConnector, type NicolivePageData, NicoliveUtility, type NicoliveWsServerConnector, sleep, timestampToMs } from "@mujurin/nicolive-api-ts";
import { BouyomiChan } from "../function/BouyomiChan";
import { autoUpdateCommentCss } from "../function/CssStyle.svelte";
import { MessageStore } from "../store/MessageStore.svelte";
import { checkVisibleSpeachType_Speach, SettingStore } from "../store/SettingStore.svelte";
import { StorageUserStore } from "../store/StorageUserStore.svelte";
import { timeString } from "../utils";
import { ExtMessenger } from "./Extention.svelte";
import { NicoliveMessage, NicoliveUser, type SystemMessageType } from "./NicoliveType";


class _Nicolive {
  /** 接続開始時の過去コメを読み上げないためのフラグ */
  private _canSpeak = false;
  /** ストアを監視してCSSを更新する機能のクリーンアップ関数 */
  private _cleanupAutoUpdateComentCss: (() => void)[] = [];
  // private client: NicoliveClient;
  // private erroredDelayGenerator = delayMsGenerator();

  public state = $state<"none" | "connecting" | "opened" | "reconnecting" | "closed">("none");
  public pageData = $state<NicolivePageData>();
  private wsServerConnector: NicoliveWsServerConnector | undefined;
  private msgServerConnector: NicoliveMessageServerConnector | undefined;
  private fetchingBackwardAborter: AbortController | undefined;

  public url = $state("");
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
  public canFetchBackwaardMessage = $state(true);
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

  /**
   * 放送に接続します
   * @returns 
   */
  public async connect() {
    if (this.state !== "none" && this.state !== "closed") return;
    if (!this.fixUrl()) return;

    this.state = "connecting";
    ExtMessenger.add("せつぞくちゅ～");

    try {
      await this.setupConnector();

      this.state = "opened";
      if (SettingStore.state.general.fetchConnectingBackward)
        await this.fetchBackword(1);

      await this.connectReaderWaitAnyClose();
    } catch (e) {
      // TODO: 例外メッセージの通知
      throw e;
    } finally {
      this.close();
    }
  }

  public close() {
    if (this.state === "none" || this.state === "closed") return;
    this.state = "closed";

    this.wsServerConnector?.getAbortController()?.abort();
    this.msgServerConnector?.getAbortController()?.abort();
  }

  public async reconnect() {
    if (this.state !== "none" && this.state !== "closed") return;
    if (this.wsServerConnector == null || this.msgServerConnector == null) return;
    this.state = "reconnecting";

    try {
      await Promise.all([
        this.wsServerConnector.reconnect(),
        this.msgServerConnector.reconnect(),
      ]);

      this.state = "opened";

      await this.connectReaderWaitAnyClose();
    } finally {
      this.close();
    }
  }

  public async fetchBackword(maxBackwords: number) {
    if (
      this.isFetchingBackwardMessage ||
      this.msgServerConnector == null ||
      !this.canFetchBackwaardMessage
    ) return;
    this.isFetchingBackwardMessage = true;

    try {
      const obj = this.msgServerConnector.getBackwardMessages(
        1e3, maxBackwords, false
      );
      if (obj == null) {
        this.canFetchBackwaardMessage = false;
        return;
      }
      this.fetchingBackwardAborter = obj.abortController;
      const [messaages, isMoreBackwards] = await obj.messagePromise;
      this.canFetchBackwaardMessage = isMoreBackwards;
      this.onMessageOld(messaages);
    } finally {
      this.fetchingBackwardAborter = undefined;
      this.isFetchingBackwardMessage = false;
    }
  }

  public stopFetchBackward() {
    this.fetchingBackwardAborter?.abort();
  }


  public async postBroadcasterComment(comment: string) {
    if (this.state !== "opened") return;
    this.pageData!.postBroadcasterComment(comment);
  }
  public async postComment(comment: string, isAnonymous: boolean) {
    this.wsServerConnector!.getWsData().postComment(comment, isAnonymous);
  }

  private async setupConnector() {
    this.pageData = await NicoliveUtility.fetchNicolivePageData(this.url);
    if (this.pageData == null) return;

    this.createOwner(this.pageData);

    this.wsServerConnector = await NicoliveUtility.createWsServerConnector(this.pageData);
    this.msgServerConnector = await this.wsServerConnector.connectMessageServer();
  }

  private async connectReaderWaitAnyClose() {
    if (this.wsServerConnector == null || this.msgServerConnector == null) return;
    await Promise.race([
      this.readWsMessage(this.wsServerConnector),
      this.readServerMessage(this.msgServerConnector),
    ]);
  }

  private async readWsMessage(wsConnector: NicoliveWsServerConnector) {
    const signal = wsConnector.getAbortController().signal;
    // MEMO: この while はエラー発生時の再接続用
    while (!signal.aborted) {
      try {
        const iter = wsConnector.getIterator();
        for await (const message of iter) {
          // message
        }
        // MEMO: イテレーターが終わるのは接続が終了したとき
        break;
      } catch (e) {
        console.warn("readWsMessage", e);
        if (isAbortError(e, signal)) break;
        // TODO: エラー通知
        console.warn("readWsMessage", e);
        if (!await tryReconnect(wsConnector)) break;
      }
    }
    console.log("readWsMessage closed");
  }

  private async readServerMessage(serverConnector: NicoliveMessageServerConnector) {
    const signal = serverConnector.getAbortController().signal;
    // MEMO: この while はエラー発生時の再接続用
    while (!signal.aborted) {
      try {
        const iter = serverConnector.getIterator();
        for await (const message of iter) {
          this.onMessage(message);
        }
        // MEMO: イテレーターが終わるのは接続が終了したとき
        break;
      } catch (e) {
        if (isAbortError(e, signal)) break;
        // TODO: エラー通知
        console.warn("readServerMessage", e);
        if (!await tryReconnect(serverConnector)) break;
      }
    }
  }

  /**
   * `url`を放送IDのみの文字列にします
   * @returns 正しいURLなら`true`
   */
  private fixUrl() {
    const liveId = getNicoliveId(this.url);
    if (liveId == null) return false;
    this.url = liveId;
    return true;
  }

  public getOwner(): NicoliveUser {
    return Nicolive.users[this.pageData!.nicoliveInfo.provider.id];
  }

  public getUser(userId: string | undefined): NicoliveUser | undefined {
    return Nicolive.users[userId!];
  }

  private readonly onMessage = (chunkedMessage: dwango.ChunkedMessage) => {
    const message = this.createMessage(chunkedMessage);
    if (message == null) return;

    this.speach(message);

    MessageStore.messages.push(message);
  };

  private speach(message: NicoliveMessage) {
    if (!this._canSpeak) return;
    if (message.kind === "user") {
      if (SettingStore.state.general.hideSharp && message.includeSharp) return;
      if (message.is184 && !checkVisibleSpeachType_Speach(SettingStore.state.nicolive.visibleAndYomiage["184"])) return;
    } else if (message.kind === "system") {
      const check = SettingStore.state.nicolive.visibleAndYomiage.system[message.systemMessageType];
      if (!checkVisibleSpeachType_Speach(check)) return;
    }

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
    // TODO: beginTime を schedule から取った値を参照する
    const time = timeString(
      timestampToMs(meta.at!) - this.pageData!.beginTime * 1e3
    );

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
          const message = data.value.message;
          if (message.case === "rankingIn" || message.case === "rankingUpdated")
            type = "ranking";
          else
            type = message.case;
          content = message.value;
        } else
          return;
        return builder.system(content, type);
      }
    } else if (payload.case === "state") {
      if (payload.value.marquee != null) {
        const operatorComment = payload.value.marquee.display?.operatorComment;
        if (operatorComment == null) return;
        const content = operatorComment.content;
        const user = this.upsertUser(this.getOwner(), content);
        const name = operatorComment.name;

        return builder.owner(content, user, name, operatorComment.link);
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
    if (StorageUserStore.nicolive.users[user.storageUser.id] != null)
      user.storageUser = StorageUserStore.nicolive.users[user.storageUser.id];

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

  private createOwner(pageData: NicolivePageData) {
    const info = pageData!.nicoliveInfo;
    const { id, name } = info.provider;
    if (id == null) return;

    this.upsertUser(
      NicoliveUser.create(id, false, name, undefined, info.provider.type),
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

  const [, kote, yobi] = reg;
  if (SettingStore.state.general.useKotehan && kote != null)
    kotehan = /\s/.test(kote) ? 0 : kote;
  if (SettingStore.state.general.useYobina && yobi != null)
    yobina = /\s/.test(yobi) ? 0 : yobi;

  if (kotehan == null && yobina == null) return undefined;
  return { kotehan, yobina };
}



async function tryReconnect(connector: INicoliveServerConnector): Promise<boolean> {
  const callFrom =
    (new Error()).stack?.split("\n")[2].trim()
      .split(" ")[1];
  console.log("tryReconnect from: ", callFrom);

  const signal = connector.getAbortController().signal;
  for (const delaySec of [5, 5, 10]) {
    try {
      await connector.reconnect();
      console.log("sucsess! from: ", callFrom);

      return true;
    } catch (e) {
      if (isAbortError(e, signal)) break;

      // TODO: エラー通知
      console.warn("tryReconnect from: ", callFrom, e);
      console.log("wait from: ", callFrom, delaySec * 1e3);
      await sleep(delaySec * 1e3);
    }
  }
  console.log("miss! from: ", callFrom);
  return false;
}

function show_dbg(message: dwango.ChunkedMessage) {
  const { meta: _meta, payload: { value, case: _case } } = message;

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


function* delayMsGenerator(): Generator<number, never, boolean> {
  const delayMsArray = [5e3, 5e3, 10e3];
  let index = 0;
  while (true) {
    const reset: boolean = yield index <= delayMsArray.length ? -1 : delayMsArray[index++];
    if (reset) index = 0;
  }
}
