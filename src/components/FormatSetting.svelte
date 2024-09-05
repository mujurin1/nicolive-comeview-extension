<script lang="ts">
  import { notifierStore } from "../lib/CustomStore.svelte";
  import { CommentFormat } from "../store/data";
  import { store } from "../store/store.svelte";

  let { format = $bindable()}: { format: CommentFormat } = $props();

  const isDefault = format === store.state.commentView.commentFormats.default;
  const trueFalseNull = isDefault ? [false, true] : [null, false, true]

  const formatS = notifierStore(
    format,
    () => {
      CommentFormat.fix(formatS.state);      
      format = formatS.state;
    },
  );  

</script>
<div class="grid-row">
  <fieldset>
    <legend>背景色</legend>
    <div class="item" class:setted={!isDefault && format.backgroundColor != null} style="display: flex;">
      <input type="color" bind:value={$formatS.backgroundColor} />
      <input
        type="text"
        placeholder={isDefault ? "透明" :`デフォルト (${store.state.commentView.commentFormats.default.backgroundColor ?? "透明"})`}
        style="width: 100%;"
        bind:value={$formatS.backgroundColor}
      />
    </div>
  </fieldset>

  <fieldset>
    <legend>名前色</legend>
    <div class="item" class:setted={!isDefault && format.nameColor != null}>
      <input type="color" bind:value={$formatS.nameColor} />
      <input
        type="text"
        placeholder={isDefault ? "black" :`デフォルト (${store.state.commentView.commentFormats.default.nameColor ?? "black"})`}
        style="width: 100%;"
        bind:value={$formatS.nameColor}
      />
    </div>
  </fieldset>

  <fieldset>
    <legend>コメント色</legend>
    <div class="item" class:setted={!isDefault && format.contentColor != null}>
      <input type="color" bind:value={$formatS.contentColor} />
      <input
        type="text"
        style="width: 100%;"
        placeholder={isDefault ? "black" :`デフォルト (${store.state.commentView.commentFormats.default.contentColor ?? "black"})`}
        bind:value={$formatS.contentColor}
      />
    </div>
  </fieldset>
</div>

<div class="grid-row">
  <fieldset>
    <legend>フォント</legend>
    <input
      class="item"
      class:setted={!isDefault && format.fontFamily != null}
      type="text"
      placeholder={isDefault ? "" :`デフォルト (${store.state.commentView.commentFormats.default.fontFamily})`}
      bind:value={$formatS.fontFamily}
    />
  </fieldset>

  <fieldset>
    <legend>フォントサイズ</legend>
    <input
      class="item"
      class:setted={!isDefault && format.fontSize != null}
      type="number"
      placeholder={isDefault ? "" :`デフォルト (${store.state.commentView.commentFormats.default.fontSize as unknown as string})`}
      bind:value={$formatS.fontSize}
    />
  </fieldset>
</div>

<div class="grid-row">
  <fieldset>
    <legend>太字</legend>
    <select class="item" class:setted={!isDefault && format.isBold != null} bind:value={$formatS.isBold}>
      <!-- ３つ目の値が undefined だと初期値が設定されてしまうため null を使う -->
      {#each trueFalseNull as value}
      <option {value} selected={value === $formatS.isBold}>
        {value ?? `デフォルト (${store.state.commentView.commentFormats.default.isBold})`}
      </option>
      {/each}
    </select>
  </fieldset>

  <fieldset>
    <legend>イタリック体</legend>
    <select class="item" class:setted={!isDefault && format.isItally != null} bind:value={$formatS.isItally}>
      {#each trueFalseNull as value}
      <option {value}>
        {value ?? `デフォルト (${store.state.commentView.commentFormats.default.isItally})`}
      </option>
      {/each}
    </select>
  </fieldset>
</div>

<style>
  .item {
    display: flex;

    &.setted {
      /* background-color: antiquewhite; */
      background-color: #dddcd0;
    }
  }
</style>
