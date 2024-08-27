<script lang="ts">
  import Tab from "../components/Tab.svelte";
  import { BouyomiChan } from "../store/BouyomiChan.svelte";
  import { store, storeClear, storeSave, Yomiage } from "../store/store.svelte";

  const names = ["コメント表示", "読み上げ", "Advanced"] as const;
  let { show = $bindable() }: { show: boolean } = $props();
  let currentTab = $state<typeof names[number]>("コメント表示");

  let setting : HTMLDialogElement;
  let useAdvanced = $state(false);
  let savedata = $state("");

  function init() {
    bouyomiTest = "none";
    trySave = "none";
    checkedClearOk = false;
  }

  $effect(() => {
    currentTab;
    init();
  })

  $effect(() => {
    if(!useAdvanced) return;
    
    savedata = JSON.stringify(store, null, 2);
  })

  $effect(() => {
    if(show) {
      setting.showModal();
    } else {
      init();
      useAdvanced = false;
      setting.close();
    }
  });

  let bouyomiTest = $state<"none" | "try" | "miss" | "ok">("none");

  function testSpeak() {
    bouyomiTest = "try";
    BouyomiChan.speak("テストです","ユーザー名", true)
      .then(() => (bouyomiTest = "ok"))
      .catch(() => (bouyomiTest = "miss"));
  }

  let trySave = $state<"none" | "ok" | "miss">("none");
  let checkedClearOk = $state(false);

  function save() {
    try{
      storeSave(JSON.parse(savedata));
      trySave = "ok";
    } catch{
      trySave = "miss";
    }
  }

  function clear() {
    if(checkedClearOk){
      storeClear();
      checkedClearOk = false;
    } else {
      checkedClearOk = true;
    }
  }
</script>

