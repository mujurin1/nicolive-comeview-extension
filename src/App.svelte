<!-- <script lang="ts">
  import Main from "./view/Main.svelte";
</script>

<Main /> -->

<script lang="ts">
  import ColorPicker from "./components/ColorPicker.svelte";

  type Colors = [number, number, number];
  let colorPicker: ReturnType<typeof ColorPicker>;
  let _rgba = $state("#FFFFFF");
  let hsv = $state<Colors>([0.5, 0, 1]);
</script>

<div style:padding="200px 100px">
  <ColorPicker bind:this={colorPicker} bind:hsv bind:_hex={_rgba} />

  <div>{_rgba}</div>
  <div>{hsv[0]}</div>
  <div>{hsv[1]}</div>
  <div>{hsv[2]}</div>
</div>
