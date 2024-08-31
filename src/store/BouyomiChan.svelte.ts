import { extentionStateHolder } from "./store.svelte";

export class BouyomiChan {
  public static get port() { return extentionStateHolder.state.bouyomiChan.port; }
  public static set port(value) { extentionStateHolder.state.bouyomiChan.port = value; }
  public static get isSpeak() { return extentionStateHolder.state.yomiage.isSpeak; }
  public static set isSpeak(value) { extentionStateHolder.state.yomiage.isSpeak = value; }
  public static get speakName() { return extentionStateHolder.state.yomiage.speachName; }
  public static set speakName(value) { extentionStateHolder.state.yomiage.speachName = value; }
  public static get speakSystem() { return extentionStateHolder.state.yomiage.speachSystem; }
  public static set speakSystem(value) { extentionStateHolder.state.yomiage.speachSystem = value; }

  public static switchSpeak() {
    BouyomiChan.isSpeak = !BouyomiChan.isSpeak;
  }

  public static async speak(content: string, name: string | null, forceSpeak = false) {
    if (!forceSpeak && !extentionStateHolder.state.yomiage.isSpeak) return;

    if (name != null) {
      if (BouyomiChan.speakName === "mae") content = name + "。" + content;
      else if (BouyomiChan.speakName === "ato") content = content + "。" + name;
    }

    content = encodeURIComponent(content);

    await fetch(`http://localhost:${BouyomiChan.port}/talk?text=${content}`);
  }
}

