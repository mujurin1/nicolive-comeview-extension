export * from "./NicoliveType";

import { type AbortAndPromise, type INicoliveServerConnector, type NicoliveId, type NicoliveMessageServerConnector, type NicolivePageData, NicoliveRejectReason, NicoliveRejectReasonDisplay, NicoliveUtility, NicoliveWebSocketReconnectError, type NicoliveWsServerConnector, abortErrorWrap, type dwango, getNicoliveId, isAbortError, promiser, sleep, timestampToMs } from "@mujurin/nicolive-api-ts";
import { NceService } from "../service/NceService";
import { NceUserStore } from "../store/NceStore.svelte";
import { SettingStore } from "../store/SettingStore.svelte";
import { StorageUserStore } from "../store/StorageUserStore.svelte";
import { timeString } from "../utils";
import { ExtMessenger, type ExtentionMessage } from "./Extention.svelte";
import type { NceConnection, NceConnectionSetting, NceConnectionState } from "./NceConnection";
import { NicoliveMessage, NicoliveUser, type SystemMessageType } from "./NicoliveType";

export class NicoliveConnection implements NceConnection<"nicolive"> {
  public readonly connectionId: string;
  public get state() { return this._connector?.state ?? "none"; }
  public setting = $state<NceConnectionSetting>({ isSpeak: true });
  public get canFetchBackward() { return this._connector?.canFetchBackward ?? false; }
  public isFetchingBackward: boolean = false;
  public messages = $state<NicoliveMessage[]>([]);

  public connectionName = $state("name");
  public url = $state("");
  public isSpeack = true;

  private _connector = $state<Connector>();

  public get pageData() { return this._connector?.pageData; }

  public constructor(id: string) {
    this.connectionId = id;
  }

  public async connect(): Promise<boolean> {
    if (this._connector == null) {
      const liveId = getNicoliveId(this.url);
      if (liveId == null) return false;
      this.url = liveId;

      this._connector = new Connector(
        this.connectionId,
        liveId,
        this.onMessage,
        this.onMessageOld,
      );
    }

    if (!await this._connector.connect()) return false;

    // 接続完了
    this._connector.connectPromise!
      .finally(() => ExtMessenger.add("接続を終了しました"))
      .catch((e: unknown) => ExtMessenger.addMessage("エラーが発生したので接続を終了します", `${e}`));

    return true;
  }

  public async reconnect(): Promise<boolean> {
    if (this._connector == null) return false;
    if (!await this._connector.reconnect()) return false;

    // 再接続完了
    ExtMessenger.add("再接続しました");
    this._connector.connectPromise!
      .finally(() => ExtMessenger.add("接続を終了しました"))
      .catch((e: unknown) => ExtMessenger.addMessage("エラーが発生したので接続を終了します", `${e}`));

    return true;
  }

  public close() {
    this._connector?.close();
  }

  public getOwner() {
    const id = this._connector?.pageData?.nicoliveInfo.provider.id;
    return NceUserStore.nicolive.get(id);
  }

  public fetchBackword(maxBackwords: number) {
    return this._connector?.fetchBackword(maxBackwords);
  }
  public stopFetchBackward() {
    this._connector?.stopFetchBackward();
  }
  public postBroadcasterComment(comment: string) {
    return this._connector?.postBroadcasterComment(comment);
  }
  public postComment(comment: string, isAnonymous: boolean) {
    return this._connector?.postComment(comment, isAnonymous);
  }

  private readonly onMessage = (message: NicoliveMessage) => {
    this.messages.push(message);
    NceService.onMessage.emit(message, this);
  };
  private readonly onMessageOld = (messages: NicoliveMessage[]) => {
    this.messages.unshift(...messages);
    NceService.onMessageOld.emit(messages);
  };
}

export const Nicolive = new NicoliveConnection("id");

// TODO: 以下の適切な場所について考える
StorageUserStore.nicolive.updated.on("remove", userId => {
  const user = NceUserStore.nicolive.get(userId);
  if (user == null) return;

  user.storageUser = {
    id: user.storageUser.id,
    name: user.storageUser.name,
  };
});
StorageUserStore.nicolive.updated.on("new", user => {
  const userState = NceUserStore.nicolive.get(user.id);
  if (userState == null) return;
  userState.storageUser = user;
});


class Connector {
  /** 過去コメントの取得を中断するためのもの */
  private fetchingBackwardAborter: AbortController | undefined;
  /** 接続施行中に中断するためのもの */
  private connectingAbort: AbortController | undefined;
  /** ニコ生ウェブソケットコネクタ */
  private wsServerConnector: NicoliveWsServerConnector | undefined;
  /** ニコ生メッセージサーバーコネクタ */
  private msgServerConnector: NicoliveMessageServerConnector | undefined;
  public pageData = $state<NicolivePageData>();

