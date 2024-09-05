<script lang="ts">
  import UserSetting from "../../components/UserSetting.svelte";
  import { Nicolive } from "../../store/Nicolive.svelte";
  import { userStore, type StoreUser } from "../../store/UserStore.svelte";

  let { serchQuery = $bindable("") }: {
    serchQuery?: string;
  } = $props();

  let hitUsers = $derived.by(() => {
    const users = new Map([
        ...Object.values(userStore.users).map(u => [u, false] as const),
        ...Object.values(Nicolive.users).map(u => [u.storeUser, true] as const),
      ]
        .map(obj => [obj[0].id, obj])
    );

    let query = serchQuery.trim();
    const serchFromName = query !== "";
    let serchIsId = false
    if(serchFromName && query.startsWith("id:")) {
      serchIsId = true;
      query = query.slice(3).trimStart();
    }

    const array: [StoreUser, boolean][] = [];

    for (const [, obj] of users) {
      const [user, showLive] = obj;

      if (
        (
          !serchFromName || (
            serchIsId
              ? (user.id+"").startsWith(query)
              : user.name != null && user.name.includes(query)
          )
        ) &&
        (!serchOptions.showLiveOnly.checked || showLive) &&
        (!serchOptions["184Only"].checked || user.name == null) &&
        (!serchOptions.rawUserOnly.checked || user.name != null) &&
        (!serchOptions.hasFormat.checked || user.format != null) &&
        (!serchOptions.hasKotehan.checked || user.kotehan != null) &&
        (!serchOptions.hasYobina.checked || user.yobina != null)
      ) {
        array.push(obj as [StoreUser, boolean]);
      }
    }

    return array
      .sort(([aUser, aIsShowLive], [bUser, bIsShowLive]) => {
        // if(aIsShowLive != bIsShowLive)
        //   return aIsShowLive ? -1 : 1;

        if(typeof aUser.id !== typeof bUser.id ) {
          return typeof aUser.id === "number" ? -1: 1;
        }

        return aUser.id < bUser.id ? -1 : 1;
      })
      .map(([user]) => user.id)
  });

  let serchOptions = $state({
    showLiveOnly: { name: "視聴中の放送", checked: Nicolive.state !== "none" },
    "184Only": {name: "184のみ", checked: false },
    rawUserOnly: { name: "生IDのみ", checked: false },
    hasKotehan: { name: "コテハン", checked: false },
    hasYobina: { name: "呼び名", checked: false },
    hasFormat: { name: "フォーマット", checked: false },
  });

  export function setSerchQuery(query: string) {
    serchQuery = query;
  }
</script>

<div style="margin-bottom: 10px;">
  <h2 style="margin: 0 0 5px 0; text-align: center;">リスナー設定</h2>
  <div class="hint">・コメビュでユーザー名をクリックしてもこのページに飛べます</div>
</div>

<div class="serch" style="margin-bottom: 30px;">
  <div class="line">
    <button onclick={() => serchQuery = ""}>クリア</button>
    <input
      type="text"
      style="width: 100%; box-sizing: border-box;"
      placeholder="検索ユーザー名　id:数字/184文字列"
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
      >
        {option.name}
      </button>
    {/each}
  </div>
</div>

<div class="user-list">
  {#each hitUsers as userId (userId)}
    <UserSetting {userId} opened={hitUsers.length === 1} />
  {/each}
</div>

<style>
  .user-list {
    :global(& > *:not(:last-child)) {
      margin-bottom: 5px;
    }
  }

  .serch {
    & > *:not(:last-child) {
      margin-bottom: 10px;
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
</style>
