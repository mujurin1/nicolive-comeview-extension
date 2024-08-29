<script lang="ts">
  import { tick } from "svelte";
  import { getCssClassNameFromMessage } from "../store/CssStyle.svelte";
  import { Nicolive, type NicoliveUser } from "../store/Nicolive.svelte";
  import { store } from "../store/store.svelte";
  import { onErrorImage } from "../utils";

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

<div bind:this={listView} class="comment-list">
  {#each Nicolive.messages as message}
    {@const user: NicoliveUser | undefined = Nicolive.users[message.userId!]}
    {@const bold = store.general.firstIsBold && message.no != null && user?.firstNo === message.no}
    {@const hideSharp = store.general.hideSharp && message.type === "listener" && /[♯#＃]/.test(message.content)}
    <div class={`comment cm-default ${getCssClassNameFromMessage(message)}`} class:bold>
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
          <div class="child name" title={message.name ?? (message.userId as string)}>
            {#if user != null}
              {@const name = (store.general.useKotehan && user.storeUser.kotehan) ? user.storeUser.kotehan : user.storeUser.name}
              <!-- name が存在するのは生IDだけ -->
              {name ?? ((store.general.nameToNo && user.noName184) ? user.noName184 : user.id)}
            {/if}
          </div>
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
      display: flex;
      justify-content: flex-end;
      flex: 0 0 40px;
      padding-right: 5px;
    }
    & > .icon {
      flex: 0 0 30px;

      & > img {
        height: 30px;
      }
    }
    & > .name {
      cursor: pointer;
      flex: 0 0 100px;
      overflow: hidden;
      white-space: nowrap;
    }
    & > .time {
      flex: 0 0 50px;
    }
    & > .content {
      flex: 1 0 10px;
    }
  }

  .bold {
    font-weight: bold;
  }
</style>