{#snippet hintContainer(texts: string[])}
  {@const x = { s: undefined! as HTMLSpanElement, i: 0 }}
  <button
    type="button"
    style="width: 10px;"
    onclick={() => {
        if(++x.i >= texts.length) x.i = 0;
        x.s.innerText = texts[x.i];
    }}
  >▼</button>
  <span bind:this={x.s}>{texts[0]}</span>
{/snippet}

<dialog bind:this={setting} class="mordal">
  <button class="close-btn" onclick={() => show = false}>閉じる</button>

  <div class="mordal-body">
    <Tab {names} bind:currentTab>

{#snippet content(tabId)}
  <div class="content" data-tabId={tabId}>
    {#if tabId === "コメント表示"}

      <div class="line">
        <div class="explanation from-next" style="font-size: 0.7rem;">←このアイコンがある項目は過去のコメントに遡っては反映されません</div>
      </div>

      <div class="line">
        <input type="checkbox" id="user-kotehan" bind:checked={store.general.useKotehan} />
        <label class="explanation from-next" for="user-kotehan">コテハンを使用する　(@コテハン)</label>
        <details class="hint">
          <summary>「@コテハン」でコテハンを設定できます</summary>
          <div>@の直後が空白文字なら、コテハンが削除されます</div>
          <div>（正確には最初の「@文字列」が呼び名になります）</div>
        </details>
      </div>

      <div class="line">
        <input type="checkbox" id="user-yobina" bind:checked={store.general.useYobina} />
        <label class="explanation from-next" for="user-yobina">呼び名機能を使う　(@..@呼び名)</label>
        <details class="hint">
          <summary>見た目の名前と読み上げられる名前を変えるための機能です</summary>
          <div>@@の直後が空白文字なら、呼び名が削除されます</div>
          <div>「@...@呼び名」で表示名とは別に呼び名を設定できます</div>
          <div>（正確には２つめの「@文字列」が呼び名になります）</div>
          <div>※実験的機能です。次のバージョンから無くなるかもしれません</div>
        </details>
      </div>

      <div class="line">
        <input type="checkbox" id="name-to-no" bind:checked={store.general.nameToNo} />
        <label class="explanation" for="name-to-no">184の表示名をコメ番にする</label>
        <div class="hint">184の表示名はその人の最初のコメント番号になります</div>
      </div>

      <div class="line">
        <input type="checkbox" id="fetch-connecting-backward" bind:checked={store.general.fetchConnectingBackward} />
        <label class="explanation" for="fetch-connecting-backward">接続時に過去コメントを取得する</label>
        <div class="hint">OFFの場合でも少しだけ過去コメントを取得する場合があります</div>
      </div>

      <div class="line">
        <input type="checkbox" id="url-to-link" bind:checked={store.general.urlToLink} />
        <label class="explanation from-next" for="url-to-link">URLを含むコメントをリンクにする</label>
      </div>

      <div class="line">
        <input type="checkbox" id="first-is-bold" bind:checked={store.general.firstIsBold} />
        <label class="explanation" for="first-is-bold">最初のコメントを太字にする</label>
      </div>

      <div class="line">
        <input type="checkbox" id="hide-sharp" bind:checked={store.general.hideSharp} />
        <div>
          <label class="explanation" for="hide-sharp">シャープ(♯ # ＃)を含むコメントを隠す＆読み上げない</label>
        </div>
        <div class="hint">用途: ボドゲや初見プレイなどでリスナー同士で考察するなど</div>
      </div>

    {:else if tabId === "読み上げ"}

      <div class="line" style="margin-bottom: 30px;">
        <input type="checkbox" id="is-speak" bind:checked={store.yomiage.isSpeak} />
        <label for="is-speak">コメントを読み上げる</label>
      </div>

      <fieldset>
        <legend>名前の読み上げ位置</legend>
        <select bind:value={store.yomiage.speakName}>
          <option value="none">読み上げない</option>
          <option value="mae">コメントの前</option>
          <option value="ato">コメントの後</option>
        </select>
      </fieldset>

      <div class="line">
        <input type="checkbox" id="speak-system" bind:checked={store.yomiage.speakSystem} />
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

        <div>
          {#each Yomiage as yomi (yomi)}
            {@const selected = store.yomiage.use === yomi}
            {@const disabled = yomi === "VOICEVOX"}
            <input type="radio" id={yomi} name="contact" value={yomi} onclick={() => store.yomiage.use = yomi} checked={selected} {disabled}/>
            <label class:disabled for={yomi}>{yomi}</label>
          {/each}
        </div>
      </div>

      <div class="line">
        <input type="checkbox" id="speak-system" bind:checked={store.yomiage.speakSystem} />
        <label for="speak-system">システムメッセージの読み上げ</label>
      </div>

      <div class="line">
        <input type="checkbox" id="speak-system" bind:checked={store.yomiage.speakSystem} />
        <label for="speak-system">システムメッセージの読み上げ</label>
      </div>

      {#if store.yomiage.use === "棒読みちゃん"}
        <fieldset>
          <legend>棒読みちゃんPORT</legend>
          <input type="number" bind:value={BouyomiChan.port} />
        </fieldset>
      {:else if store.yomiage.use === "VOICEVOX"}
        <div></div>
      {/if}

      <div class="line">
        <input type="checkbox" id="speak-system" bind:checked={store.yomiage.speakSystem} />
        <label for="speak-system">システムメッセージの読み上げ</label>
      </div>

      <div class="line">
        <input type="checkbox" id="speak-system" bind:checked={store.yomiage.speakSystem} />
        <label for="speak-system">システムメッセージの読み上げ</label>
      </div>

    {:else if tabId === "Advanced"}

      <h2 style="margin: 0;">詳しいユーザー向けのページです</h2>
      <div style="margin-bottom: 20px;">このタブの項目は注意して操作してください</div>

      {#if !useAdvanced}
        <button type="button" onclick={() => useAdvanced = true}>高度な設定を使用する</button>
      {:else}
        <div class="list" style="display: flex;">
          <div>データの変更</div>
          <button type="button" onclick={save}>保存する</button>
          {#if checkedClearOk}
            <button type="button" onclick={clear}>本当に初期化する?</button>
          {:else}
            <button type="button" onclick={clear}>初期化する</button>
          {/if}
          {#if trySave === "ok"}
            <div style="color: blue; font-size: 0.8rem;">保存しました</div>
          {:else if trySave === "miss"}
            <div style="color: red; font-size: 0.8rem;">保存に失敗しました。JSONとして不正な値です</div>
          {/if}
        </div>
        <div>※コメビュの保存データのJSONです。注意して操作してください</div>
        <div>※キー(property key)を消して保存した場合そのキーの値は上書きされません</div>
        <textarea
          style="width: 100%;"
          rows="20"
          bind:value={savedata}
        ></textarea>
      {/if}

    {/if}
  </div>
{/snippet}

    </Tab>
  </div>
</dialog>

<style>
  select {
    width: 140px;
  }
  button {
    min-width: 80px;
  }
  input[type="radio"] {
    margin-right: 0;

    & + label:not(:last-child) {
      margin-right: 10px;
    }
  }
  input[type=checkbox] {
    min-width: 20px;
  }
  input[type=number] {
    width: 80px;
  }

  .mordal {
    background-color: #c0cbd6;

    width: 80%;
    height: 80%;
    
    padding: 0;
    border: 2px solid black;
  }

  .close-btn {
    position: absolute;
    right: 10px;
    top: 5px;
    min-width: auto;
  }
  .mordal-body {
    height: 100%;
    overflow-y: auto;
  }

  .content {
    background-color: #ffeec3;
    overflow-y: auto;
    overflow-x: hidden;

    box-sizing: border-box;
    height: 100%;
    padding: 15px;


    &:not([data-tabid="Advanced"]) {
      font-size: 1rem;

      & > *:not(:last-child) {
        margin-bottom: 15px;
      }
    }
  }

  .line {
    display: grid;
    grid-template:
            "a b" auto
            ". c" auto / auto 1fr;

    align-items: center;

    & > *:nth-child(1) {
      grid-area: a;
      margin-right: 15px;
    }
    & > *:nth-child(2) {
      grid-area: b;
    }
    & > *:nth-child(3) {
      grid-area: c;
    }
  }

  .explanation {
    &::before {
      color: transparent;
      content: "◆ ";
      font-size: 0.7rem;
      margin-left: -5px;
    }
    
    &.from-next::before {
      color: indianred;
    }
  }

  .list {
    font-size: 1rem;
    margin-bottom: 5px;

    & > *:not(last-child) {
      margin-right: 50px;
    }
  }

  .hint {
    color: darkblue;
    margin-top: -3px;
    width: fit-content;
    line-height: normal;
    
    font-size: 0.75rem;
    text-indent: 1rem;
  }

</style>
