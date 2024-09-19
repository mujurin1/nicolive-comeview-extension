<script lang="ts" module>
  import { additional } from "../view/view";
  
  export function openUserSetting(user: ExtUserType) {
    additional.page.openUserSetting(user.storageUser.id);
  }
</script>

<script lang="ts">
  import { tick } from "svelte";
  import { getCssClassNameFromMessage } from "../function/CssStyle.svelte";
  import { type ExtentionMessage, type ExtUserType, type NicoliveMessage, type NicoliveUser } from "../Platform";
  import { MessageStore } from "../store/MessageStore.svelte";
  import { SettingStore } from "../store/SettingStore.svelte";
  import LegacyCommentViewItem from "./LegacyCommentViewItem.svelte";

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

  function getNicoliveUserName(user: NicoliveUser) {
    if(SettingStore.state.general.useKotehan && user.storageUser.kotehan != null)
      return user.storageUser.kotehan;
    if(user.storageUser.name != null)
      return user.storageUser.name;
    if(SettingStore.state.general.nameToNo && user.noName184 != null)
      return user.noName184;
    return user.storageUser.id;
  }
</script>

{#snippet Content(message: NicoliveMessage)}
  <div class="child content">
    {#if SettingStore.state.general.urlToLink && message.link != null}
      <a href={message.link} target="_blank" title={message.link}>{message.content}</a>
    {:else}
      {message.content}
    {/if}
  </div>
{/snippet}

{#snippet NicoliveMessageView(message: NicoliveMessage)}
  {@const isFirst = message.no != null && message.extUser?.firstNo === message.no}
  {@const hideSharp = SettingStore.state.general.hideSharp && message.includeSharp}
  <div
    class={`comment cm-default ${getCssClassNameFromMessage(message)}`}
    class:cm-owner={message.kind === "owner"}
    class:cm-first={isFirst}
  >
    {#if hideSharp}
      <LegacyCommentViewItem no={message.no} time={message.time} content={"#シャープ#"} />
    {:else if message.kind === "system"}
      <LegacyCommentViewItem no={message.no} time={message.time}>
        {#snippet content()}
          {@render Content(message)}
        {/snippet}
      </LegacyCommentViewItem>
    {:else}
      {@const user = message.extUser}
      <LegacyCommentViewItem
        no={message.no}
        iconUrl={message.iconUrl}
        time={message.time}
      >
        {#snippet name()}
          {@const name = getNicoliveUserName(user)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            class="child name"
            title={user.storageUser.name ?? user.storageUser.id}
            role="button"
            tabindex="-1"
            onclick={() => openUserSetting(user)}
          >
            <!-- svelte の不具合でこれがないと name が変わっても更新されない -->
            {#key name}
              {name}
            {/key}
          </div>
        {/snippet}
        {#snippet content()}
          {@render Content(message)}
        {/snippet}
      </LegacyCommentViewItem>
    {/if}
  </div>
{/snippet}

{#snippet ExtentionMessageView(message: ExtentionMessage)}
  <div class="comment cm-default cm-system">
    <LegacyCommentViewItem time={message.time} content={message.content} />
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
    :global(.comment) {
      display: flex;
      min-height: 30px;

      border-top: 1px solid black;
      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Hiragino Kaku Gothic ProN",
        Meiryo UI,
        sans-serif;

      :global(& > .child) {
        margin-right: 3px;
        display: flex;
        align-items: center;
      }

      :global(& > .no) {
        font-weight: normal;
        flex: 0 0 30px;
        display: flex;
        justify-content: flex-end;
        font-size: 0.8em;
      }
      :global(& > .icon) {
        flex: 0 0 30px;

        :global(& > img) {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
      :global(& > .name) {
        flex: 0 0 80px;
        overflow: hidden;
        white-space: nowrap;

        :global(&[role="button"]) {
          cursor: pointer;
        }
      }
      :global(& > .time) {
        font-weight: normal;
        flex: 0 1 auto;
        padding-right: 2px;
        font-size: 0.8em;
      }
      :global(& > .content) {
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
