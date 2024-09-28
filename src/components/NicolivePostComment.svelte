<script lang="ts">
  import { onMount } from "svelte";
  import { Nicolive } from "../Platform";
  import { SettingStore } from "../store/SettingStore.svelte";
  import { settingViewStore } from "../view/setting/Setting.svelte";

  let isLogined = $state(Nicolive.pageData?.nicoliveInfo?.loginUser != null);
  let isBroadcaster = $state(Nicolive.pageData?.nicoliveInfo?.loginUser?.isBroadcaster);

  let inputCommentArea: HTMLTextAreaElement;
  let comment = $state("");
  let isPostBroadcaster = $state(isBroadcaster);
  let canPostComment = $derived(isLogined && Nicolive.state === "opened");

  onMount(() => {
    const commentArea = inputCommentArea;
    commentArea.addEventListener("keydown", onKeyDown);

    return () => commentArea.removeEventListener("keydown", onKeyDown);

    async function onKeyDown(e: KeyboardEvent) {
      if (!e.shiftKey && e.key === "Enter") {
        if (comment) postComment();
        e.preventDefault();
      }
    }
  });

  function postComment() {
    if (isPostBroadcaster) {
      void Nicolive.postBroadcasterComment(comment);
    } else {
      Nicolive.postComment(comment, SettingStore.state.nicolive.post184);
    }
    comment = "";
  }
</script>

<div class="nicolive-comment-form">
  <div class="command-area">
    <div class="line">
      <input
        id="is184"
        type="checkbox"
        bind:checked={$settingViewStore.nicolive.post184}
        disabled={isPostBroadcaster}
      />
      <label class:disabled={isPostBroadcaster} for="is184">184</label>
    </div>

    <div class="line">
      <input
        id="isBroadcaster"
        type="checkbox"
        bind:checked={isPostBroadcaster}
        disabled={!isBroadcaster}
      />
      <label class:disabled={!isBroadcaster} for="isBroadcaster">主コメ</label>
    </div>
  </div>

  <div class="input-comment-area">
    <textarea
      bind:this={inputCommentArea}
      class="input-comment"
      class:broadcaster={isPostBroadcaster}
      rows="3"
      placeholder={`${
        isPostBroadcaster
          ? "生主"
          : $settingViewStore.nicolive.post184
            ? "184"
            : Nicolive.pageData?.nicoliveInfo.loginUser?.name
      } として投稿\n\n  Enter で投稿  Shift+Enter で改行`}
      bind:value={comment}
      disabled={!canPostComment}
    ></textarea>
  </div>

  <div class="send-button-area">
    <button type="button" onclick={postComment} disabled={!canPostComment}>送信</button>
  </div>
</div>

<style>
  input[type="checkbox"] {
    height: 15px;
  }
  label {
    font-size: 0.9rem;
  }

  .nicolive-comment-form {
    display: flex;
    align-items: stretch;
    background-color: #efefef;
    box-sizing: border-box;
    gap: 5px;
    padding: 3px 5px 3px 5px;
  }

  .command-area {
    flex: 0 1 content;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  .input-comment-area {
    flex: 1 1 content;

    & > .input-comment {
      box-sizing: border-box;
      height: 100%;
      width: 100%;
      resize: none;

      &:focus {
        outline-color: skyblue;
      }
    }

    & > .broadcaster {
      background-color: #fde7e7ad;
    }
  }

  .send-button-area {
    flex: 0 1 content;
    display: flex;
    flex-direction: column;
    margin: auto 0 0 0;
  }

  .line {
    column-gap: 5px;
  }
</style>
