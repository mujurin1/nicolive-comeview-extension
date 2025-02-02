<script lang="ts" module>
  import { additional } from "../view/view";

  export function openUserSetting(user: NceUserType) {
    additional.page.openUserSetting(user.storageUser.id);
  }
</script>

<script lang="ts">
  import { tick } from "svelte";
  import { getCssClassNameFromMessage } from "../function/CssStyle.svelte";
  import {
    getNicoliveUserName,
    type ExtentionMessage,
    type NceUserType,
    type NicoliveMessage,
  } from "../Platform";
  import { NceMessageStore } from "../store/NceStore.svelte";
  import { checkVisibleYomiage_Visible, SettingStore } from "../store/SettingStore.svelte";
  import LegacyCommentViewItem from "./LegacyCommentViewItem.svelte";

  let listView: HTMLDivElement;

  $effect.pre(() => {
    NceMessageStore.messages.length;

    const autoscroll =
      listView && listView.offsetHeight + listView.scrollTop > listView.scrollHeight - 50;

    if (autoscroll) {
      tick().then(() => {
        listView.scrollTo(0, listView!.scrollHeight);
      });
    }
  });

  function checkVisible(message: NicoliveMessage): boolean {
    if (message.kind === "owner") return true;
    else if (message.kind === "user") {
      if (!message.is184) return true;
      return checkVisibleYomiage_Visible(SettingStore.state.nicolive.visibleAndYomiage["184"]);
    } else {
      const check = SettingStore.state.nicolive.visibleAndYomiage.system[message.systemMessageType];
      return checkVisibleYomiage_Visible(check);
    }
  }
</script>

{#snippet Content(message: NicoliveMessage)}
  {#if SettingStore.state.general.urlToLink && message.link != null}
    <a href={message.link} target="_blank" title={message.link}>{message.content}</a>
  {:else}
    {message.content}
  {/if}
{/snippet}

{#snippet NicoliveMessageView(message: NicoliveMessage)}
  {@const isFirst = message.kind === "user" && message.isFirstComment}
  {@const hideSharp = SettingStore.state.general.hideSharp && message.includeSharp}
  <div
    class={`cm-default ${getCssClassNameFromMessage(message)}`}
    class:cm-first={isFirst}
    class:cm-owner={message.kind === "owner"}
  >
    {#if hideSharp}
      <LegacyCommentViewItem content="#シャープ#" no={message.no} time={message.time} />
    {:else if message.kind === "system"}
      <LegacyCommentViewItem name={message.tempName} time={message.time}>
        {#snippet content()}
          {@render Content(message)}
        {/snippet}
      </LegacyCommentViewItem>
    {:else}
      {@const user = message.user}
      <LegacyCommentViewItem iconUrl={message.user.iconUrl} no={message.no} time={message.time}>
        {#snippet name()}
          {@const name = message.tempName ?? getNicoliveUserName(user)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            onclick={() => openUserSetting(user)}
            role="button"
            tabindex="-1"
            title={user.storageUser.name ?? user.storageUser.id}
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

{#snippet ExtentionMessageContent(message: ExtentionMessage)}
  {message.content}
  {#if message.input != null}
    <input type={message.input.type} bind:value={message.input.value} />
  {/if}
  {#if message.button != null}
    <button onclick={() => message.button!.func(message)} type="button"
      >{message.button.text}</button
    >
  {/if}
{/snippet}
{#snippet ExtentionMessageView(message: ExtentionMessage)}
  <div class="cm-default cm-system">
    <LegacyCommentViewItem name={message.tempName} time={message.time}>
      {#snippet content()}
        {#if message.expandMessage == null}
          {@render ExtentionMessageContent(message)}
        {:else}
          <details class="extension-details">
            <summary>
              {@render ExtentionMessageContent(message)}
            </summary>
            {message.expandMessage}
          </details>
        {/if}
      {/snippet}
    </LegacyCommentViewItem>
  </div>
{/snippet}

<div bind:this={listView} class="comment-list" tabindex="-1">
  {#each NceMessageStore.messages as message (message.id)}
    {#if message.platformId === "nicolive"}
      {@const visible = checkVisible(message)}
      {#if visible}
        {@render NicoliveMessageView(message)}
      {/if}
    {:else if message.platformId === "nce"}
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

  .hide {
    display: none;
  }

  .extension-details {
    white-space-collapse: preserve-breaks;
  }

  @layer {
    div[role="button"] {
      cursor: pointer;
    }
  }
</style>
