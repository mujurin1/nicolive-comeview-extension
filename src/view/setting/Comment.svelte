<script lang="ts">
  import UserSetting from "../../components/UserSetting.svelte";
  import { Nicolive } from "../../store/Nicolive.svelte";
  import { userStore } from "../../store/UserStore.svelte";

  let serchUserQuery = $state("");
  let hitUsers = $derived.by(() => {
    const users = new Map(
      [
        ...Object.values(Nicolive.users).map(u => u.storeUser),
        ...Object.values(userStore.users),
      ].map(u => [u.id, u]),
    );

    for (const [key, user] of users) {
      if (user.name == null || !user.name.includes(serchUserQuery)) users.delete(key);
    }

    return Array.from(users.keys());
  });
</script>

<h2 style="margin: 0;">リスナー一覧ページ</h2>

<div class="line" style="margin-bottom: 30px;">
  <input type="text" placeholder="検索ユーザー名" bind:value={serchUserQuery} />
  <div class="grid-row">
    <input type="text" placeholder="検索ユーザー名" bind:value={serchUserQuery} />
  </div>
</div>

<!-- # コメントビューの見た目を変える
* 表示項目の編集
* 背景やグリッド線の色
* フォントサイズ


# ユーザー毎にコメントの見た目を変える
* 文字の色・スタイル
* フォント
* 背景色 -->

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
</style>
