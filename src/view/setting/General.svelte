<script lang="ts">
  import { settingStore } from "../Setting.svelte";
</script>

<div class="line">
  <div class="explanation from-next" style="font-size: 0.7rem;">
    ←このアイコンがある項目は過去のコメントに遡っては反映されません
  </div>
</div>

<div class="line">
  <input type="checkbox" id="user-kotehan" bind:checked={$settingStore.general.useKotehan} />
  <label class="explanation from-next" for="user-kotehan">コテハンを使用する　(@コテハン)</label>
  <details class="hint">
    <summary>「@コテハン」でコテハンを設定できます</summary>
    <div>@の直後が空白文字なら、コテハンが削除されます</div>
    <div>（正確には最初の「@文字列」が呼び名になります）</div>
  </details>
</div>

<div class="line">
  <input type="checkbox" id="user-yobina" bind:checked={$settingStore.general.useYobina} />
  <label class="explanation from-next" for="user-yobina">呼び名機能を使う　(@@呼び名)</label>
  <details class="hint">
    <summary>見た目の名前と読み上げられる名前を変えるための機能です</summary>
    <div>@@の直後が空白文字なら、呼び名が削除されます</div>
    <div>「@コテハン@呼び名」で表示名とは別に呼び名を設定できます</div>
    <div>（正確には２つめの「@文字列」が呼び名になります）</div>
    <div>※実験的機能です。次のバージョンから無くなるかもしれません</div>
  </details>
</div>

<div class="line">
  <input type="checkbox" id="name-to-no" bind:checked={$settingStore.general.nameToNo} />
  <label class="explanation" for="name-to-no">184の表示名をコメ番にする</label>
  <div class="hint">184の表示名はその人の最初のコメント番号になります</div>
</div>

<div class="line">
  <input
    type="checkbox"
    id="fetch-connecting-backward"
    bind:checked={$settingStore.general.fetchConnectingBackward}
  />
  <label class="explanation" for="fetch-connecting-backward">接続時に過去コメントを取得する</label>
  <div class="hint">OFFの場合でも少しだけ過去コメントを取得する場合があります</div>
</div>

<div class="line">
  <input type="checkbox" id="url-to-link" bind:checked={$settingStore.general.urlToLink} />
  <label class="explanation from-next" for="url-to-link">URLを含むコメントをリンクにする</label>
</div>

<div class="line">
  <input type="checkbox" id="first-is-bold" bind:checked={$settingStore.general.firstIsBold} />
  <label class="explanation" for="first-is-bold">最初のコメントを太字にする</label>
</div>

<div class="line">
  <input type="checkbox" id="hide-sharp" bind:checked={$settingStore.general.hideSharp} />
  <div>
    <label class="explanation" for="hide-sharp">
      シャープ(♯ # ＃)を含むコメントを隠す＆読み上げない
    </label>
  </div>
  <div class="hint">用途: ボドゲや初見プレイなどでリスナー同士で考察するなど</div>
</div>
