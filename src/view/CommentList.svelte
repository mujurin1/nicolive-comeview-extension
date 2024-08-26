<script lang="ts">
  import { tick } from "svelte";
  import { Nicolive, type NicoliveUser } from "../store/Nicolive.svelte";
  import { store } from "../store/store.svelte";
  import { iconNone } from "../utils";

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

  function onErrorImage(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    img.src = iconNone;
  }
</script>

<div bind:this={listView} class="comment-list" tabindex="-1">
  {#each Nicolive.messages as comment}
    {@const user: NicoliveUser | undefined = Nicolive.users[comment.userId!]}
    {@const bold = store.general.firstIsBold && comment.no != null && user?.firstNo === comment.no}
    {@const hideSharp = store.general.hideSharp && comment.type === "listener" && /[♯#＃]/.test(comment.content)}
    <div class="comment" class:bold>
      <div class="child no">{comment.no}</div>
      {#if hideSharp}
        <div class="child icon"></div>
        <div class="child name"></div>
      {:else}
        <div class="child icon">
          <!-- svelte-ignore a11y_missing_attribute -->
          <img src={comment.iconUrl} onerror={onErrorImage} />
        </div>
        {#if (comment.name ?? comment.userId) !== null}
          <div class="child name" title={comment.name ?? (comment.userId as string)}>
            {#if user != null}
              {@const name = (store.general.useKotehan && user.storeUser.kotehan) ? user.storeUser.kotehan : user.storeUser.name}
              <!-- name が存在するのは生IDだけ -->
              {name ?? ((store.general.nameToNo && user.noName184) ? user.noName184 : user.id)}
            {/if}
          </div>
        {/if}
      {/if}
      <div class="child time">{comment.time}</div>
      <div class="child content">
        {#if hideSharp}
          ＃シャープコメントだよ＃
        {:else if comment.link == null}
          {comment.content}
        {:else}
          <a href={comment.link} target="_blank" title={comment.link}>{comment.content}</a>
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

    font-size: 1rem;
    border-bottom: 1px solid black;

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
