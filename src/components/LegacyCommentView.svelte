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
  import { checkVisibleYomiage_Visible, SettingStore } from "../store/SettingStore.svelte";
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
  {@const isFirst = message.kind === "user" && message.no != null && message.extUser?.firstNo === message.no}
  {@const hideSharp = SettingStore.state.general.hideSharp && message.includeSharp}
  <div
    class={`cm-default ${getCssClassNameFromMessage(message)}`}
    class:cm-owner={message.kind === "owner"}
    class:cm-first={isFirst}
  >
    {#if hideSharp}
      <LegacyCommentViewItem no={message.no} time={message.time} content={"#シャープ#"} />
    {:else if message.kind === "system"}
      <LegacyCommentViewItem name={message.tempName} time={message.time}>
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
  <div class="cm-default cm-system">
    <LegacyCommentViewItem time={message.time} name={message.tempName}>
      {#snippet content()}
        {#if message.expandMessage == null}
          {message.content}
          {#if message.button != null}
            <button type="button" onclick={message.button.func}>{message.button.text}</button>
          {/if}
        {:else}
          <details class="extension-details">
            <summary>{message.content}</summary>
            {message.expandMessage}
          </details>
        {/if}
      {/snippet}
    </LegacyCommentViewItem>
  </div>
{/snippet}

<div bind:this={listView} class="comment-list" tabindex="-1">
  {#each MessageStore.messages as message (message.id)}
    {#if message.platformId === "nicolive"}
      {@const visible = checkVisible(message)}
      {#if visible}
        {@render NicoliveMessageView(message)}
      {/if}
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
