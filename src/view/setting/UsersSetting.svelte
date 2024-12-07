<script lang="ts">
  import UserSetting from "../../components/UserSetting.svelte";
  import { Nicolive } from "../../Platform";
  import { NceUserStore } from "../../store/NceStore.svelte";
  import { StorageUserStore, type StorageUser } from "../../store/StorageUserStore.svelte";

  let {
    serchQuery = $bindable(""),
  }: {
    serchQuery?: string;
  } = $props();

  let hitUsers = $derived.by(() => {
    const users = new Map([
      ...Object.values(StorageUserStore["nicolive"].users).map(u => [u, false] as const),
      ...Object.values(NceUserStore.nicolive.users).map(u => [u.storageUser, true] as const),
    ]);

    let query = serchQuery.trim();
    const serchFromName = query !== "";
    let serchIsId = false;
    if (serchFromName && query.startsWith("id:")) {
      serchIsId = true;
      query = query.slice(3).trimStart();
    }

    const array: StorageUser[] = [];

    for (const [user, showLive] of users) {
      if (
        (!serchFromName ||
          (serchIsId
            ? (user.id + "").startsWith(query)
            : user.name != null && user.name.includes(query))) &&
        (!serchOptions.showLiveOnly.checked || showLive) &&
        (!serchOptions["184Only"].checked || user.name == null) &&
        (!serchOptions.rawUserOnly.checked || user.name != null) &&
        (!serchOptions.hasFormat.checked || user.format != null) &&
        (!serchOptions.hasKotehan.checked || user.kotehan != null) &&
        (!serchOptions.hasYobina.checked || user.yobina != null)
      ) {
        array.push(user);
      }
    }

    return array
      .sort((aUser, bUser) => {
        if (typeof aUser.id !== typeof bUser.id) return typeof aUser.id === "number" ? -1 : 1;

        return aUser.id < bUser.id ? -1 : 1;
      })
      .map(user => user.id);
  });

  let serchOptions = $state({
    showLiveOnly: { name: "視聴中の放送", checked: Nicolive.state === "opened" },
    "184Only": { name: "184のみ", checked: false },
    rawUserOnly: { name: "生IDのみ", checked: false },
    hasKotehan: { name: "コテハン", checked: false },
    hasYobina: { name: "呼び名", checked: false },
    hasFormat: { name: "フォーマット", checked: false },
  });

  function clearSerchOption() {
    serchQuery = "";
  }

  export function setSerchQuery(query: string) {
    serchQuery = query;
  }
</script>

<div style:margin-bottom="10px">
  <h2 style:margin="0 0 5px 0" style:text-align="center">ユーザー設定</h2>
  <div class="hint">コメビュでユーザー名をクリックするとユーザー設定を開けます</div>
</div>

<div style:margin-bottom="10px" class="serch">
  <div style:margin-bottom="5px" class="line">
    <button onclick={clearSerchOption} type="button">クリア</button>
    <input
      class="serch-query"
      placeholder="検索　ユーザー名　id:ユーザーID（または184ID）"
      type="text"
      bind:value={serchQuery}
    />
  </div>

  <div>
    {#each Object.keys(serchOptions) as key (key)}
      {@const option = serchOptions[key as keyof typeof serchOptions]}
      <button
        class="select-btn"
        data-selected={option.checked}
        onclick={() => (serchOptions[key as keyof typeof serchOptions].checked = !option.checked)}
        type="button"
      >
        {option.name}
      </button>
    {/each}
  </div>
</div>

<div class="user-list">
  {#each hitUsers as userId (userId)}
    <UserSetting noAccordion={hitUsers.length === 1} platformId="nicolive" {userId} />
  {/each}
</div>

<style>
  .user-list {
    :global(& > *:not(:last-child)) {
      margin-bottom: 5px;
    }
  }

  .select-btn {
    border-radius: 0;
    border: 2px solid black;
    border-color: #f9f9f954;
    color: ghostwhite;
    font-size: 0.8rem;
    min-width: 70px;

    &:not(:last-child) {
      margin-right: 3px;
    }

    &[data-selected="true"] {
      background-color: #4889f4;
    }
    &[data-selected="false"] {
      background-color: #f2686f;
      background-color: #888888;
    }
    /* &[disabled] {
      filter: contrast(70%);
    } */
  }

  .serch-query:focus {
    width: 100%;
    box-sizing: border-box;
    outline: none;
  }
</style>
