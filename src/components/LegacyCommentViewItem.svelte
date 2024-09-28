
<script lang="ts">
  import type { Snippet } from "svelte";
  import { onErrorImage } from "../Platform";

  let { no, iconUrl, name, time, content }: {
    no?: number;
    iconUrl?: string;
    name?: Snippet | string;
    time?: string;
    content?: Snippet | string;
  } = $props();
</script>

<div class="comment">
  <div class="child no">{no}</div>
  <div class="child icon">
    {#if iconUrl != null}
      <!-- svelte-ignore a11y_missing_attribute -->
      <img src={iconUrl} onerror={onErrorImage} />
    {/if}
  </div>
  <div class="child name">
    {#if typeof name === "function"}
      {@render name()}
    {:else if name != null}
      {name}
    {/if}
  </div>
  {#if time != null}
    <div class="child time">{time}</div>
  {/if}
  <div class="child content">
    {#if typeof content === "function"}
      {@render content()}
    {:else if content != null}
      {content}
    {/if}
  </div>
</div>

<style>
  @layer {
    .comment {
      display: flex;
      min-height: 30px;

      border-top: 1px solid black;
      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Hiragino Kaku Gothic ProN",
        Meiryo UI,
        sans-serif;

      & > .child {
        margin-right: 3px;
        display: flex;
        align-items: center;
      }

      & > .no {
        font-weight: normal;
        flex: 0 0 30px;
        display: flex;
        justify-content: flex-end;
        font-size: 0.8em;
      }
      & > .icon {
        flex: 0 0 30px;

        & > img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
      & > .name {
        flex: 0 0 80px;
        overflow: hidden;
        white-space: nowrap;
      }
      & > .time {
        font-weight: normal;
        flex: 0 1 auto;
        padding-right: 2px;
        font-size: 0.8em;
      }
      & > .content {
        flex: 1 0 10px;
        white-space-collapse: preserve;

        overflow-y: hidden;
        /* 改行出来ない文字の場合にスクロールバーが出る (アスキーアートなど) */
        overflow-x: auto;

        /* 自動改行しない & スクロールバーを非表示 */
        /* text-wrap: nowrap; */
        /* scrollbar-width: none; */
      }
    }
  }
</style>
