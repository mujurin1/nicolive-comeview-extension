<script
  generics="
    Root extends MyzRoot,
    Setting extends MyzState<Root>,
    Switch extends MyzSwitch<Setting>,
  "
  lang="ts"
>
  import { untrack } from "svelte";
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import type { MyzRoot, MyzState, MyzSwitch } from "../../lib/Myz/index.svelte";
  import MyzRootView from "./MyzRootView.svelte";

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
      // TODO: 何故かこれではeffectされない
      // style.state = selectItem.bind(itemState.state);
      _style = selectItem.bind(itemState.state);
    },
    () => _switch.items[selectKey.state].createState(untrack(() => style.state)),
  );
</script>

<div class="myz-switch">
  <div class="myz-switch-header">
    <div class="myz-switch-label">{display}</div>
    <select class="myz-switch-selector" bind:value={$selectKey}>
      {#each keys as value (value)}
        <option {value}>{value}</option>
      {/each}
    </select>
  </div>

  {#key itemState.state}
    <MyzRootView {indent} {path} root={selectItem} bind:style={$itemState} />
  {/key}
</div>

<style>
  .myz-switch-header {
    display: flex;
    justify-content: space-between;

    .myz-switch-label {
      flex: 1 0 0;
      column-gap: 6px;
    }
    .myz-switch-selector {
      flex: 0 1 0;
    }
  }
</style>
