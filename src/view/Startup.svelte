<script lang="ts">
  import { getNicoliveId } from "@mujurin/nicolive-api-ts";
  import type { StoreType } from "../store/data";
  import { Nicolive } from "../store/Nicolive.svelte";
  import { settingStore } from "./setting/Setting.svelte";

  let newPinn = $state<StoreType["nicolive"]["pinnLives"][number]>({
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

    settingStore.state.nicolive.pinnLives.push(newPinn);
    settingStore.changeBind();
    newPinn = { id: "", description: "" };
  }
</script>

<div class="pinn-area-wrap">
  <div class="pinn-area">
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

    <div class="title flex">
      <div>視聴中の放送</div>
      <button style="height: 25px;" onclick={updateOpenTabs}>更新</button>
    </div>
    <div class="open-tabs">
      {#each openTabs as tab (tab)}
        <button type="button" onclick={() => connect(tab.id)}>接続</button>
        <div>{tab.id}</div>
        <div>{tab.title}</div>
      {/each}
    </div>
  </div>
</div>

<style>
  .pinn-area-wrap {
    box-sizing: border-box;
    height: 100%;
    padding: 20px;
    overflow: hidden;
  }

  .pinn-area {
    box-sizing: border-box;
    padding: 20px;
    height: 100%;
    overflow: auto;
    border: 3px solid black;

    & > .title {
      font-size: 1.5rem;
      margin-bottom: 5px;
      align-items: center;

      &:not(:first-child) {
        margin-top: 30px;
      }
    }

    & > .pinns {
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

    & > .open-tabs {
      display: grid;
      grid-template-columns: 50px 120px 1fr;
      gap: 7px 15px;

      font-size: 1rem;
      align-items: center;
    }
  }

  .flex {
    display: flex;
    margin-left: 3px;

    & > *:not(:last-child) {
      margin-right: 20px;
    }
  }
</style>