  public canFetchBackward = $state<boolean>(false);
  public isFetchingBackward = $state<boolean>(false);
  public state = $state<NceConnectionState>("none");
  public connectPromise: Promise<void> | undefined;


  public constructor(
    /** 接続ごとに固有なID */
    public readonly connectionId: string,
    public readonly liveId: NicoliveId,
    public readonly onMessage: (message: NicoliveMessage) => void,
    public readonly onOldMessage: (messages: NicoliveMessage[]) => void,
  ) { }

  public async connect() {
    if (this.state !== "none" && this.state !== "closed") return false;

    const connect = promiser();
    this.connectPromise = this._connect(connect.resolve);

    await connect.promise;
    return true;
  }

  private async _connect(opened: () => void) {
    try {
      this.pageData = await this.setAbort(NicoliveUtility.fetchNicolivePageData(this.liveId));
      if (this.checkReject(this.pageData)) return;
      await this.setupConnector(this.pageData);
      createOwner(this.pageData!);
      await this.onOpen(true);
      opened();
      await this.connectReaderWaitAnyClose();
    } finally {
      opened();
      this.connectPromise = undefined;
      this.close();
    }
  }

  public async reconnect() {
    if (this.state !== "none" && this.state !== "closed") return false;
    if (this.wsServerConnector == null || this.msgServerConnector == null) return false;
    this.state = "reconnecting";

    const connect = promiser();
    this.connectPromise = this._reconnect(
      connect.resolve,
      this.wsServerConnector,
      this.msgServerConnector,
    );

    await connect.promise;
    return true;
  }

  private async _reconnect(
    opened: () => void,
    wsConnector: NicoliveWsServerConnector,
    msgConnector: NicoliveMessageServerConnector,
  ) {
    try {
      if (wsConnector.isClosed()) {
        const { abortController, promise } = wsConnector.reconnect();
        this.connectingAbort = abortController;
        await promise;
      }
      if (msgConnector.isClosed()) {
        const { abortController, promise } = msgConnector.reconnect();
        this.connectingAbort = abortController;
        await promise;
      }
      this.connectingAbort = undefined;

      await this.onOpen(false);
      opened();

      await this.connectReaderWaitAnyClose();
    } finally {
      opened();
      this.connectPromise = undefined;
      this.connectingAbort = undefined;
      this.close();
    }
  }


  public close() {
    if (this.state === "none" || this.state === "closed") return;
    this.state = "closed";

    this.connectingAbort?.abort();
    this.wsServerConnector?.getAbortController().abort();
    this.msgServerConnector?.getAbortController().abort();
  }

  private async setupConnector(pageData: NicolivePageData) {
    try {
      this.wsServerConnector = await this.setAbort(NicoliveUtility.createWsServerConnector(pageData));
      const msgServerData = await this.wsServerConnector.getMessageServerData();
      this.msgServerConnector = await this.setAbort(NicoliveUtility.createMessageServerConnector(msgServerData));
    } catch (e) {
      if (isAbortError(e, this.connectingAbort?.signal)) return;
      throw e;
    } finally {
      this.connectingAbort = undefined;
    }
  }

  private async onOpen(isNewConnection: boolean) {
    this.state = "opened";
    this.canFetchBackward = true;

    if (isNewConnection) {
      if (this.pageData!.status === "ENDED" || SettingStore.state.general.fetchConnectingBackward)
        await this.fetchBackword(1);
    }
  }

  private onChunkedMessage(chunkedMessages: dwango.ChunkedMessage) {
    const message = this.createMessage(chunkedMessages);
    if (message == null) return;
    this.onMessage(message);
  }

  private onChunkedMessageOld(chunkedMessages: dwango.ChunkedMessage[]) {
    const messages: NicoliveMessage[] = [];
    for (const chunkedMessage of chunkedMessages) {
      const message = this.createMessage(chunkedMessage);
      if (message == null) continue;
      messages.push(message);
    }
    this.onOldMessage(messages);
  }


  //#region 通信
  public async postBroadcasterComment(comment: string) {
    if (this.state !== "opened") return;
    await this.pageData!.postBroadcasterComment(comment);
  }
  public async postComment(comment: string, isAnonymous: boolean) {
    await this.wsServerConnector!.postComment(comment, isAnonymous);
  }

