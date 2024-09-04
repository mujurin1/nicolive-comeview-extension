<script lang="ts">
  import { BouyomiChan } from "../../store/BouyomiChan.svelte";
  import { SpeachNameType, YomiageTypes } from "../../store/data";
  import { store } from "../../store/store.svelte";
  import { settingStore } from "../Setting.svelte";

  let bouyomiTest = $state<"none" | "try" | "miss" | "ok">("none");

  function testSpeak() {
    bouyomiTest = "try";
    BouyomiChan.speak("テストです", "ユーザー名", true)
      .then(() => (bouyomiTest = "ok"))
      .catch(() => (bouyomiTest = "miss"));
  }
</script>

<div class="line" style="margin-bottom: 30px;">
  <input type="checkbox" id="is-speak" bind:checked={$settingStore.yomiage.isSpeak} />
  <label for="is-speak">コメントを読み上げる</label>
</div>

<fieldset>
  <legend>名前の読み上げ位置</legend>
  <select bind:value={$settingStore.yomiage.speachName}>
    <option value="none">読み上げない</option>
    <option value="mae">コメントの前</option>
    <option value="ato">コメントの後</option>
  </select>
</fieldset>

<div>
  <fieldset>
    <legend>読み上げる名前のタイプ (右側の項目を優先します)</legend>

    <div style="display: flex;">
      {#each SpeachNameType as speachName (speachName)}
        {@const selected = $settingStore.yomiage.speachNameTypes[speachName]}
        <button
          class="select-btn"
          data-selected={selected}
          type="button"
          onclick={() => store.switchSpeachName(speachName)}
        >
          {speachName}
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
  {#if $settingStore.yomiage.speachNameTypes["コメ番"] && !$settingStore.general.nameToNo}
    <div class="hint warning">
      コメ番は名前として使用されません「一般 > 184の表示名をコメ番にする」も有効にする必要があります
    </div>
  {/if}
  {#if $settingStore.yomiage.speachNameTypes["コテハン"] && !$settingStore.general.useKotehan}
    <div class="hint warning">
      コテハンは名前として使用されません「一般 > コテハンを使用する」も有効にする必要があります
    </div>
  {/if}
  <div class="hint">呼び名は「一般 > 呼び名機能を使う」設定で切り替えられます</div>
  <div class="hint">呼び名があるときだけそれを名前として読み上げたい時のための項目です</div>
</div>

<div class="line">
  <input type="checkbox" id="speak-system" bind:checked={$settingStore.yomiage.speachSystem} />
  <label for="speak-system">システムメッセージの読み上げ</label>
</div>

<!-- <div class="line">
  <button type="button" onclick={testSpeak}>読み上げテスト</button>
  {#if bouyomiTest === "try"}
    <span>棒読みちゃんに接続中...</span>
  {:else if bouyomiTest === "ok"}
    <span>棒読みちゃん読み上げ成功 😊</span>
  {:else if bouyomiTest === "miss"}
    <span>棒読みちゃん読み上げ失敗 😭</span>
  {/if}
</div> -->

<div class="line">
  <div>
    <h3 style="margin-bottom: 0;">使用する読み上げ</h3>
    <div class="hint">VOICEVOX は対応予定。現在は利用不可です</div>
  </div>

  <div style="display: flex;">
    {#each YomiageTypes as yomi (yomi)}
      {@const selected = $settingStore.yomiage.use === yomi}
      {@const disabled = yomi === "VOICEVOX"}
      <input
        type="radio"
        id={yomi}
        name="contact"
        value={yomi}
        onclick={() => store.setUseYomiage(yomi)}
        checked={selected}
        {disabled}
      />
      <label class:disabled for={yomi}>{yomi}</label>
    {/each}
  </div>
</div>

{#if $settingStore.yomiage.use === "棒読みちゃん"}
  <fieldset>
    <legend>棒読みちゃんPORT</legend>
    <input type="number" bind:value={$settingStore.bouyomiChan.port} />
  </fieldset>
{:else if $settingStore.yomiage.use === "VOICEVOX"}
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
