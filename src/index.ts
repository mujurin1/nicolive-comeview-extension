import { abortErrorWrap, sleep } from "@mujurin/nicolive-api-ts";
import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";

export default mount(App, {
  target: document.getElementById("app")!,
}) as App;


(async () => {
  const abort = new AbortController();
  console.log("start");
  setTimeout(() => {
    abort.abort();
  }, 3000);
  console.log(await abortErrorWrap(sleep(10 * 1e3, abort.signal), abort.signal));


})();