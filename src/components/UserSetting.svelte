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
    <div class="tab-title">
      <div>{user.name}</div>
      <div>{`ID ${user.id}`}</div>
      {#if user.kotehan}
        <div style="color: green;" title="コテハン">{`@${user.kotehan}`}</div>
      {/if}
      {#if user.yobina}
        <div style="color: blue;" title="呼び名">{`@${user.yobina}`}</div>
      {/if}
    </div>
  </summary>

  {#if opened}
    <div class="content">
      <div class="content-kote-yobi">
        <fieldset>
          <legend>コテハン</legend>
          <input type="text" placeholder="コテハン" bind:value={user.kotehan} />
        </fieldset>

        <fieldset>
          <legend>呼び名</legend>
          <input type="text" placeholder="呼び名" bind:value={user.yobina} />
        </fieldset>
      </div>

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
  .item {
    background-color: #e5e5da;
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

  .content-kote-yobi {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    column-gap: 5px;
  }

  .title {
    width: 100%;
    font-weight: bold;
    margin-top: 8px;
    text-align: center;
  }
</style>
