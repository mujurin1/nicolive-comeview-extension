import { EventTrigger, type IEventTrigger } from "@mujurin/nicolive-api-ts";
import type { ComejeneContent } from "../comejene_share";
import { getNicoliveUserName, type NceMessage, type NceUser } from "../Platform";
import type { NceConnection } from "../Platform/NceConnection";
import { ComejeneSenderStore } from "../store/ComejeneSenderStore.svelte";
import { NceMessageStore } from "../store/NceMessageStore.svelte";
import { CommentViewCss } from "./commentViewCss";
import { speach } from "./speach";


/**
 * `NceConnection`から実行されるサービス\
 * `NceConnection`がコメントを受信した時に関連するイベントを発行する
 */
export interface NceService {
  /**
   * コメントを受信した時に実行される\
   * `[メッセージ, ]`
   */
  readonly onMessage: IEventTrigger<[NceMessage, NceConnection]>;
  /**
   * 過去コメントを受信した時に実行される
   */
  readonly onMessageOld: IEventTrigger<[NceMessage[]]>;
  /**
   * ユーザーの情報が更新された時に実行される\
   * `[ユーザー, 新規ユーザーならTrue]`
   */
  readonly onUser: IEventTrigger<[NceUser, boolean]>;
}
export const NceService: NceService = {
  onMessage: new EventTrigger(),
  onMessageOld: new EventTrigger(),
  onUser: new EventTrigger(),
};

// 全サービスイベント中で NceMessageStore の更新は必ず最初に呼ばれるべき
NceService.onMessage.on(message => NceMessageStore.messages.push(message));
NceService.onMessageOld.on(messages => NceMessageStore.messages.unshift(...messages));
// NceUserStore の更新はサービスからは行わない
// そのため NceService.onUser.emit() を呼び出された時点で NceUserStore は更新されている必要がある
// (ユーザーの情報は更新される可能性があり、更新をサービスから行うのは複雑なため)


// =========================
// 他サービスへの橋渡し
// =========================
NceService.onMessage.on((message, connection) => {
  if (connection.setting.isSpeak) speach(message);
});
NceService.onUser.on(user => CommentViewCss.hook("nicolive", user.storageUser.id));


NceService.onMessage.on((message, connection) => {
  const user = message.kind === "system" ? undefined : message.user;
  const name = message.tempName ?? user == null ? undefined : (
    message.platformId === "nicolive" ? getNicoliveUserName(user)
      : undefined
  );
  // コメジェネデバッグ用送信
  dbg_send_content({
    icon: user?.iconUrl,
    name,
    message: message.content,
  });
});

function dbg_send_content(content: ComejeneContent) {
  ComejeneSenderStore.sendContent(content);
}