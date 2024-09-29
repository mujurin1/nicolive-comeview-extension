<script lang="ts">
  import { settingViewStore } from "./Setting.svelte";

  let { highlightItems = $bindable() }: { highlightItems: string[] } = $props();
</script>

<div class="line">
  <div style:font-size="0.7rem" class="explanation from-next">
    ←このアイコンのある項目を変更しても取得済みのコメントには適用されません
  </div>
</div>

<div class="line" class:highlight={highlightItems.includes("general-kotehan")}>
  <input id="user-kotehan" type="checkbox" bind:checked={$settingViewStore.general.useKotehan} />
  <label class="explanation from-next" for="user-kotehan">コテハンを使用する　(@コテハン)</label>
  <details class="hint">
    <summary>「@コテハン」でコテハンを設定できます</summary>
    <div>@の直後が空白文字なら、コテハンが削除されます</div>
    <div>（正確には１つめの「@文字列」がコテハンになります）</div>
  </details>
</div>

<div class="line" class:highlight={highlightItems.includes("general-yobina")}>
  <input id="user-yobina" type="checkbox" bind:checked={$settingViewStore.general.useYobina} />
  <label class="explanation from-next" for="user-yobina">呼び名機能を使う　(@@呼び名)</label>
  <details class="hint">
    <summary>見た目の名前と読み上げられる名前を変えるための機能です</summary>
    <div>「@@呼び名」で表示名とは別に呼び名を設定できます</div>
    <div>@@の直後が空白文字なら、呼び名が削除されます</div>
    <div>（正確には２つめの「@文字列」が呼び名になります）</div>
    <div>※実験的機能です。次のバージョンから無くなるかもしれません</div>
  </details>
</div>

<div class="line" class:highlight={highlightItems.includes("general-184no")}>
  <input id="name-184no" type="checkbox" bind:checked={$settingViewStore.general.nameToNo} />
  <label class="explanation" for="name-184no">184の表示名をコメ番にする</label>
  <div class="hint">184の表示名はその人の最初のコメント番号になります</div>
</div>

<div class="line" class:highlight={highlightItems.includes("general-previous")}>
  <input
    id="fetch-connecting-backward"
    type="checkbox"
    bind:checked={$settingViewStore.general.fetchConnectingBackward}
  />
  <label class="explanation" for="fetch-connecting-backward">
    接続時に過去コメントを取得する (リアルタイム時)
  </label>
  <div class="hint">タイムシフト接続時はこの設定に関わらず過去コメントを取得します</div>
</div>

<div class="line" class:highlight={highlightItems.includes("general-url")}>
  <input id="url-to-link" type="checkbox" bind:checked={$settingViewStore.general.urlToLink} />
  <label class="explanation" for="url-to-link">URLを含むコメントをリンクにする</label>
  <div class="hint">URLを含む特殊なコメントまたはURLが含まれている場合にリンクになります</div>
</div>

<div class="line" class:highlight={highlightItems.includes("general-sharp")}>
  <input id="hide-sharp" type="checkbox" bind:checked={$settingViewStore.general.hideSharp} />
  <div>
    <label class="explanation" for="hide-sharp">
      シャープ(♯ # ＃)を含むコメントを隠す＆読み上げない
    </label>
  </div>
  <div class="hint">用途: ボドゲや初見プレイなどでリスナー同士で考察するとき</div>
</div>
