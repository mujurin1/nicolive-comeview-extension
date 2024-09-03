<script lang="ts">
  import { CommentFormat } from "../store/data";
  import { userStore } from "../store/n_store.svelte";
  import { StoreUser } from "../store/StoreUser.svelte";

  let users = $derived(userStore.users);
  let userIds = $derived(Object.keys(users));

  let userModel = $state<StoreUser>({ id: "no-id" });
  let formatModel = $state<CommentFormat>({});

  function add() {
    const user = $state.snapshot(userModel);
    if (Object.keys(formatModel).length > 0) user.format = formatModel;
    userStore.upsert(user, true);
  }

  function remove(userId: number | string) {
    userStore.delete(userId, true);
  }
</script>

<div>
  <button type="button" onclick={add}>追加</button>

  <input type="text" placeholder="id" bind:value={userModel.id} />
  <input type="text" placeholder="name" bind:value={userModel.name} />
  <input type="text" placeholder="kotehan" bind:value={userModel.kotehan} />
  <input type="text" placeholder="yobina" bind:value={userModel.yobina} />

  <input type="text" placeholder="nameColor" bind:value={formatModel.nameColor} />
  <input type="checkbox" placeholder="isBold" bind:checked={formatModel.isBold} />
</div>

<div>
  {#each userIds as userId (userId)}
    {@const user = users[userId]}
    <button type="button" onclick={() => remove(userId)}>削除</button>
    <details open>
      <summary>{user.name}</summary>
      <textarea rows="10" cols="40">{JSON.stringify(user, null, 2)}</textarea>
    </details>
  {/each}
</div>