  public async fetchBackword(maxBackwords: number) {
    if (
      this.isFetchingBackward ||
      this.msgServerConnector == null ||
      !this.canFetchBackward
    ) return;
    this.isFetchingBackward = true;

    try {
      const backward = this.msgServerConnector.getBackwardMessages(
        1e3, maxBackwords, false
      );
      if (backward == null) {
        this.canFetchBackward = false;
        return;
      }
      this.fetchingBackwardAborter = backward.abortController;
      const [messaages, isMoreBackwards] = await backward.messagePromise;
      this.canFetchBackward = isMoreBackwards;
      this.onChunkedMessageOld(messaages);
    } finally {
      this.fetchingBackwardAborter = undefined;
      this.isFetchingBackward = false;
    }
  }
  public stopFetchBackward() {
    this.fetchingBackwardAborter?.abort();
  }

  private async connectReaderWaitAnyClose() {
    if (this.wsServerConnector == null || this.msgServerConnector == null) return;
    await Promise.race([
      this.readWsMessage(this.wsServerConnector),
      this.readServerMessage(this.msgServerConnector),
    ]);
  }

  private async readWsMessage(wsConnector: NicoliveWsServerConnector): Promise<void> {
    // この while はエラー発生時の再接続のため
    while (true) {
      const signal = wsConnector.getAbortController().signal;
      try {
        const iter = wsConnector.getIterator();
        for await (const _message of iter) {
          // ウェブソケットのメッセージは今は不要
          // エラーチェックのためにイテレートしている
        }
        // イテレーターが終わるのは接続が終了したとき
      } catch (e) {
        if (isAbortError(e, signal)) break;

        if (e instanceof NicoliveWebSocketReconnectError) {
          if (await this.wsReconnect(wsConnector, e)) continue;
        } else {
          ExtMessenger.addMessage(`エラー 発生元:ウェブソケット接続`, `${e}`);
          if (await this.tryReconnect(wsConnector)) continue;
        }
      }

      break;
    }
  }

  private async readServerMessage(serverConnector: NicoliveMessageServerConnector): Promise<void> {
    // この while はエラー発生時の再接続のため
    while (true) {
      const signal = serverConnector.getAbortController().signal;
      try {
        const iter = serverConnector.getIterator();
        for await (const message of iter) {
          this.onChunkedMessage(message);
        }
        // イテレーターが終わるのは接続が終了したとき
      } catch (e) {
        if (isAbortError(e, signal)) break;
        ExtMessenger.addMessage(`エラー 発生元:メッセージサーバー接続`, `${e}`);
        if (await this.tryReconnect(serverConnector)) continue;
      }

      break;
    }
  }

  private async wsReconnect(wsConnector: NicoliveWsServerConnector, e: NicoliveWebSocketReconnectError): Promise<boolean> {
    const abort = new AbortController();
    let reconnecting = true;
    ExtMessenger.add(`再接続要求を受け取ったためウェブソケットの再接続中です。${e.data.waitTimeSec}秒待機中`, {
      expandMessage: `【お願い】このエラーについて制作者は動作確認出来ていないため再接続が成功したかどうかフィードバックで教えていただけると助かります
再接続要求内容${JSON.stringify(e.data)}`,
      button: {
        text: "中断する",
        func: () => {
          if (reconnecting) abort.abort();
        }
      }
    });

    try {
      await wsConnector.reconnect(abort, e.reconnectTime).promise;
      ExtMessenger.add("再接続に成功しました");
      return true;
    } catch (e) {
      if (isAbortError(e, abort.signal)) {
        ExtMessenger.add("再接続を中断しました");
      } else {
        ExtMessenger.addMessage("再接続に失敗しました", `${e}`);
      }
    } finally {
      reconnecting = false;
    }

    return false;
  }

  private async tryReconnect(connector: INicoliveServerConnector): Promise<boolean> {
    this.state = "reconnecting";

    const abort = new AbortController();
    this.connectingAbort = abort;
    ExtMessenger.add(`再接続中…`);

    if (!connector.isClosed()) connector.getAbortController().abort();
    // コネクターが終了するまで待機する
    await connector.getPromise();

    for (const delaySec of [5, 5, 10, 20, 30, -1]) {
      try {
        const promiseSet = connector.reconnect(abort);
        await promiseSet.promise;

        this.state = "opened";
        ExtMessenger.add(`再接続: 成功. 接続を再開します`);
        return true;
      } catch (e) {
        if (isAbortError(e, abort.signal)) {
          ExtMessenger.add(`再接続: キャンセルしました`);
          break;
        }

        if (delaySec === -1) {
          ExtMessenger.addMessage(`再接続: 終了. 試行回数の上限に達しました`, `${e}`);
          break;
        }
        ExtMessenger.addMessage(`再接続: 失敗. 次の再試行まであと ${delaySec}秒`, `${e}`);
        if (await abortErrorWrap(sleep(delaySec * 1e3, abort.signal), abort.signal)) {
          ExtMessenger.add(`再接続: キャンセルしました`);
          break;
        }
      } finally {
        this.connectingAbort = undefined;
      }
    }

    return false;
  }
  //#endregion 通信


