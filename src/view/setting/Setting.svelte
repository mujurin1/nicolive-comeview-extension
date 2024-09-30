<script lang="ts">
  import { tick } from "svelte";
  import Tab from "../../components/Tab.svelte";
  import AdvancedSetting from "./AdvancedSetting.svelte";
  import GeneralSetting from "./GeneralSetting.svelte";
  import NicoliveSetting from "./NicoliveSetting.svelte";
  import UsersSetting from "./UsersSetting.svelte";
  import ViewSetting from "./ViewSetting.svelte";
  import YomiageSetting from "./YomiageSetting.svelte";

  export const names = ["一般", "読み上げ", "ニコ生", "リスナー", "コメント表示", "フィードバック", "Advanced"] as const;
  type TabNames = typeof names[number];

  let currentTab = $state<TabNames>("一般");
  let show = $state(false);

  let dialog = $state<HTMLDialogElement>();
  let highlightItems = $state<string[]>([]);

  let serchQuery = $state("");

  function switchedTab(_newTab: TabNames) {
    highlightItems.length = 0;
  }

  export async function switchOpen(_show: boolean, tab?: TabNames) {
    show = _show;
    await tick();

    if(tab != null) currentTab = tab;
    if (show) {
      dialog?.showModal();
    } else {
      dialog?.close();
      highlightItems.length = 0;
    }
  }

  export async function openHilight(tab: TabNames, items?: string[]) {
    await switchOpen(true, tab);
    highlightItems = items ?? [];
  }
</script>

{#if show}
  <dialog bind:this={dialog} class="mordal">
    <button class="close-btn" onclick={() => switchOpen(false)} type="button">閉じる</button>

    <div class="mordal-body">
      <Tab {names} {switchedTab} bind:currentTab>
        {#snippet content(tabId)}
          <div class="content" data-tabId={tabId}>
            {#if tabId === "一般"}
              <GeneralSetting bind:highlightItems />
            {:else if tabId === "読み上げ"}
              <YomiageSetting bind:highlightItems />
            {:else if tabId === "ニコ生"}
              <NicoliveSetting bind:highlightItems />
            {:else if tabId === "リスナー"}
              <UsersSetting bind:serchQuery/>
            {:else if tabId === "コメント表示"}
              <ViewSetting />
            {:else if tabId === "フィードバック"}
              <div>
                <p>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfTjmTeauWFVnc9e7kAi_yj5C_TvaV5ldTBo9fZRqmrBghtHw/viewform?usp=sf_link"
                    target="_blank"
                    title="Google フォーム"
                  >
                    フィードバックページ
                  </a>
                  からフィードバックを送る事が出来ます (別タブで開きます)
                </p>

                <p>
                  <span>フィードバックでは不具合の報告や欲しい機能の要望が出来ます</span><br>
                  <span>特に「欲しい！」と思っている機能は対応予定/他の人が送信済みの場合でも送ってください</span><br>
                  <span>強く望まれている機能ほど対応が早くなります</span>
                </p>
                <p>フィードバックを貰えると開発の励みになるので、ぜひ、フィードバックをください！</p>
              </div>
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

  .mordal-body {
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

  :global(.select-area) {
    display: flex;
    flex-wrap: wrap;

    :global(.select-btn) {
      text-wrap: nowrap;

      border-radius: 0;
      border: 2px solid black;
      border-color: #f9f9f954;
      color: ghostwhite;
      font-size: 1rem;

      :global(&:not(:last-child)) {
        margin-right: 3px;
      }

      :global(&[data-selected="true"]) {
        background-color: #4889f4;
      }
      :global(&[data-selected="false"]) {
        background-color: #888;
      }
      :global(&[disabled]) {
        filter: contrast(50%);
      }
    }
  }

  :global(.hint) {
    margin-top: -3px;
  }

  :global(.highlight) {
    background-color: #ffb5b530;
    box-shadow: 0 0 0 5px #ffb5b530;
    border-radius: 5px;
    animation: hightlight 1.5s ease-in-out;
  }

  @keyframes hightlight {
    0% {
      background-color: #ffb5b558;
      box-shadow: 0 0 0 5px #ffb5b558;
    }
    60% {
      background-color: #ff8a8a58;
      box-shadow: 0 0 0 5px #ff8a8a58;
    }
    100% {
      background-color: #ffb5b530;
      box-shadow: 0 0 0 5px #ffb5b530;
    }
  }

</style>
