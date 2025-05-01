import { mount } from "svelte";
import TemplateIndex from "./TemplateIndex.svelte";

import "./style.css";

export default mount(TemplateIndex, {
  target: document.getElementById("app")!,
}) as typeof TemplateIndex;
