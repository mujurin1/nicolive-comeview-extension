import { mount } from "svelte";
import Comejene from "./Comejene.svelte";
import "./style.css";

export default mount(Comejene, {
  target: document.getElementById("app")!,
}) as Comejene;
