<script
  generics="
    Definition extends MyzRoot,
    Setting extends MyzState<Definition>,
    Switch extends MyzSwitch<Setting>,
  "
  lang="ts"
>
  import { untrack } from "svelte";
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import type { MyzRoot, MyzState, MyzSwitch } from "../../lib/Myz/index.svelte";
  import StyleSetting from "./StyleSetting.svelte";

  let {
    display,
    style: _style = $bindable(),
    switch: _switch,
    indent = 1,
    path,
  }: {
    display: string;
    style: Setting;
    switch: Switch;
    indent?: number;
    path: string;
  } = $props();

  let style = notifierStore(_style, () => {
    // 何故か下のTODO部分で変更してもEffectされない
    // _style = style.state;
  });

  const keys = Object.keys(_switch.items);
  let selectKey = notifierStore(
    _switch.items[keys[0]].key,
    () => {
      itemState.state = _switch.items[selectKey.state].createState(style.state);
    },
    () => _switch.items[keys[0]].key,
  );
  let selectItem = $derived(_switch.items[selectKey.state]);
  let itemState = notifierStore(
    _switch.items[selectKey.state].createState(style.state),
    () => {
      // TODO: 何故かこれでeffectされない
      // style.state = selectItem.bind(itemState.state);
      _style = selectItem.bind(itemState.state);
    },
    () => _switch.items[selectKey.state].createState(untrack(() => style.state)),
  );
</script>

<!-- indent={indent+1} -->
<div class="setting-block-switch">
  <div class="setting-block-switch-header">
    <div class="setting-block-switch-label">{display}</div>
    <select class="setting-block-switch-selector" bind:value={$selectKey}>
      {#each keys as value (value)}
        <option {value}>{value}</option>
      {/each}
    </select>
  </div>

  {#key itemState.state}
    <StyleSetting definition={selectItem} {indent} {path} bind:style={$itemState} />
  {/key}
</div>

<style>
  .setting-block-switch-header {
    display: flex;
    justify-content: space-between;

    .setting-block-switch-label {
      flex: 1 0 0;
      column-gap: 6px;
    }
    .setting-block-switch-selector {
      flex: 0 1 0;
    }
  }
</style>
