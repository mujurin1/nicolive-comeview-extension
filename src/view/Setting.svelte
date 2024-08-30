<script lang="ts">
    import Tab from "../components/Tab.svelte";
    import UserSetting from "../components/UserSetting.svelte";
    import { BouyomiChan } from "../store/BouyomiChan.svelte";
    import { SpeachNameType, type StoreUser_Nicolive, Yomiage } from "../store/data";
    import { Nicolive } from "../store/Nicolive.svelte";
    import { store, storeClear, storeSave } from "../store/store.svelte";

  const names = ["一般", "読み上げ", "コメント表示", "Advanced"] as const;
  let { show = $bindable() }: { show: boolean } = $props();
  let currentTab = $state<typeof names[number]>("コメント表示");

  let setting = $state<HTMLDialogElement>();
  let useAdvanced = $state(false);
  let savedata = $state("");
  let serchUserQuery = $state("");
  let hitUsers = $state<Set<StoreUser_Nicolive>>(new Set());

  let initSerchUser = $state(false);

  function changeTabedInit() {
    bouyomiTest = "none";
    trySave = "none";
    checkedClearOk = false;
    initSerchUser = false;
  }

  $effect(() => {
    currentTab;
    changeTabedInit();
  });

  $effect(() => {
    if (show) {
      setting?.showModal();
    } else {
      changeTabedInit();
      useAdvanced = false;
      setting?.close();
    }
  });

  $effect(() => {
    if(!show || initSerchUser || currentTab !== "コメント表示") return;
    initSerchUser = true;
    serchUser();
  });

  function serchUser() {
    hitUsers = new Set([
      ...Object.values(store.nicolive.users_primitable),
      ...Object.values(Nicolive.users).map(u => u.storeUser),
    ]);

    if (serchUserQuery) {
      for(const user of hitUsers) {
        if(!user.name?.includes(serchUserQuery))
          hitUsers.delete(user);
      }
    }
  }

  $effect(() => {
    if(!useAdvanced) return;
    
    savedata = JSON.stringify(store, null, 2);
  })

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
    try {
      storeSave(JSON.parse(savedata));
      trySave = "ok";
    } catch{
      trySave = "miss";
    }
  }

  function clear() {
    if(checkedClearOk) {
      storeClear();
      checkedClearOk = false;
    } else {
      checkedClearOk = true;
    }
  }
</script>

{#if show}
  <dialog bind:this={setting} class="mordal">
    <button class="close-btn" onclick={() => show = false}>閉じる</button>

    <div class="mordal-body">
      <Tab {names} bind:currentTab>

{#snippet content(tabId)}
  <div class="content" data-tabId={tabId}>
    {#if tabId === "一般"}

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
        <select bind:value={store.yomiage.speachName}>
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
              {@const selected = store.yomiage.speachNameTypes[speachName]}
              <button
                class="select-btn"
                data-selected={selected}
                type="button"
                onclick={() => store.yomiage.speachNameTypes[speachName] = !selected}
              >
                {speachName}
              </button>
            {/each}
            <button
              class="select-btn"
              data-selected={store.general.useYobina}
              type="button"
              title="「一般 > 呼び名機能を使う」で変更できます"
              disabled
            >
              呼び名
            </button>
        </div>
        </fieldset>
        {#if store.yomiage.speachNameTypes["コメ番"] && !store.general.nameToNo}
          <div class="hint warning">コメ番は名前として使用されません「一般 > 184の表示名をコメ番にする」も有効にする必要があります</div>
        {/if}
        {#if store.yomiage.speachNameTypes["コテハン"] && !store.general.useKotehan}
          <div class="hint warning">コテハンは名前として使用されません「一般 > コテハンを使用する」も有効にする必要があります</div>
        {/if}
        <div class="hint">呼び名は「一般 > 呼び名機能を使う」設定で切り替えられます</div>
        <div class="hint ">呼び名があるときだけそれを名前として読み上げたい時のための項目です</div>
      </div>

      <div class="line">
        <input type="checkbox" id="speak-system" bind:checked={store.yomiage.speachSystem} />
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
          {#each Yomiage as yomi (yomi)}
            {@const selected = store.yomiage.use === yomi}
            {@const disabled = yomi === "VOICEVOX"}
            <input type="radio" id={yomi} name="contact" value={yomi} onclick={() => store.yomiage.use = yomi} checked={selected} {disabled}/>
            <label class:disabled for={yomi}>{yomi}</label>
          {/each}
        </div>
      </div>

      {#if store.yomiage.use === "棒読みちゃん"}
        <fieldset>
          <legend>棒読みちゃんPORT</legend>
          <input type="number" bind:value={BouyomiChan.port} />
        </fieldset>
      {:else if store.yomiage.use === "VOICEVOX"}
        <div></div>
      {/if}

    {:else if tabId === "コメント表示"}

      <h2 style="margin: 0;">リスナー一覧ページ</h2>

      <div class="line" style="margin-bottom: 30px;">
        <button type="button" onclick={serchUser}>検索</button>
        <input type="text" placeholder="検索するユーザー名" bind:value={serchUserQuery} />
      </div>

      <!-- # コメントビューの見た目を変える
      * 表示項目の編集
      * 背景やグリッド線の色
      * フォントサイズ
      
      
      # ユーザー毎にコメントの見た目を変える
      * 文字の色・スタイル
      * フォント
      * 背景色 -->

      <div class="user-list">
        {#each hitUsers as user (user.id)}
          <UserSetting user={user} />
        {/each}
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
        </div>
        <div>※コメビュの保存データのJSONです。注意して操作してください</div>
        <div>※キー(property key)を消して保存した場合そのキーの値は上書きされません</div>

        {#if trySave === "ok"}
          <div style="color: blue; font-size: 0.8rem;">保存しました</div>
        {:else if trySave === "miss"}
          <div style="color: red; font-size: 0.8rem;">保存に失敗しました。JSONとして不正な値です</div>
        {:else}
          <div>　</div>
        {/if}

        <textarea style="width: 100%;" rows="20" bind:value={savedata}></textarea>
      {/if}

    {/if}
  </div>
{/snippet}

      </Tab>
    </div>
  </dialog>
{/if}

<style>
  * {
    :global(select) {
      width: 140px;
    }
    :global(button) {
      min-width: 80px;
    }
    :global(input[type="radio"]) {
      margin: 0;

      :global(& + label) {
        padding-left: 5px;

        :global(&:not(:last-child)) {
          margin-right: 10px;
        }
      }
    }
    :global(input[type=checkbox]) {
      min-width: 20px;
    }
    :global(input[type=number]) {
      width: 80px;
    }
  }

  .mordal {
    background-color: #c0cbd6;

    width: 80%;
    height: 80%;
    
    padding: 0;
    border: 2px solid black;

    &:focus {
      outline: none;
    }
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

  .user-list {
    :global(& > *:not(:last-child)) {
      margin-bottom: 5px;
    }
  }


  :global(.line) {
    display: grid;
    grid-template:
            "a b" auto
            ". c" auto / auto 1fr;

    align-items: center;

    :global(& > *:nth-child(1)) {
      grid-area: a;
      margin-right: 15px;
    }
    :global(& > *:nth-child(2)) {
      grid-area: b;
    }
    :global(& > *:nth-child(3)) {
      grid-area: c;
    }
  }

  .hint {
    margin-top: -3px;
  }

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
