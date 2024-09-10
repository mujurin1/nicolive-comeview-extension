<script lang="ts">
  import { SpeachNameItems, YomiageTypes } from "../../store/SettingStore.svelte";
  import { settingStore } from "./Setting.svelte";

  let { highlightItems = $bindable() }: { highlightItems: string[] } = $props();
</script>

<div
  class="line"
  class:highlight={highlightItems.includes("yomiage-speach")}
  style="margin-bottom: 30px;"
>
  <input type="checkbox" id="is-speach" bind:checked={$settingStore.yomiage.isSpeak} />
  <label for="is-speach">コメントを読み上げる</label>
</div>

<fieldset class:highlight={highlightItems.includes("yomiage-name")}>
  <legend>名前の読み上げ位置</legend>
  <select bind:value={$settingStore.yomiage.isSpeachName}>
    <option value="none">読み上げない</option>
    <option value="mae">コメントの前</option>
    <option value="ato">コメントの後</option>
  </select>
</fieldset>

<div>
  <fieldset class:highlight={highlightItems.includes("yomiage-type")}>
    <legend>読み上げる名前のタイプ (右側の項目を優先します)</legend>

    <div style="display: flex;">
      {#each SpeachNameItems as speachNameType (speachNameType)}
        {@const selected = $settingStore.yomiage.speachNames[speachNameType]}
        <button
          class="select-btn"
          data-selected={selected}
          type="button"
          onclick={() => ($settingStore.yomiage.speachNames[speachNameType] = !selected)}
        >
          {speachNameType}
        </button>
      {/each}
      <button
        class="select-btn"
        data-selected={$settingStore.general.useYobina}
        type="button"
        title="「一般 > 呼び名機能を使う」で変更できます"
        disabled
      >
        呼び名
      </button>
    </div>
  </fieldset>
  {#if $settingStore.yomiage.speachNames["コメ番"] && !$settingStore.general.nameToNo}
    <div class="hint warning">
      ※コメ番は名前として使用されません「一般 >
      184の表示名をコメ番にする」も有効にする必要があります
    </div>
  {/if}
  {#if $settingStore.yomiage.speachNames["コテハン"] && !$settingStore.general.useKotehan}
    <div class="hint warning">
      ※コテハンは名前として使用されません「一般 > コテハンを使用する」も有効にする必要があります
    </div>
  {/if}
  <div class="hint">呼び名は「一般 > 呼び名機能を使う」設定で切り替えられます</div>
  <div class="hint">コメントの名前として使われる項目を選択します</div>
</div>

<div class="line" class:highlight={highlightItems.includes("yomiage-system")}>
  <input type="checkbox" id="speak-system" bind:checked={$settingStore.yomiage.speachSystem} />
  <label for="speak-system">システムメッセージの読み上げ</label>
</div>

<div class="line">
  <div>
    <h3 style="margin-bottom: 0;">使用する読み上げ</h3>
    <div class="hint">VOICEVOX は対応予定。現在は利用不可です</div>
  </div>

  <div style="display: flex;" class:highlight={highlightItems.includes("yomiage-use")}>
    {#each YomiageTypes as yomi (yomi)}
      {@const selected = $settingStore.yomiage.useYomiage === yomi}
      {@const disabled = yomi === "VOICEVOX"}
      <input
        type="radio"
        id={yomi}
        name="contact"
        value={yomi}
        onclick={() => ($settingStore.yomiage.useYomiage = yomi)}
        checked={selected}
        {disabled}
      />
      <label class:disabled for={yomi}>{yomi}</label>
    {/each}
  </div>
</div>

{#if $settingStore.yomiage.useYomiage === "棒読みちゃん"}
  <fieldset>
    <legend>棒読みちゃんPORT</legend>
    <input type="number" bind:value={$settingStore.bouyomiChan.port} />
  </fieldset>
{:else if $settingStore.yomiage.useYomiage === "VOICEVOX"}
  <div></div>
{/if}

<style>
  .select-btn {
    border-radius: 0;
    border: 2px solid black;
    border-color: #f9f9f954;
    color: ghostwhite;
    font-size: 1rem;

    &:not(:last-child) {
      margin-right: 3px;
    }

    &[data-selected="true"] {
      background-color: #4889f4;
    }
    &[data-selected="false"] {
      background-color: #f2686f;
      background-color: #888888;
    }
    &[disabled] {
      filter: contrast(70%);
    }
  }
</style>
