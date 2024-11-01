<script lang="ts">
  import type { MotionMessage } from "../Motion/Interface";

  let { message }: { message: MotionMessage } = $props();
</script>

<!--
  div.message-container >
    +div.content-frame.コンテンツ名 > div.content > CONTENT
 -->

<div bind:this={message.node} class="message-container">
  <div class="content-frame icon">
    <!-- svelte-ignore a11y_missing_attribute -->
    <img
      class="content"
      src="https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/3110/31103661.jpg"
    />
  </div>
  <div class="content-frame name">
    <div class="content">
      {message.contents.name}
    </div>
  </div>
  <div class="content-frame message">
    <div class="content">
      {message.contents.message}
    </div>
  </div>
</div>

<!-- この style は全てデバッグ用 -->
<style>
  .content-frame {
    border: 1px solid red;
  }

  .content {
    font-family: "Segoe UI Emoji";
  }
</style>
