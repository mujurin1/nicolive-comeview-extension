<script lang="ts">
  import { untrack } from "svelte";
  import { notifierStore } from "../../../lib/CustomStore.svelte";
  import { ComejeneTemplateStore } from "../../../store/ComejeneTemplateStore.svelte";
  import { DefaultComejeneTemplates } from "../../Template/Defaults";
  import RecordList from "../../../components/RecordList.svelte";
  import { ComejeneSenderStore } from "../../../store/ComejeneSenderStore.svelte";

  let selectTemplateId = notifierStore(
    ComejeneTemplateStore.state.useTemplateId,
    () => {
      untrack(() => {
        ComejeneTemplateStore.setUseTemplateId(selectTemplateId.state);
        ComejeneTemplateStore.save();
        ComejeneSenderStore.sendReset();
        ComejeneSenderStore.sendDummyContent();
        ComejeneSenderStore.sendDummyContent();
        ComejeneSenderStore.sendDummyContent();
      });
    },
    () => ComejeneTemplateStore.state.useTemplateId,
  );
</script>

<div class="main">
  <RecordList name="name" records={DefaultComejeneTemplates} bind:key={$selectTemplateId} />
</div>
