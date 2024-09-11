<script lang="ts">
  import { Nicolive } from "../function/Nicolive.svelte";

  let isLogined = $state(Nicolive.client?.info?.loginUser != null);
  let isBroadcaster = $state(Nicolive.client?.info?.loginUser?.isBroadcaster);

  let comment = $state("");
  let isPost184 = $state(true);
  let isPostBroadcaster = $state(isBroadcaster);

  function postComment() {
    if (isPostBroadcaster) {
      Nicolive.client!.postBroadcasterComment(comment);
    } else {
      Nicolive.client!.postComment(comment, isPost184);
    }
    comment = "";
  }
</script>

<div class="nicolive-comment-form">
  <div class="command-area">
    <div class="line">
      <input id="is184" type="checkbox" bind:checked={isPost184} disabled={isPostBroadcaster} />
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
      class="input-comment"
      class:broadcaster={isPostBroadcaster}
      rows="3"
      placeholder={`${
        isPostBroadcaster ? "生主" : isPost184 ? "184" : Nicolive.client?.info.loginUser?.name
      } として投稿`}
      bind:value={comment}
    ></textarea>
  </div>

  <div class="send-button-area">
    <button type="button" onclick={postComment} disabled={!isLogined}>送信</button>
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
