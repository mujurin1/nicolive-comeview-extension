<script lang="ts">
  import { SettingStore } from "../../store/SettingStore.svelte";
  import { settingViewStore } from "../view";

  let useAdvancedFlg = $state(false);
  let checkedClearOk = $state(false);
  let trySave = $state<"none" | "ok" | "miss">("none");
  let savedata = $state("");

  async function save() {
    try {
      await SettingStore.saveFromJson(savedata);
      trySave = "ok";
    } catch (e) {
      console.error(e);
      trySave = "miss";
      throw e;
    }
  }

  async function clear() {
    try {
      if (checkedClearOk) {
        await SettingStore.resetAllData();
        checkedClearOk = false;
      } else {
        checkedClearOk = true;
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  function useAdvanced() {
    useAdvancedFlg = true;

    savedata = JSON.stringify($settingViewStore, null, 2);
  }
</script>

<h2 style:margin="0">詳しいユーザー向けのページです</h2>
<div style:margin-bottom="20px">このタブの項目は注意して操作してください</div>

{#if !useAdvancedFlg}
  <button onclick={useAdvanced} type="button">高度な設定を使用する</button>
{:else}
  <div style:display="flex" class="list">
    <div>データの変更</div>
    <button onclick={save} type="button">保存する</button>
    {#if checkedClearOk}
      <button onclick={clear} type="button">本当に初期化する?</button>
    {:else}
      <button onclick={clear} type="button">初期化する</button>
    {/if}
  </div>
  <div>※コメビュの保存データのJSONです。注意して操作してください</div>
  <div>※キー(property key)を消して保存した場合そのキーの値は上書きされません</div>

  {#if trySave === "ok"}
    <div style:color="blue" style:font-size="0.8rem">保存しました</div>
  {:else if trySave === "miss"}
    <div style:color="red" style:font-size="0.8rem">保存に失敗しました。JSONとして不正な値です</div>
  {:else}
    <div></div>
  {/if}

  <textarea style:width="100%" rows="20" bind:value={savedata}></textarea>
{/if}

<style>
  .list {
    font-size: 1rem;
    margin-bottom: 5px;
    margin-right: 50px;
  }
</style>
