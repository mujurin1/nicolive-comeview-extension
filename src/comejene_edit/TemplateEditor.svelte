<!-- <script lang="ts">
  import { notifierStore } from "../lib/CustomStore.svelte";
  import MyzViewArea from "../lib/Myz/MyzViewArea.svelte";
  import { ComejeneSenderController } from "../service/ComejeneSenderController.svelte";
  import {
    ComejeneTemplates,
    type ComejeneTemplate,
    type TemplateName,
  } from "./Template/ComejeneTemplate";
  import TemplateSetting from "./components/TemplateSetting.svelte";
  import { getDummyContent } from "./utils";

  let templateName = notifierStore<TemplateName>("横並び", () => {
    template = ComejeneTemplates[$templateName]();
    ComejeneSenderController.sendReset();
  });

  let template = $state<ComejeneTemplate>(ComejeneTemplates[$templateName]());

  function dbg_send_content(
    icon = "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg",
    name = undefined,
    message = getDummyContent(),
  ) {
    const content = { icon, name, message };
    ComejeneSenderController.sendContent(content);
  }
</script>

<MyzViewArea title="コメントテスト">
  <button onclick={() => dbg_send_content()} type="button">コメントテスト</button>
</MyzViewArea>

{#key template}
  <TemplateSetting bind:template />
{/key}

<style>
</style> -->
