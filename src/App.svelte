<script lang="ts">
  import Sample from "./comejene_edit/Sample.svelte";
  import Main from "./view/Main.svelte";
</script>

{#if true}
  <Sample />
{:else}
  TODO: コメジェネが終わったら index.ts のCSSを戻す
  <Main />
{/if}
