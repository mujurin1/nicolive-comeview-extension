<script lang="ts">
  import { notifierStore } from "../lib/CustomStore.svelte";
  import { CommentFormat } from "../store/data";
  import { Nicolive } from "../store/Nicolive.svelte";
  import { userStore } from "../store/UserStore.svelte";

  import type { StoreUser } from "../store/UserStore.svelte";
  import { onErrorImage, parseIconUrl } from "../utils";
  import FormatSetting from "./FormatSetting.svelte";

  let {
    userId, //
    opened = $bindable(false),
  }: { userId: number | string; opened?: boolean } = $props();

  const userS = notifierStore<StoreUser>(
    userStore.users[userId] ?? Nicolive.users[userId]?.storeUser,
    () => userStore.upsert(userS.state),
    // この derived が必要な理由は、このオブジェクトはセーブデータ上で `undefiend` になる(存在しない)時があるため
    // 普通の設定項目はセーブデータ上で必ず存在するため、普通はこの derived は不要である
    () => {
      let a = userStore.users[userId];
      let b = Nicolive.users[userId]?.storeUser;
      return a ?? b;
    },
  );

  let hasStored = $derived(userStore.users[userId] != null);
  let hasFormat = $derived(userS.state.format != null);

  function removeUser() {
    userStore.remove(userId);
  }
</script>

<details class="item" class:hasStored bind:open={opened}>
  <summary class="tab">
    <!-- svelte-ignore a11y_missing_attribute -->
    <img src={parseIconUrl($userS.id)} onerror={onErrorImage} />
    <div class="tab-title">
      <div>{$userS.name}</div>
      <div>{`ID ${$userS.id}`}</div>
      {#if $userS.kotehan}
        <div style="color: green;" title="コテハン">{`@${$userS.kotehan}`}</div>
      {/if}
      {#if $userS.yobina}
        <div style="color: blue;" title="呼び名">{`@${$userS.yobina}`}</div>
      {/if}
      {#if hasFormat}
        <div style="color: orange;" title="固有のフォーマットが設定されています">★</div>
      {/if}
    </div>
  </summary>

  {#if opened}
    <div class="content">
      <div class="grid-row">
        <fieldset>
          <legend>コテハン</legend>
          <input type="text" placeholder="コテハン" bind:value={$userS.kotehan} />
        </fieldset>

        <fieldset>
          <legend>呼び名</legend>
          <input type="text" placeholder="呼び名" bind:value={$userS.yobina} />
        </fieldset>
      </div>

      <div class="content-format">
        <div class="title">コメントフォーマット</div>

        {#if $userS.format == null}
          <button type="button" onclick={() => ($userS.format = CommentFormat.new())}>
            コメントフォーマットの作成
          </button>
        {:else}
          <FormatSetting bind:format={$userS.format} />
          <br />
          <button class="warning" type="button" onclick={() => ($userS.format = undefined)}>
            コメントフォーマットの削除
          </button>
        {/if}

        {#if hasStored}
          <button
            class="warning"
            title="セーブデータからユーザーデータを削除します"
            onclick={removeUser}
          >
            ユーザーデータの削除
          </button>
        {/if}
      </div>
    </div>
  {/if}
</details>

<style>
  .item {
    background-color: #ebebad97;
    box-sizing: border-box;
    border-radius: 7px;

    &.hasStored {
      background-color: #dfe7dc97;
    }

    & > summary::before {
      font-size: 0.8rem;
      content: "▶";
      width: 10px;
    }

    &[open] > summary::before {
      content: "▼";
    }

    & > .tab {
      padding: 5px;
      display: grid;
      grid-auto-flow: column;
      grid-template-columns: repeat(auto-fit, min-content);
      column-gap: 10px;
      justify-content: flex-start;
      align-items: center;

      & > .tab-title {
        display: grid;
        grid-auto-flow: column;
        /* grid-template-columns: repeat(auto-fit, min-content); */
        column-gap: 5px;
        justify-content: flex-start;
        white-space: nowrap;
        font-size: 0.88rem;
      }

      & > img {
        height: 25px;
        width: 25px;
      }
    }
  }

  .content {
    padding: 0 7px 3px 7px;

    & > .content-format {
      margin-top: 20px;
      padding: 0 0 3px 0;
    }
  }

  .title {
    width: 100%;
    font-weight: bold;
    margin-top: 8px;
    text-align: center;
  }
</style>
