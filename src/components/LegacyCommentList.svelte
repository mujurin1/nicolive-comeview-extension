<script lang="ts">
    import { tick } from "svelte";
    import { getCssClassNameFromMessage } from "../store/CssStyle.svelte";
    import { Nicolive, type NicoliveUser } from "../store/Nicolive.svelte";
    import { store } from "../store/store.svelte";
    import { onErrorImage } from "../utils";
    import { settingPage } from "../view/Setting.svelte";

  let listView: HTMLDivElement;

  $effect.pre(() => {
    Nicolive.messages.length;

    const autoscroll =
      listView && listView.offsetHeight + listView.scrollTop > listView.scrollHeight - 50;

    if (autoscroll) {
      tick().then(() => {
        listView!.scrollTo(0, listView!.scrollHeight);
      });
    }
  });
</script>

<div bind:this={listView} class="comment-list" tabindex="-1">
  {#each Nicolive.messages as message}
    {@const user: NicoliveUser | undefined = Nicolive.users[message.userId!]}
    {@const isFirst = message.no != null && user?.firstNo === message.no}
    {@const hideSharp = store.state.general.hideSharp && message.type === "listener" && /[♯#＃]/.test(message.content)}
    <!--  -->
    <!-- <div class={`comment cm-default ${isFirst ? "cm-first" : ""} ${getCssClassNameFromMessage(message)}`}> -->
    <div
      class={`comment cm-default ${getCssClassNameFromMessage(message)}`}
      class:cm-owner={message.type === "owner"}
      class:cm-first={isFirst}
    >
      <div class="child no">{message.no}</div>
      {#if hideSharp}
        <div class="child icon"></div>
        <div class="child name">#シャープ#</div>
      {:else}
        <div class="child icon">
          {#if user != null}
            <!-- svelte-ignore a11y_missing_attribute -->
            <img src={message.iconUrl} onerror={onErrorImage} />
          {/if}
        </div>
        {#if (message.name ?? message.userId) !== null}
          {#if user == null}
            <div class="child name"></div>
          {:else}
            {@const name = (store.state.general.useKotehan && user.storeUser.kotehan) ? user.storeUser.kotehan : user.storeUser.name}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              class="child name"
              title={message.name ?? (message.userId as string)}
              role="button"
              tabindex="-1"
              onclick={() => {
                settingPage.openListener(`id:${user.id}`);
              }}
            >
                <!-- name が存在するのは生IDだけ -->
                {name ?? ((store.state.general.nameToNo && user.noName184) ? user.noName184 : user.id)}
            </div>
          {/if}
        {/if}
      {/if}
      <div class="child time">{message.time}</div>
      <div class="child content">
        {#if hideSharp}
          ＃シャープコメントだよ＃
        {:else if message.link == null}
          {message.content}
        {:else}
          <a href={message.link} target="_blank" title={message.link}>{message.content}</a>
        {/if}
      </div>
    </div>
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

  .comment {
    display: flex;
    min-height: 30px;

    /* font-size: 1rem; */
    border-top: 1px solid black;

    & > .child {
      margin-right: 6px;
      display: flex;
      align-items: center;
    }

    & > .no {
      flex: 0 0 40px;
      display: flex;
      justify-content: flex-end;
      padding-right: 5px;
    }
    & > .icon {
      flex: 0 0 30px;

      & > img {
        height: 30px;
      }
    }
    & > .name {
      flex: 0 0 100px;
      overflow: hidden;
      white-space: nowrap;

      &[role="button"] {
        cursor: pointer;
      }
    }
    & > .time {
      flex: 0 1 auto;
    }
    & > .content {
      flex: 1 0 10px;
    }
  }
</style>
