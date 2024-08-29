<script lang="ts">
  import { CommentFormat } from "../store/data";
  import { store } from "../store/store.svelte";

  let { format = $bindable() }: { format: CommentFormat } = $props();
</script>

<fieldset>
  <legend>背景色</legend>
  <div style="display: flex;">
    <input type="color" bind:value={format.backgroundColor} />
    <input
      type="text"
      placeholder="透明"
      style="width: 100%;"
      bind:value={format.backgroundColor}
    />
  </div>
</fieldset>

<fieldset>
  <legend>名前色</legend>
  <div style="display: flex;">
    <input type="color" bind:value={format.nameColor} />
    <input
      type="text"
      placeholder={store.commentView.commentFormats.default.nameColor}
      style="width: 100%;"
      bind:value={format.nameColor}
    />
  </div>
</fieldset>

<fieldset>
  <legend>コメント色</legend>
  <div style="display: flex;">
    <input type="color" bind:value={format.contentColor} />
    <input
      type="text"
      placeholder={store.commentView.commentFormats.default.contentColor}
      style="width: 100%;"
      bind:value={format.contentColor}
    />
  </div>
</fieldset>

<fieldset>
  <legend>フォント</legend>
  <input
    type="text"
    placeholder={store.commentView.commentFormats.default.fontFamily}
    bind:value={format.fontFamily}
  />
</fieldset>

<fieldset>
  <legend>フォントサイズ</legend>
  <input
    type="number"
    placeholder={store.commentView.commentFormats.default.fontSize as unknown as string}
    bind:value={format.fontSize}
  />
</fieldset>

<div class="line">
  <input type="checkbox" id="isBold" bind:checked={format.isBold} />
  <label for="isBold">太字</label>
</div>

<div class="line">
  <input type="checkbox" id="isItally" bind:checked={format.isItally} />
  <label for="isItally">斜体</label>
</div>
