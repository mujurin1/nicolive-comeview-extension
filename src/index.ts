import { mount } from "svelte";
// import "./app.css";
import App from "./App.svelte";
import "./comejene/style.css";

export default mount(App, {
  target: document.getElementById("app")!,
}) as App;
