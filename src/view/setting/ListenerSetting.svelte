<script lang="ts">
  import UserSetting from "../../components/UserSetting.svelte";
  import { Nicolive } from "../../store/Nicolive.svelte";
  import { userStore } from "../../store/UserStore.svelte";

  let serchUserQuery = $state("");
  let hitUsers = $derived.by(() => {
    const users = new Map(
      [
        ...Object.values(userStore.users).map(u => [u, false] as const),
        ...Object.values(Nicolive.users).map(u => [u.storeUser, true] as const),
      ].map((obj) => [obj[0].id, obj]),
    );

    for (const [key, [user, showLive]] of users) {
      console.log({showLive});
      
      if (
        (user.name != null && !user.name.includes(serchUserQuery)) ||
        (serchOptions.showLiveOnly.checked && !showLive) ||
        (serchOptions["184Only"].checked && user.name != null) ||
        (serchOptions.rawUserOnly.checked && user.name == null) ||
        (serchOptions.hasFormat.checked && user.format == null) ||
        (serchOptions.hasKotehan.checked && user.kotehan == null) ||
        (serchOptions.hasYobina.checked && user.yobina == null)
      ) {
        users.delete(key);
      }
    }

    return Array.from(users.keys());
  });

  let serchOptions = $state({
    showLiveOnly: { name: "視聴中の放送", checked: Nicolive.state !== "none" },
    "184Only": {name: "184のみ", checked: false },
    rawUserOnly: { name: "生IDのみ", checked: false },
    hasKotehan: { name: "コテハン", checked: false },
    hasYobina: { name: "呼び名", checked: false },
    hasFormat: { name: "フォーマット", checked: false },
  });
</script>

<h2 style="margin: 0 0 10px 0; text-align: center;">リスナー設定</h2>

<div class="serch" style="margin-bottom: 30px;">
  <input
    type="text"
    style="width: 100%; box-sizing: border-box;"
    placeholder="検索ユーザー名"
    bind:value={serchUserQuery}
  />
  
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
    <UserSetting {userId} />
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
