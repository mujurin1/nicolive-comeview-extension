import { BouyomiChan } from "../function/BouyomiChan";
import type { NceMessage, NicoliveMessage } from "../Platform";
import { SettingStore, checkVisibleSpeachType_Speach } from "../store/SettingStore.svelte";



export function speach(message: NceMessage) {
  if (
    message.platformId === "nicolive" &&
    !isSpeachNicolive(message)
  ) return;

  let name: string | undefined;
  if (message.kind !== "system") {
    const storeUser = message.user.storageUser;
    if (SettingStore.state.general.useYobina && storeUser.yobina != null) name = storeUser.yobina;
    else if (SettingStore.state.yomiage.speachNames.コテハン && SettingStore.state.general.useKotehan && storeUser.kotehan != null) name = storeUser.kotehan;
    else if (SettingStore.state.yomiage.speachNames.コメ番 && SettingStore.state.general.nameToNo && message.user?.noName184 != null) name = message.user.noName184;
    else if (SettingStore.state.yomiage.speachNames.ユーザー名 && storeUser.name != null) name = storeUser.name;
  }

  void BouyomiChan.speak(message.content, name);
}

function isSpeachNicolive(message: NicoliveMessage) {
  if (message.kind === "user") {
    if (SettingStore.state.general.hideSharp && message.includeSharp) return false;
    if (message.is184 && !checkVisibleSpeachType_Speach(SettingStore.state.nicolive.visibleAndYomiage["184"])) return false;
  } else if (message.kind === "system") {
    const check = SettingStore.state.nicolive.visibleAndYomiage.system[message.systemMessageType];
    if (!checkVisibleSpeachType_Speach(check)) return false;
  }

  return true;
}
