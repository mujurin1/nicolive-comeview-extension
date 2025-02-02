<script lang="ts">
  import { notifierStore } from "../lib/CustomStore.svelte";
  import { CommentFormat, SettingStore } from "../store/SettingStore.svelte";
  import ColorPicker from "./ColorPicker.svelte";

  let { format = $bindable() }: { format: CommentFormat } = $props();

  const isDefault = format === SettingStore.state.commentView.commentFormats.default;
  const trueFalseNull = isDefault ? [true, false] : [null, true, false];

  const formatS = notifierStore(
    format,
    () => {
      CommentFormat.fix(formatS.state);
      format = formatS.state;
    },
    () => format,
  );
</script>

<div class="grid-row">
  <fieldset>
    <legend>背景色</legend>
    <div
      style:display="flex"
      class="item"
      class:setted={!isDefault && format.backgroundColor != null}
    >
      <ColorPicker --picker-z-index="1" bind:value={$formatS.backgroundColor} />
      <input
        style:width="100%"
        placeholder={isDefault
          ? "透明"
          : `デフォルト (${SettingStore.state.commentView.commentFormats.default.backgroundColor ?? "透明"})`}
        type="text"
        bind:value={$formatS.backgroundColor}
      />
    </div>
  </fieldset>

  <fieldset>
    <legend>名前色</legend>
    <div class="item" class:setted={!isDefault && format.nameColor != null}>
      <ColorPicker --picker-z-index="1" bind:value={$formatS.nameColor} />
      <input
        style:width="100%"
        placeholder={isDefault
          ? "black"
          : `デフォルト (${SettingStore.state.commentView.commentFormats.default.nameColor ?? "black"})`}
        type="text"
        bind:value={$formatS.nameColor}
      />
    </div>
  </fieldset>

  <fieldset>
    <legend>コメント色</legend>
    <div class="item" class:setted={!isDefault && format.contentColor != null}>
      <ColorPicker --picker-z-index="1" bind:value={$formatS.contentColor} />
      <input
        style:width="100%"
        placeholder={isDefault
          ? "black"
          : `デフォルト (${SettingStore.state.commentView.commentFormats.default.contentColor ?? "black"})`}
        type="text"
        bind:value={$formatS.contentColor}
      />
    </div>
  </fieldset>
</div>

<fieldset>
  <legend>フォント</legend>
  <input
    class="item"
    class:setted={!isDefault && format.fontFamily != null}
    placeholder={isDefault
      ? "既定値"
      : `デフォルト (${SettingStore.state.commentView.commentFormats.default.fontFamily ?? "既定値"})`}
    type="text"
    bind:value={$formatS.fontFamily}
  />
</fieldset>

<div class="grid-row">
  <fieldset>
    <legend>フォントサイズ（px）</legend>
    <input
      class="item"
      class:setted={!isDefault && format.fontSize != null}
      placeholder={isDefault
        ? ""
        : `デフォルト (${SettingStore.state.commentView.commentFormats.default.fontSize as unknown as string})`}
      type="number"
      bind:value={$formatS.fontSize}
    />
  </fieldset>

  <fieldset>
    <legend>太字</legend>
    <select
      class="item"
      class:setted={!isDefault && format.isBold != null}
      bind:value={$formatS.isBold}
    >
      <!-- ３つ目の値が undefined だと初期値が設定されてしまうため null を使う -->
      {#each trueFalseNull as value (value)}
        <option selected={value === $formatS.isBold} {value}>
          {value ?? `デフォルト (${SettingStore.state.commentView.commentFormats.default.isBold})`}
        </option>
      {/each}
    </select>
  </fieldset>

  <fieldset>
    <legend>イタリック体</legend>
    <select
      class="item"
      class:setted={!isDefault && format.isItally != null}
      bind:value={$formatS.isItally}
    >
      {#each trueFalseNull as value (value)}
        <option {value}>
          {value ??
            `デフォルト (${SettingStore.state.commentView.commentFormats.default.isItally})`}
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
