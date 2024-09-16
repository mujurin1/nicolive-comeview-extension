<script lang="ts">
  import { tick } from "svelte";
  import { getCssClassNameFromMessage } from "../function/CssStyle.svelte";
  import { type ExtentionMessage, type NicoliveMessage, type PlatformsId } from "../Platform";
  import { MessageStore } from "../store/MessageStore.svelte";
  import { SettingStore } from "../store/SettingStore.svelte";
  import { onErrorImage } from "../utils";
  import { additional } from "../view/view";

  let listView: HTMLDivElement;

  $effect.pre(() => {
    MessageStore.messages.length;

    const autoscroll =
      listView && listView.offsetHeight + listView.scrollTop > listView.scrollHeight - 50;

    if (autoscroll) {
      tick().then(() => {
        listView.scrollTo(0, listView!.scrollHeight);
      });
    }
  });

  function openUserSetting(platformId: PlatformsId, userId: string) {
    additional.page.openUserSetting(userId);
  }
</script>

{#snippet NicoliveMessageView(message: NicoliveMessage)}
  {@const user = message.extUser}
  {@const userId = user.storageUser.id}
  {@const isFirst = message.no != null && user?.firstNo === message.no}
  {@const hideSharp = SettingStore.state.general.hideSharp && message.includeSharp}
  <div
    class={`comment cm-default ${getCssClassNameFromMessage(message)}`}
    class:cm-owner={message.kind === "owner"}
    class:cm-first={isFirst}
  >
    <div class="child no">{message.no}</div>
    {#if hideSharp}
      <div class="child icon"></div>
      <div class="child name">#シャープ#</div>
    {:else}
      <div class="child icon">
        {#if message.kind !== "system"}
          <!-- svelte-ignore a11y_missing_attribute -->
          <img src={message.iconUrl} onerror={onErrorImage} />
        {/if}
      </div>
      {#if (user.storageUser.name ?? userId) !== null}
        {#if message.kind === "system"}
          <div class="child name"></div>
        {:else}
          {@const name =
            SettingStore.state.general.useKotehan && user.storageUser.kotehan
              ? user.storageUser.kotehan
              : user.storageUser.name}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            class="child name"
            title={user.storageUser.name ?? userId}
            role="button"
            tabindex="-1"
            onclick={() => openUserSetting(message.platformId, userId)}
          >
            <!-- name が存在するのは生IDだけ -->
            {name ??
              (SettingStore.state.general.nameToNo && user.noName184 ? user.noName184 : userId)}
          </div>
        {/if}
      {/if}
    {/if}
    <div class="child time">{message.time}</div>
    <div class="child content">
      {#if hideSharp}
        ＃シャープコメントだよ＃
      {:else if SettingStore.state.general.urlToLink && message.link != null}
        <a href={message.link} target="_blank" title={message.link}>{message.content}</a>
      {:else}
        {message.content}
      {/if}
    </div>
  </div>
{/snippet}
{#snippet ExtentionMessageView(message: ExtentionMessage)}
  <div
    class={`comment cm-default cm-system`}
    class:cm-owner={message.kind === "owner"}
  >
    <div class="child no"></div>
    <div class="child icon"></div>
    <div class="child name"></div>
    <div class="child time">{message.time}</div>
    <div class="child content">{message.content}</div>
  </div>
{/snippet}

<div bind:this={listView} class="comment-list" tabindex="-1">
  {#each MessageStore.messages as message (message.id)}
    {#if message.platformId === "nicolive"}
      {@render NicoliveMessageView(message)}
    {:else if message.platformId === "extention"}
      {@render ExtentionMessageView(message)}
    {/if}
  {/each}
</div>

<style>
  .comment-list {
    height: 100%;
    overflow: hidden;
    overflow-y: auto;

    &:focus {
      outline: none;
    }
  }

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

        &[role="button"] {
          cursor: pointer;
        }
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
