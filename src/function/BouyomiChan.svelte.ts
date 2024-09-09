import { SettingStore } from "../store/SettingStore.svelte";

export const BouyomiChan = {
  async speak(content: string, name: string | undefined, forceSpeak = false) {
    if (!forceSpeak && !SettingStore.state.yomiage.isSpeak) return;

    if (name != null) {
      if (SettingStore.state.yomiage.isSpeachName === "mae") content = `${name}。${content}`;
      else if (SettingStore.state.yomiage.isSpeachName === "ato") content = `${content}。${name}`;
    }

    await fetch(`http://localhost:${SettingStore.state.bouyomiChan.port}/talk?text=${encodeURIComponent(content)}`);
  }
} as const;
