<script lang="ts">
  import { SpeachNameItems, YomiageTypes } from "../../store/SettingStore.svelte";
  import { settingViewStore } from "../view";

  let { highlightItems = $bindable() }: { highlightItems: string[] } = $props();
</script>

<div class="line">
  <div style:font-size="0.7rem" class="explanation no-share">
    ←このアイコンのある項目を変更しても同時に開いているウィンドウには反映されません
  </div>
</div>

<div
  style:margin-bottom="30px"
  class="line"
  class:highlight={highlightItems.includes("yomiage-speach")}
>
  <input id="is-speach" type="checkbox" bind:checked={$settingViewStore.yomiage.isSpeak} />
  <label class="explanation no-share" for="is-speach">コメントを読み上げる</label>
</div>

<div class="line">
  <fieldset class:highlight={highlightItems.includes("yomiage-name")}>
    <legend>名前の読み上げ位置</legend>
    <select bind:value={$settingViewStore.yomiage.isSpeachName}>
      <option value="none">読み上げない</option>
      <option value="mae">コメントの前</option>
      <option value="ato">コメントの後</option>
    </select>
  </fieldset>
</div>

<div class="line">
  <div>
    <fieldset class:highlight={highlightItems.includes("yomiage-type")}>
      <legend>読み上げる名前のタイプ (右側の項目を優先します)</legend>

      <div class="select-area">
        {#each SpeachNameItems as speachNameType (speachNameType)}
          {@const selected = $settingViewStore.yomiage.speachNames[speachNameType]}
          <button
            class="select-btn"
            data-selected={selected}
            onclick={() => ($settingViewStore.yomiage.speachNames[speachNameType] = !selected)}
            type="button"
          >
            {speachNameType}
          </button>
        {/each}
        <button
          class="select-btn"
          data-selected={$settingViewStore.general.useYobina}
          disabled
          title="「一般 > 呼び名機能を使う」で変更できます"
          type="button"
        >
          呼び名
        </button>
      </div>
    </fieldset>
    {#if $settingViewStore.yomiage.speachNames["コメ番"] && !$settingViewStore.general.nameToNo}
      <div class="hint warning">
        ※コメ番は名前として使用されません「一般 >
        184の表示名をコメ番にする」も有効にする必要があります
      </div>
    {/if}
    {#if $settingViewStore.yomiage.speachNames["コテハン"] && !$settingViewStore.general.useKotehan}
      <div class="hint warning">
        ※コテハンは名前として使用されません「一般 > コテハンを使用する」も有効にする必要があります
      </div>
    {/if}
    <div class="hint">呼び名は「一般 > 呼び名機能を使う」設定で切り替えられます</div>
    <div class="hint">コメントの名前として使われる項目を選択します</div>
  </div>
</div>

<div class="line">
  <div>
    <h3 style:margin-bottom="0">使用する読み上げ</h3>
    <div class="hint">VOICEVOX は対応予定。現在は利用不可です</div>
  </div>

  <div style:display="flex" class:highlight={highlightItems.includes("yomiage-use")}>
    {#each YomiageTypes as yomi (yomi)}
      {@const selected = $settingViewStore.yomiage.useYomiage === yomi}
      {@const disabled = yomi === "VOICEVOX"}
      <input
        id={yomi}
        name="contact"
        checked={selected}
        {disabled}
        onclick={() => ($settingViewStore.yomiage.useYomiage = yomi)}
        type="radio"
        value={yomi}
      />
      <label class:disabled for={yomi}>{yomi}</label>
    {/each}
  </div>
</div>

{#if $settingViewStore.yomiage.useYomiage === "棒読みちゃん"}
  <fieldset>
    <legend>棒読みちゃんPORT</legend>
    <input type="number" bind:value={$settingViewStore.bouyomiChan.port} />
  </fieldset>
{:else if $settingViewStore.yomiage.useYomiage === "VOICEVOX"}
  <div></div>
{/if}
