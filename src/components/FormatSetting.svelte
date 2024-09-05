<script lang="ts">
  import { notifierStore } from "../lib/CustomStore.svelte";
  import { CommentFormat } from "../store/data";
  import { store } from "../store/store.svelte";

  let { format = $bindable() }: { format: CommentFormat } = $props();

  const formatS = notifierStore(format, () => {
    format = formatS.state;
  });

</script>

<div class="grid-row">
  <fieldset>
    <legend>背景色</legend>
    <div style="display: flex;">
      <input type="color" bind:value={$formatS.backgroundColor} />
      <input
        type="text"
        placeholder={`デフォルト (${store.state.commentView.commentFormats.default.backgroundColor ?? "透明"})`}
        style="width: 100%;"
        bind:value={$formatS.backgroundColor}
      />
    </div>
  </fieldset>

  <fieldset>
    <legend>名前色</legend>
    <div style="display: flex;">
      <input type="color" bind:value={$formatS.nameColor} />
      <input
        type="text"
        placeholder={`デフォルト (${store.state.commentView.commentFormats.default.nameColor ?? "透明"})`}
        style="width: 100%;"
        bind:value={$formatS.nameColor}
      />
    </div>
  </fieldset>

  <fieldset>
    <legend>コメント色</legend>
    <div style="display: flex;">
      <input type="color" bind:value={$formatS.contentColor} />
      <input
        type="text"
        placeholder={`デフォルト (${store.state.commentView.commentFormats.default.contentColor ?? "透明"})`}
        style="width: 100%;"
        bind:value={$formatS.contentColor}
      />
    </div>
  </fieldset>
</div>

<div class="grid-row">
  <fieldset>
    <legend>フォント</legend>
    <input
      type="text"
      placeholder={`デフォルト (${store.state.commentView.commentFormats.default.fontFamily})`}
      bind:value={$formatS.fontFamily}
    />
  </fieldset>

  <fieldset>
    <legend>フォントサイズ</legend>
    <input
      type="number"
      placeholder={`デフォルト (${store.state.commentView.commentFormats.default.fontSize as unknown as string})`}
      bind:value={$formatS.fontSize}
    />
  </fieldset>
</div>

<div class="grid-row">
  <fieldset>
    <legend>太字</legend>
    <select bind:value={$formatS.isBold}>
      <!-- ３つ目の値が undefined だと初期値が設定されてしまうため null を使う -->
      {#each [true, false, null] as value}
      <option {value} selected={value === $formatS.isBold}>
        {value ?? `デフォルト (${store.state.commentView.commentFormats.default.isBold})`}
      </option>
      {/each}
    </select>
  </fieldset>

  <fieldset>
    <legend>イタリック体</legend>
    <select bind:value={$formatS.isItally}>
      {#each [true, false, null] as value}
      <option {value}>
        {value ?? `デフォルト (${store.state.commentView.commentFormats.default.isItally})`}
      </option>
      {/each}
    </select>
  </fieldset>
</div>
