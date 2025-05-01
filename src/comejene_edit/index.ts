import { mount } from "svelte";
import "../comejene/style.css";
import TemplateIndex from "./TemplateIndex.svelte";

export default mount(TemplateIndex, {
  target: document.getElementById("app")!,
}) as typeof TemplateIndex;
