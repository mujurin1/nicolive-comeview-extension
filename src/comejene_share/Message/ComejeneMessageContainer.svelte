<script lang="ts">
  import type { ComejeneMotionMessage } from "../Motion/type";

  let { message }: { message: ComejeneMotionMessage } = $props();

  /** 1x1 透明 */
  const nicoliveNoneIcon =
    "data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7";
  function onErrorImage(e: Event): void {
    const img = e.currentTarget as HTMLImageElement;
    if (img.src === nicoliveNoneIcon) return;
    img.src = nicoliveNoneIcon;
  }

  console.log($state.snapshot(message.content.name));
</script>

<!--
  div.message-container >
    +div.content-frame.コンテンツ名 > div.content > CONTENT
 -->

<div bind:this={message.node} class="message-container">
  <div class="content-frame icon">
    <!-- svelte-ignore a11y_missing_attribute -->
    <img class="content" onerror={onErrorImage} src={message.content.icon} />
  </div>
  <div class="content-frame name">
    <div class="content">
      {message.content.name ?? "　"}
    </div>
  </div>
  <div class="content-frame message">
    <div class="content">
      {message.content.message}
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
