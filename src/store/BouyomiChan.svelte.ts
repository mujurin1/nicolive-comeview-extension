import { store } from "./store.svelte";

export const BouyomiChan = {
  async speak(content: string, name: string | undefined, forceSpeak = false) {
    if (!forceSpeak && !store.state.yomiage.isSpeak) return;

    if (name != null) {
      if (store.state.yomiage.isSpeachName === "mae") content = `${name}。${content}`;
      else if (store.state.yomiage.isSpeachName === "ato") content = `${content}。${name}`;
    }

    await fetch(`http://localhost:${store.state.bouyomiChan.port}/talk?text=${encodeURIComponent(content)}`);
  }
} as const;
