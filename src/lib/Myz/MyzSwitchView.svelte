<script
  generics="
    Root extends MyzRoot,
    Setting extends MyzState<Root>,
    Switch extends MyzSwitch<Setting>,
  "
  lang="ts"
>
  import type { MyzRoot, MyzState, MyzSwitch } from ".";
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import MyzRootView from "./MyzRootView.svelte";

  let {
    display,
    style = $bindable(),
    switch: _switch,
    path,
  }: {
    display: string;
    style: Setting;
    switch: Switch;
    path: string;
  } = $props();

  const keys = Object.keys(_switch.blocks);
  let selectKey = notifierStore(
    _switch.blocks[_switch.defaultSelectKey ?? keys[0]].key,
    () => {
      itemState.state = _switch.blocks[selectKey.state].toBlockState(style);
    },
    () => _switch.blocks[keys[0]].key,
  );
  let selectItem = $derived(_switch.blocks[selectKey.state]);
  let itemState = notifierStore(
    _switch.blocks[selectKey.state].toBlockState(style), //
    () => {
      style = selectItem.bind(itemState.state);
    },
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

  <div class="myz-switch-content">
    {#key itemState.state}
      <MyzRootView {path} root={selectItem} bind:style={$itemState} />
    {/key}
  </div>
</div>

<style>
  .myz-switch {
    --switch-back-color: hsl(222, 100%, 90%);
    --switch-brder-color: hsl(222, 100%, 80%);
    --switch-brder-radius: 5px;
    --switch-brder-width: 2px;

    .myz-switch-header > .myz-switch-selector {
      background-color: var(--switch-back-color);
      border: var(--switch-brder-width) solid var(--switch-brder-color);
      border-bottom-width: 0;
      border-radius: var(--switch-brder-radius) var(--switch-brder-radius) 0 0;
      margin-bottom: calc(-1 * var(--switch-brder-width));

      &:focus {
        outline: none;
      }
    }
    .myz-switch-content {
      background-color: var(--switch-back-color);
      padding: 3px;
      border: var(--switch-brder-width) solid var(--switch-brder-color);
      border-radius: var(--switch-brder-radius);
      border-top-right-radius: 0;
    }
  }

  .myz-switch-header {
    display: flex;
    justify-content: space-between;

    .myz-switch-label {
      flex: 1 0 0;
    }
    .myz-switch-selector {
      flex: 0 1 0;
    }
  }
</style>
