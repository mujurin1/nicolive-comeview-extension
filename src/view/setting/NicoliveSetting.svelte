<script lang="ts">
  import { SystemMessageType, SystemMessageTypeDisplayName } from "../../Platform";
  import { VisibleSpeachType } from "../../store/SettingStore.svelte";
  import { settingViewStore } from "../view";

  let { highlightItems = $bindable() }: { highlightItems: string[] } = $props();
</script>

<div class="line">
  <div style:font-size="0.7rem" class="explanation no-share">
    ←このアイコンのある項目を変更しても同時に開いているウィンドウには反映されません
  </div>
</div>

<div class="line" class:highlight={highlightItems.includes("nicolive-show-post-area")}>
  <input
    id="show-post-area"
    type="checkbox"
    bind:checked={$settingViewStore.nicolive.showPostArea}
  />
  <label class="explanation no-share" for="show-post-area">コメント投稿欄を表示する</label>
  <div class="hint">ブラウザでログインている場合のみコメント投稿欄が表示されます</div>
</div>

<div class="line" class:highlight={highlightItems.includes("nicolive-post-184")}>
  <input id="post-184" type="checkbox" bind:checked={$settingViewStore.nicolive.post184} />
  <label class="explanation no-share" for="post-184">184でコメント投稿する</label>
</div>

<br />

<div class="line" class:highlight={highlightItems.includes("nicolive-184-visible")}>
  <fieldset>
    <legend>184コメントの表示/読み上げ</legend>
    <select bind:value={$settingViewStore.nicolive.visibleAndYomiage["184"]}>
      <option value={VisibleSpeachType.all}>表示する/読み上げる</option>
      <option value={VisibleSpeachType.visible}>表示する/読み上げない</option>
      <option value={VisibleSpeachType.none}>表示しない</option>
    </select>
  </fieldset>
</div>

<div class="line">
  <div></div>
  <div style:font-weight="bold" style:margin-top="10px">
    システムメッセージの表示/読み上げを個別に設定できます
  </div>
  <div class="hint">表示しない項目は読み上げられません</div>
</div>

<div class="line">
  <fieldset class:highlight={highlightItems.includes("nicolive-system-visible")}>
    <legend>表示するシステムメッセージ</legend>

    <div style:flex-wrap="wrap" class="select-area">
      {#each SystemMessageType as systemMessageType (systemMessageType)}
        {@const selected =
          0 !==
          ($settingViewStore.nicolive.visibleAndYomiage.system[systemMessageType] &
            VisibleSpeachType.visible)}
        <button
          class="select-btn"
          data-selected={selected}
          onclick={() =>
            ($settingViewStore.nicolive.visibleAndYomiage.system[systemMessageType] ^=
              VisibleSpeachType.visible)}
          type="button"
        >
          {SystemMessageTypeDisplayName[systemMessageType]}
        </button>
      {/each}
    </div>
  </fieldset>
</div>

<div class="line">
  <fieldset class:highlight={highlightItems.includes("nicolive-system-yomiage")}>
    <legend>読み上げるシステムメッセージ</legend>

    <div style:flex-wrap="wrap" class="select-area">
      {#each SystemMessageType as systemMessageType (systemMessageType)}
        {@const selected =
          0 !==
          ($settingViewStore.nicolive.visibleAndYomiage.system[systemMessageType] &
            VisibleSpeachType.yomiage)}
        {@const disabled =
          0 ===
          ($settingViewStore.nicolive.visibleAndYomiage.system[systemMessageType] &
            VisibleSpeachType.visible)}
        <button
          class="select-btn"
          data-selected={selected}
          {disabled}
          onclick={() =>
            ($settingViewStore.nicolive.visibleAndYomiage.system[systemMessageType] ^=
              VisibleSpeachType.yomiage)}
          title={disabled ? "表示しない項目は読み上げません" : ""}
          type="button"
        >
          {SystemMessageTypeDisplayName[systemMessageType]}
        </button>
      {/each}
    </div>
  </fieldset>
</div>