  // 
  // 以下はUtility関数
  // 

  private createMessage({ meta, payload }: dwango.ChunkedMessage) {
    if (meta == null) return;
    const messageId = meta.id;
    const time = timeString(
      timestampToMs(meta.at!) - this.wsServerConnector!.getLatestSchedule().begin.getTime()
    );
    const builder = NicoliveMessage.builder(messageId, this.connectionId, time);
    return createMessage(payload, builder, this.pageData!.nicoliveInfo.provider.id);
  }

  private checkReject(pageData: NicolivePageData): boolean {
    const rejects = pageData.nicoliveInfo.rejectedReasons;
    if (rejects.length === 0) return false;
    const display = rejects
      .map(x => `> ${NicoliveRejectReasonDisplay[x as never] ?? x}`)
      .join("\n");

    ExtMessenger.add(`次の理由で接続に失敗しました\n${display}`);

    if (rejects.includes(NicoliveRejectReason.passwordAuthRequired))
      this.requestPassword();
    return true;
  }

  private requestPassword(repeate = false) {
    ExtMessenger.add(`合言葉が${repeate ? "違います" : "必要です"}。合言葉を入力して下さい`, {
      input: {
        type: "text",
        value: "",
      },
      button: {
        text: "送信",
        func: this.setRequestPassword,
      },
    });
  }

  private readonly setRequestPassword = async (message: ExtentionMessage) => {
    if (this.state !== "closed") return;

    const password = message.input!.value;
    const result = await NicoliveUtility.postPasswordAuth(this.pageData!.nicoliveInfo.liveId, password);
    if (!result.ok) {
      this.requestPassword(true);
      return;
    }

    void this.connect();
  };

  private setAbort<T extends AbortAndPromise<any>>(value: T): T["promise"] {
    this.connectingAbort = value.abortController;
    return value.promise;
  }
}

/**
 * ユーザー情報を更新する\
 * 対象は `NceUserStore` `StorageUserStore` の `nicolive`
 * @param user 更新するユーザー
 * @param comment コメント
 * @param no コメント番号
 * @returns `NceUserStore.nicolive.users` から取り出したユーザー
 */
function upsertUser(user: NicoliveUser, comment: string, no?: number): NicoliveUser {
  const isNew = NceUserStore.nicolive.has(user.storageUser.id);
  // $state からの参照を得るための代入
  user = NceUserStore.nicolive.add(user);

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

  NceService.onUser.emit(user, isNew);

  return user;
}

function createMessage(
  payload: dwango.ChunkedMessage["payload"],
  builder: ReturnType<typeof NicoliveMessage.builder>,
  ownerId: string
): NicoliveMessage | undefined {
  if (payload.case === "message") {
    const data = payload.value.data;
    if (data.case === "chat") {
      const userId = data.value.hashedUserId ?? data.value.rawUserId + "";
      const is184 = data.value.rawUserId == null;
      let user = NceUserStore.nicolive.get(userId);
      if (user == null) {
        user = NicoliveUser.create(userId, is184, is184 ? undefined : data.value.name, data.value.no, "user");
      }

      //  この代入は user:null だった場合にも $state である NceUserStore.nicolive.users から参照を取るため
      user = upsertUser(user, data.value.content, data.value.no);
      const message = builder.user(data.value.content, user, is184, data.value.no);
      return message;
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
      const user = upsertUser(NceUserStore.nicolive.get(ownerId)!, content);
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
          // eslint-disable-next-line no-irregular-whitespace
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

function createOwner(pageData: NicolivePageData) {
  const info = pageData.nicoliveInfo;
  const { id, name } = info.provider;
  if (id == null) return;

  const owner = NicoliveUser.create(id, false, name, undefined, info.provider.type);
  upsertUser(owner, "");
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

  const [, kote, yobi] = reg;
  if (SettingStore.state.general.useKotehan && kote != null)
    kotehan = /\s/.test(kote) ? 0 : kote;
  if (SettingStore.state.general.useYobina && yobi != null)
    yobina = /\s/.test(yobi) ? 0 : yobi;

  if (kotehan == null && yobina == null) return undefined;
  return { kotehan, yobina };
}

function _show_dbg(message: dwango.ChunkedMessage) {
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
