<script
  generics="
    Root extends MyzRoot,
    State extends MyzState<Root>,
    Switch extends MyzSwitch<State>,
  "
  lang="ts"
>
  import { untrack } from "svelte";

  import type { MyzRoot, MyzState, MyzSwitch } from ".";
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import MyzRootView from "./MyzRootView.svelte";

  let {
    display,
    state = $bindable(),
    switch: _switch,
    path,
  }: {
    display: string;
    state: State;
    switch: Switch;
    path: string;
  } = $props();

  const keys = Object.keys(_switch.blocks);
  let selectKey = notifierStore(
    _switch.blocks[_switch.selectKey(state)].key,
    () => {
      itemState.state = _switch.blocks[selectKey.state].toBlockState(state);
      untrack(() => {
        console.log("update");
        if (_switch.updateWithChangeKey) {
          state = selectItem.bind(itemState.state);
        }
      });
    },
    () => _switch.blocks[_switch.selectKey(untrack(() => state))].key,
  );
  let selectItem = $derived(_switch.blocks[selectKey.state]);
  let itemState = notifierStore(
    _switch.blocks[selectKey.state].toBlockState(state), //
    () => {
      state = selectItem.bind(itemState.state);
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

  <div class="myz-switch-content" class:hide={Object.keys(selectItem.block).length === 0}>
    {#key itemState.state}
      <MyzRootView {path} root={selectItem} bind:state={$itemState} />
    {/key}
  </div>
</div>

<style>
  .myz-switch {
    /* --switch-back-color: hsl(222, 100%, 90%); */
    --switch-back-color: transparent;
    --switch-brder-color: hsl(222, 100%, 80%);
    --switch-brder-radius: 5px;
    --switch-brder-width: 2px;
    --switch-focus-outline-color: hsl(222, 100%, 60%);
    min-height: 2em;

    .myz-switch-header > .myz-switch-selector {
      width: auto;
      background-color: var(--switch-back-color);
      border: var(--switch-brder-width) solid var(--switch-brder-color);
      border-radius: var(--switch-brder-radius) var(--switch-brder-radius) 0 0;
      margin-bottom: calc(-1 * var(--switch-brder-width));

      &:focus {
        outline-color: var(--switch-focus-outline-color);
      }
    }
    .myz-switch-content {
      background-color: var(--switch-back-color);
      /* padding: 3px; */
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

  .hide {
    display: none;
  }
</style>
