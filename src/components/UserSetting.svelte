<script lang="ts">
  import { CommentFormat, type StoreUser_Nicolive } from "../store/data";
  import { onErrorImage, parseIconUrl } from "../utils";
  import FormatSetting from "./FormatSetting.svelte";

  let {
    user = $bindable(),
    opened = $bindable(false),
  }: { user: StoreUser_Nicolive; opened?: boolean } = $props();
  let format = $derived(user.format);
</script>

<details class="item" bind:open={opened}>
  <summary class="tab">
    <!-- svelte-ignore a11y_missing_attribute -->
    <img src={parseIconUrl(user.id)} onerror={onErrorImage} />
    <div>{user.name}{user.kotehan ? `@${user.kotehan}` : ""}</div>
    <div>ID {user.id}</div>
  </summary>

  {#if opened}
    <div class="content">
      <fieldset>
        <legend>コテハン</legend>
        <input type="text" placeholder="コテハン" bind:value={user.kotehan} />
      </fieldset>

      <fieldset>
        <legend>呼び名</legend>
        <input type="text" placeholder="呼び名" bind:value={user.yobina} />
      </fieldset>

      <div class="content-format">
        <div class="title">コメントフォーマット</div>

        {#if format == null}
          <button type="button" onclick={() => (user.format = CommentFormat.create())}>
            コメントフォーマットの作成
          </button>
        {:else}
          <FormatSetting {format} />
          <br />
          <button class="warning" type="button" onclick={() => (user.format = undefined)}>
            コメントフォーマットの削除
          </button>
        {/if}
      </div>
    </div>
  {/if}
</details>

<style>
  details {
    & > summary {
      padding: 5px;
    }
  }

  .item {
    background-color: #e5e5da;
    box-sizing: border-box;
    border-radius: 7px;

    & > summary::before {
      font-size: 0.8rem;
      content: "▶";
      width: 20px;
    }

    &[open] > summary::before {
      content: "▼";
    }

    & > .tab {
      display: flex;
      align-items: center;

      & > * {
        height: 100%;

        &:not(:last-child) {
          margin-right: 10px;
        }
      }

      & > img {
        height: 30px;
      }
    }
  }

  .content {
    padding: 0 7px 3px 7px;

    & > .content-format {
      margin-top: 20px;
      padding: 0 3px 3px 3px;
    }
  }

  .title {
    width: 100%;
    font-weight: bold;
    margin-top: 8px;
    text-align: center;
  }
</style>
