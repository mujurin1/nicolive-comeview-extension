<script lang="ts">
  import { getNicoliveId } from "@mujurin/nicolive-api-ts";
  import { Nicolive } from "../../Platform";
  import type { SettingState } from "../../store/SettingStore.svelte";
  import { settingViewStore } from "../setting/Setting.svelte";

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
    Nicolive.url = id;
    Nicolive.connect();
  }

  function remove(id: string) {
    const index = settingViewStore.state.nicolive.pinnLives.findIndex(pinn => pinn.id === id);
    if (index === -1) return;
    settingViewStore.state.nicolive.pinnLives.splice(index, 1);
    settingViewStore.changeBind();
  }

  function add() {
    if (
      getNicoliveId(newPinn.id) == null ||
      settingViewStore.state.nicolive.pinnLives.find(pinn => pinn.id === newPinn.id) != null
    )
      return;

    settingViewStore.state.nicolive.pinnLives.push({
      id: getNicoliveId(newPinn.id)!,
      description: newPinn.description,
    });
    settingViewStore.changeBind();
    newPinn = { id: "", description: "" };
  }
</script>

<div class="title">ピン留めした放送</div>
<div class="pinns">
  {#each $settingViewStore.nicolive.pinnLives as pinn (pinn)}
    <button onclick={() => connect(pinn.id)} type="button">接続</button>
    <input type="text" bind:value={pinn.id} />
    <input size="10" type="text" bind:value={pinn.description} />
    <button onclick={() => remove(pinn.id)} type="button">削除</button>
  {/each}

  <button onclick={() => add()} type="button">追加</button>
  <input placeholder="放送ID lv ch user/" type="text" bind:value={newPinn.id} />
  <input
    placeholder="メモ欄 (放送者名など)"
    size="1"
    type="text"
    bind:value={newPinn.description}
  />
  <div></div>
</div>

<div style:display="flex" class="title">
  <div style:margin-right="20px">視聴中の放送</div>
  <button style:height="25px" onclick={updateOpenTabs} type="button">更新</button>
</div>
<div class="open-tabs">
  {#each openTabs as tab (tab)}
    <button onclick={() => connect(tab.id)} type="button">接続</button>
    <div>{tab.id}</div>
    <div>{tab.title}</div>
  {/each}
</div>

<style>
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
