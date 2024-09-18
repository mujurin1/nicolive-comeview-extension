<script lang="ts">
  import { notifierStore } from "../lib/CustomStore.svelte";
  import { Nicolive, type PlatformsId } from "../Platform";
  import { CommentFormat } from "../store/SettingStore.svelte";
  import { StorageUserStore, type StorageUser } from "../store/StorageUserStore.svelte";
  import { onErrorImage, parseIconUrl } from "../utils";
  import FormatSetting from "./FormatSetting.svelte";

  let {
    platformId,
    userId,
    noAccordion = false,
  }: {
    platformId: PlatformsId;
    userId: string;
    noAccordion?: boolean;
  } = $props();

  const userS = notifierStore<StorageUser>(
    StorageUserStore[platformId].users[userId] ?? Nicolive.users[userId]?.storageUser,
    () => StorageUserStore[platformId].upsert(userS.state),
    // このオブジェクトはセーブデータ上で `undefiend` になる(存在しない)時があるため derived が必要
    () => {
      let a = StorageUserStore[platformId].users[userId];
      let b = Nicolive.users[userId]?.storageUser;
      return a ?? b;
    },
  );

  let opened = $state(noAccordion);
  let hasStored = $derived(StorageUserStore[platformId].users[userId] != null);
  let hasFormat = $derived(userS.state.format != null);

  function removeUser() {
    StorageUserStore[platformId].remove(userId);
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

    {#if $userS.format != null}
      <FormatSetting bind:format={$userS.format} />
      <br />
    {/if}

    <div class="content-bottom">
      {#if $userS.format == null}
        <button
          type="button"
          style="color: royalblue;"
          onclick={() => ($userS.format = CommentFormat.new())}
        >
          コメントフォーマットの作成
        </button>
      {:else}
        <button class="warning" type="button" onclick={() => ($userS.format = undefined)}>
          コメントフォーマットの削除
        </button>
      {/if}

      {#if hasStored}
        <button
          class="delete-user warning"
          title="ユーザーデータを削除します"
          onclick={removeUser}
        >
          ユーザーデータの削除
        </button>
      {/if}
    </div>

  </div>
</div>
{/snippet}

{#if noAccordion}
  <div class="user-content">
    <div class="header">
      {@render header()}
    </div>
    {@render content()}
  </div>
{:else}
  <details class="user-content" bind:open={opened}>
    <summary class="header">
      {@render header()}
    </summary>

    {#if opened}
      {@render content()}
    {/if}
  </details>
{/if}

<style>
  .user-content {
    background-color: #dfe7dc97;
    box-sizing: border-box;
    border-radius: 7px;
    min-height: 100%;

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
    display: flex;
    column-gap: 10px;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    padding: 5px;
  }

  .header-icon {
    flex: 0 1 0;
    height: 25px;
    min-width: 25px;
  }
  .header-title {
    display: flex;
    align-items: center;
    column-gap: 5px;
    justify-content: flex-start;
    white-space: nowrap;
    font-size: 0.88rem;
    overflow: hidden;

    & > .user-raw-id {
      min-width: 80px;
    }
    & > .user-184-id {
      min-width: 160px;
    }
    & > .user-name {
      min-width: 150px;
    }
  }

  .content {
    padding: 0 7px 3px 7px;

    & > .content-format {
      margin-top: 20px;
      padding: 0 0 3px 0;

      & > .content-bottom {
        display: flex;
        justify-content: space-between;
        white-space: nowrap;
        
        & > .delete-user {
          font-weight: bold;
        }
      }
    }
  }
</style>
