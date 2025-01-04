import { mount } from "svelte";
import "../comejene/style.css";
import TemplateEditor from "./Empty.svelte";

export default mount(TemplateEditor, {
  target: document.getElementById("app")!,
}) as typeof TemplateEditor;
