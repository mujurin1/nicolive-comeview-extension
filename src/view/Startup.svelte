<script lang="ts">
  import { getNicoliveId } from "@mujurin/nicolive-api-ts";
  import Tab from "../components/Tab.svelte";
  import { Nicolive } from "../function/Nicolive.svelte";
  import type { SettingState } from "../store/SettingStore.svelte";
  import { settingStore } from "./setting/Setting.svelte";

  let newPinn = $state<SettingState["nicolive"]["pinnLives"][number]>({
    id: "",
    description: "",
  });
  let openTabs = $state<{ id: string; title: string }[]>([]);

  updateOpenTabs();

  function updateOpenTabs() {
    chrome.tabs.query({}, tabs => {
      openTabs = tabs
        .filter(tab => tab?.url?.includes("https://live.nicovideo.jp/watch/"))
        .map(tab => ({ id: getNicoliveId(tab.url!)!, title: /(.*?) - /.exec(tab.title!)![1] }));
    });
  }

  function connect(id: string) {
    if (Nicolive.state === "connecting" || Nicolive.state === "opened") return;

    Nicolive.url = id;
    Nicolive.connect();
  }

  function remove(id: string) {
    const index = settingStore.state.nicolive.pinnLives.findIndex(pinn => pinn.id === id);
    if (index === -1) return;
    settingStore.state.nicolive.pinnLives.splice(index, 1);
    settingStore.changeBind();
  }

  function add() {
    if (
      getNicoliveId(newPinn.id) == null ||
      settingStore.state.nicolive.pinnLives.find(pinn => pinn.id === newPinn.id) != null
    )
      return;

    settingStore.state.nicolive.pinnLives.push({
      id: getNicoliveId(newPinn.id)!,
      description: newPinn.description,
    });
    settingStore.changeBind();
    newPinn = { id: "", description: "" };
  }
</script>

<div class="content-wrap">
  <div class="content">
    <Tab names={["ピン留め", "更新履歴", "フィードバック"]} currentTab="ピン留め">
      {#snippet content(tabId)}
        <div style="margin-top: 20px;">
          {#if tabId === "ピン留め"}
            <div class="title">ピン留めした放送</div>
            <div class="pinns">
              {#each $settingStore.nicolive.pinnLives as pinn (pinn)}
                <button type="button" onclick={() => connect(pinn.id)}>接続</button>
                <input type="text" bind:value={pinn.id} />
                <input type="text" bind:value={pinn.description} size="10" />
                <button type="button" onclick={() => remove(pinn.id)}>削除</button>
              {/each}

              <button type="button" onclick={() => add()}>追加</button>
              <input type="text" bind:value={newPinn.id} placeholder="放送ID lv ch user/" />
              <input
                type="text"
                bind:value={newPinn.description}
                placeholder="メモ欄 (放送者名など)"
                size="1"
              />
              <div></div>
            </div>

            <div class="title" style="display: flex;">
              <div style="margin-right: 20px;">視聴中の放送</div>
              <button style="height: 25px;" onclick={updateOpenTabs}>更新</button>
            </div>
            <div class="open-tabs">
              {#each openTabs as tab (tab)}
                <button type="button" onclick={() => connect(tab.id)}>接続</button>
                <div>{tab.id}</div>
                <div>{tab.title}</div>
              {/each}
            </div>
          {/if}
        </div>
      {/snippet}
    </Tab>
  </div>
</div>

<style>
  .content-wrap {
    box-sizing: border-box;
    height: 100%;
    padding: 15px;
    overflow: hidden;
  }

  .content {
    box-sizing: border-box;
    padding: 15px;
    height: 100%;
    overflow: auto;
    border: 3px solid black;
  }

  * {
    :global(.tab-header) {
      background-color: #eee;

      :global(& > .tab-name) {
        flex: 1;
        height: auto;
        background-color: transparent;
        font-size: 18px;

        :global(&:not(.selected):hover) {
          color: #303030;
          background-color: #e8e8e8;
          box-shadow: 1px 1px 1px #aaa;
        }

        :global(&.selected) {
          background-color: ghostwhite;
          box-shadow: 1px 1px 1px #aaa;
        }
      }
    }
  }

  .title {
    font-size: 1.5rem;
    margin-bottom: 5px;
    align-items: center;

    &:not(:first-child) {
      margin-top: 30px;
    }
  }

  .pinns {
    display: grid;
    grid-template-columns: 50px 120px 1fr auto;
    gap: 7px 15px;
    align-items: center;
    white-space: nowrap;

    & > input {
      background-color: whitesmoke;
      border: 1px solid black;
    }
  }

  .open-tabs {
    display: grid;
    grid-template-columns: 50px 120px 1fr;
    gap: 7px 15px;

    font-size: 1rem;
    align-items: center;
  }
</style>
