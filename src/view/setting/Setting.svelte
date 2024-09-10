<script module>
  import { notifierStore } from "../../lib/CustomStore.svelte";
  import type { SettingState } from "../../store/SettingStore.svelte";
  import { SettingStore } from "../../store/SettingStore.svelte";
  import type { DeepMutable } from "../../utils";

  export const settingStore = notifierStore(
    SettingStore.state as DeepMutable<SettingState>,
    () => {
      SettingStore.save();
    }
  );
</script>

<script lang="ts">
  import { tick } from "svelte";
  import Tab from "../../components/Tab.svelte";
  import AdvancedSetting from "./AdvancedSetting.svelte";
  import GeneralSetting from "./GeneralSetting.svelte";
  import ListenerSetting from "./ListenerSetting.svelte";
  import ViewSetting from "./ViewSetting.svelte";
  import YomiageSetting from "./YomiageSetting.svelte";

  const names = ["一般", "読み上げ","リスナー", "コメント表示", "Advanced"] as const;
  let currentTab = $state<typeof names[number]>("一般");
  let show = $state(false);

  let dialog = $state<HTMLDialogElement>();
  let listenerSetting = $state<ListenerSetting>();
  let serchQuery = $state("");

  export async function openSetting(_show: boolean, tab?:typeof names[number]) {
    show = _show;
    await tick();

    if(tab != null) currentTab = tab;
    if (show) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  }

  export async function openListener(serchQuery: string) {
    openSetting(true);
    currentTab = "リスナー";

    await tick();
    listenerSetting?.setSerchQuery(serchQuery);
  }
</script>

{#if show}
  <dialog bind:this={dialog} class="mordal">
    <button class="close-btn" onclick={() => show = false}>閉じる</button>

    <div class="mordal-body">
      <Tab {names} bind:currentTab>
        {#snippet content(tabId)}
          <div class="content" data-tabId={tabId}>
            {#if tabId === "一般"}
              <GeneralSetting />
            {:else if tabId === "読み上げ"}
              <YomiageSetting />
            {:else if tabId === "リスナー"}
              <ListenerSetting bind:this={listenerSetting} bind:serchQuery />
            {:else if tabId === "コメント表示"}
              <ViewSetting />
            {:else if tabId === "Advanced"}
              <AdvancedSetting />
            {/if}
          </div>
        {/snippet}  <!-- このエラーは svelte の不具合ぽいので無視する -->
      </Tab>
    </div>
  </dialog>
{/if}

<style>
  * {
    :global(select) {
      width: 140px;
    }
    :global(button) {
      min-width: 80px;
    }
    :global(input[type="radio"]) {
      margin: 0;

      :global(& + label) {
        padding-left: 5px;

        :global(&:not(:last-child)) {
          margin-right: 10px;
        }
      }
    }
    :global(input[type=checkbox]) {
      min-width: 20px;
    }
    :global(input[type=number]) {
      width: 80px;
    }
  }

  .mordal {
    background-color: #c0cbd6;

    width: 80%;
    height: 80%;

    padding: 0;
    border: 2px solid black;

    &:focus {
      outline: none;
    }
  }

  * {
    :global(.tab-header) {
      margin-right: 70px;

      :global(& > .tab-name) {
        background-color: #e2e2e2;

        :global(&.selected) {
          background-color: #ffeec3;
        }
      }
    }
  }

  .close-btn {
    position: absolute;
    right: 10px;
    top: 5px;
    min-width: auto;
  }
  .mordal-body {
    height: 100%;
    overflow-y: auto;
  }

  .content {
    background-color: #ffeec3;
    overflow-y: auto;
    overflow-x: hidden;

    box-sizing: border-box;
    height: 100%;
    padding: 15px;

    :global(&:not([data-tabid="Advanced"])) {
      font-size: 1rem;

      :global(& > *:not(:last-child)) {
        margin-bottom: 15px;
      }
    }
  }


  :global(.hint) {
    margin-top: -3px;
  }

</style>
