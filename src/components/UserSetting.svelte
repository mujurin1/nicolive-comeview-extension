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
    noAccordion = false,
  }: { userId: number | string; noAccordion?: boolean } = $props();

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

  let opened = $state(noAccordion);
  let hasStored = $derived(userStore.users[userId] != null);
  let hasFormat = $derived(userS.state.format != null);

  function removeUser() {
    userStore.remove(userId);
  }
</script>

{#snippet header()}
  <!-- svelte-ignore a11y_missing_attribute -->
  <img class="header-icon" src={parseIconUrl($userS.id)} onerror={onErrorImage} />
  <div class="header-title">
    {#if typeof $userS.id === "number"}
      <div class="user-raw-id">{`${$userS.id}`}</div>
    {:else}
      <div class="user-184-id">{`${$userS.id}`}</div>
    {/if}
    {#if $userS.name}
      <div class="user-name">{$userS.name}</div>
    {/if}
    {#if $userS.kotehan}
      <div style="color: green;" title="コテハン">{`@${$userS.kotehan}`}</div>
    {/if}
    {#if $userS.yobina}
      <div style="color: blue;" title="呼び名">{`@${$userS.yobina}`}</div>
    {/if}
    {#if hasFormat}
      <div style="color: orange;" title="フォーマットが設定されています">★</div>
    {/if}
  </div>
{/snippet}

{#snippet content()}
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
      <button
        type="button"
        style="color: royalblue;"
        onclick={() => ($userS.format = CommentFormat.new())}
      >
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
        class="warning delete-user"
        title="ユーザーデータを削除します"
        onclick={removeUser}
      >
        ユーザーデータの削除
      </button>
    {/if}
  </div>
</div>
{/snippet}

{#if noAccordion}
  <div class="item">
    <div class="header">
      {@render header()}
    </div>
    {@render content()}
  </div>
{:else}
  <details class="item" bind:open={opened}>
    <summary class="header">
      {@render header()}
    </summary>

    {#if opened}
      {@render content()}
    {/if}
  </details>
{/if}

<style>
  .item {
    background-color: #dfe7dc97;
    box-sizing: border-box;
    border-radius: 7px;

    & > summary::before {
      font-size: 0.8rem;
      content: "▶";
      width: 10px;
    }

    &[open] > summary::before {
      content: "▼";
    }
  }

  .header {
    padding: 5px;
    display: grid;
    grid-auto-flow: column;
    column-gap: 10px;
    justify-content: flex-start;
    align-items: center;
  }

  .header-icon {
    height: 25px;
    width: 25px;
  }
  .header-title {
    display: grid;
    grid-auto-flow: column;
    /* grid-template-columns: repeat(auto-fit, min-content); */
    column-gap: 5px;
    justify-content: flex-start;
    white-space: nowrap;
    font-size: 0.88rem;

    & > .user-raw-id {
      min-width: 80px;
    }
    & > .user-184-id {
      min-width: 160px;
    }
    & > .user-name {
      min-width: 250px;
    }
  }

  .content {
    padding: 0 7px 3px 7px;

    & > .content-format {
      margin-top: 20px;
      padding: 0 0 3px 0;

      & > .delete-user {
        float: right;
        font-weight: bold;
        margin-right: 20px;
      }
    }
  }

  /* 
  .title {
    width: 100%;
    font-weight: bold;
    margin-top: 8px;
    text-align: center;
  } */
</style>
