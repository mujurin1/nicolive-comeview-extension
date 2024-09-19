<script lang="ts">
  import { SystemMessageType, SystemMessageTypeDisplayName } from "../../Platform";
  import { VisibleSpeachType } from "../../store/SettingStore.svelte";
  import { settingViewStore } from "./Setting.svelte";

  let { highlightItems = $bindable() }: { highlightItems: string[] } = $props();
</script>

<div class="line">
  <div class="explanation no-share" style="font-size: 0.7rem;">
    ←このアイコンのある項目を変更しても同時に開いているウィンドウには反映されません
  </div>
</div>

<div class="line" class:highlight={highlightItems.includes("nikolive-show-post-area")}>
  <input
    type="checkbox"
    id="show-post-area"
    bind:checked={$settingViewStore.nicolive.showPostArea}
  />
  <label class="explanation no-share" for="show-post-area">コメント投稿欄を表示する</label>
  <div class="hint">ブラウザでログインている場合のみコメント投稿欄が表示されます</div>
</div>

<div class="line" class:highlight={highlightItems.includes("nikolive-post-184")}>
  <input type="checkbox" id="post-184" bind:checked={$settingViewStore.nicolive.post184} />
  <label class="explanation no-share" for="post-184">184でコメント投稿する</label>
</div>

<br />

<div class="line" class:highlight={highlightItems.includes("nikolive-184-visible")}>
  <fieldset class:highlight={highlightItems.includes("nikolive-yomiage-name")}>
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
  <div style="font-weight: bold; margin-top: 10px;">
    システムメッセージの表示/読み上げを個別に設定できます
  </div>
  <div class="hint">表示しない項目は読み上げられません</div>
</div>

<div class="line">
  <fieldset class:highlight={highlightItems.includes("nikolive-system-visible")}>
    <legend>表示するシステムメッセージ</legend>

    <div class="select-area" style="flex-wrap: wrap;">
      {#each SystemMessageType as systemMessageType (systemMessageType)}
        {@const selected =
          0 !==
          ($settingViewStore.nicolive.visibleAndYomiage.system[systemMessageType] &
            VisibleSpeachType.visible)}
        <button
          class="select-btn"
          data-selected={selected}
          type="button"
          onclick={() =>
            ($settingViewStore.nicolive.visibleAndYomiage.system[systemMessageType] ^=
              VisibleSpeachType.visible)}
        >
          {SystemMessageTypeDisplayName[systemMessageType]}
        </button>
      {/each}
    </div>
  </fieldset>
</div>

<div class="line">
  <fieldset class:highlight={highlightItems.includes("nikolive-system-visible")}>
    <legend>読み上げるシステムメッセージ</legend>

    <div class="select-area" style="flex-wrap: wrap;">
      {#each SystemMessageType as systemMessageType (systemMessageType)}
        {@const selected =
          0 !==
          ($settingViewStore.nicolive.visibleAndYomiage.system[systemMessageType] &
            VisibleSpeachType.visible)}
        {@const disabled =
          0 ===
          ($settingViewStore.nicolive.visibleAndYomiage.system[systemMessageType] &
            VisibleSpeachType.yomiage)}
        <button
          class="select-btn"
          data-selected={selected}
          type="button"
          onclick={() =>
            ($settingViewStore.nicolive.visibleAndYomiage.system[systemMessageType] ^=
              VisibleSpeachType.yomiage)}
          title={disabled ? "表示しない項目は読み上げません" : ""}
          {disabled}
        >
          {SystemMessageTypeDisplayName[systemMessageType]}
        </button>
      {/each}
    </div>
  </fieldset>
</div>
