<script lang="ts">
  import type { ComejeneMotionMessage } from "../Motion";

  let { message }: { message: ComejeneMotionMessage } = $props();

  let show = $state(false);

  setTimeout(() => {
    void message.node.offsetWidth;
    show = true;
  }, 100);

  /** 1x1 透明 */
  const nicoliveNoneIcon =
    "data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7";
  function onErrorImage(e: Event): void {
    const img = e.currentTarget as HTMLImageElement;
    if (img.src === nicoliveNoneIcon) return;
    img.src = nicoliveNoneIcon;
  }
</script>

<!--
  div.message-container >
    +div.content-frame.コンテンツ名 > div.content > CONTENT
 -->

<div bind:this={message.node} class="message-container" class:show>
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
  .content {
    font-family: "Segoe UI Emoji";
  }

  .message-container {
    opacity: 1;
    &:not(.show) {
      opacity: 0;
    }
  }
</style>
