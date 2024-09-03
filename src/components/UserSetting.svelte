<script lang="ts">
  import { untrack } from "svelte";
  import { StoreUser } from "../store/StoreUser.svelte";
  import { onErrorImage, parseIconUrl } from "../utils";
  import FormatSetting from "./FormatSetting.svelte";

  let {
    userId, //
    opened = $bindable(false),
  }: { userId: number | string; opened?: boolean } = $props();

  let user = $derived(StoreUser.getById(userId)!);
  let kotehan = $state(user.kotehan);
  let yobina = $state(user.yobina);
  let format = $state(user.format);

  $effect(() => {
    user;
    isFirst = true;
    untrack(() => {
      kotehan = user.kotehan;
      yobina = user.yobina;
      format = user.format;
    });
  });

  let isFirst = true;
  $effect(() => {
    kotehan;
    yobina;
    format;

    format?.backgroundColor;
    format?.nameColor;
    format?.contentColor;
    format?.fontFamily;
    format?.fontSize;
    format?.isBold;
    format?.isItally;

    if (isFirst) {
      isFirst = false;
      return;
    }

    untrack(() => {
      StoreUser.upsert(user, kotehan, yobina, format);
    });
  });
</script>

<details class="item" bind:open={opened}>
  <summary class="tab">
    <!-- svelte-ignore a11y_missing_attribute -->
    <img src={parseIconUrl(user.id)} onerror={onErrorImage} />
    <div class="tab-title">
      <div>{user.name}</div>
      <div>{`ID ${user.id}`}</div>
      {#if kotehan}
        <div style="color: green;" title="コテハン">{`@${kotehan}`}</div>
      {/if}
      {#if yobina}
        <div style="color: blue;" title="呼び名">{`@${yobina}`}</div>
      {/if}
    </div>
  </summary>

  {#if opened}
    <div class="content">
      <div class="content-kote-yobi">
        <fieldset>
          <legend>コテハン</legend>
          <input type="text" placeholder="コテハン" bind:value={kotehan} />
        </fieldset>

        <fieldset>
          <legend>呼び名</legend>
          <input type="text" placeholder="呼び名" bind:value={yobina} />
        </fieldset>
      </div>

      <div class="content-format">
        <div class="title">コメントフォーマット</div>

        {#if format == null}
          <button type="button" onclick={() => (format = {})}> コメントフォーマットの作成 </button>
        {:else}
          <FormatSetting bind:format />
          <br />
          <button class="warning" type="button" onclick={() => (format = undefined)}>
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
        width: 25px;
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
