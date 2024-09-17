<script lang="ts">
  import { onMount, tick } from "svelte";
  import { notifierStore } from "../src/lib/CustomStore.svelte";
  import { ComejeneMessage } from "./ComejeneMessage.svelte";
  import { StackDisplaySetting } from "./type";

  // TODO: 長くなりすぎた scrollArea を短くする

  let setting: StackDisplaySetting = $state({
    ...StackDisplaySetting.createDefault(),
    exitAnimation: {
      ms: 1000,
    },
  });
  let settingS = notifierStore(setting, resetStyleSetting);
  let messages = $state<ComejeneMessage[]>([]);
  let mainArea: HTMLDivElement;
  let scrollArea: HTMLDivElement;
  let padding: HTMLDivElement;

  let paddingSize = 0;
  let loopId: number | undefined;

  onMount(() => {
    const resizeObserver = new ResizeObserver(resetScrollTransform);

    resizeObserver.observe(mainArea);
    resetStyleSetting();

    return () => {
      resizeObserver.disconnect();
    };
  });

  async function addMessage(content: string) {
    const message = new ComejeneMessage(
      "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/3110/31103661.jpg",
      "むじゅりんXXXXXXX",
      content,
    );

    // 退場
    if (messages.length >= setting.maxMessages) {
      exitMessage(messages[setting.maxMessages - 1]);
    }
    // if (messages.length >= 10) removeMessage();

    messages.push(message);

    await tick();

    resetScrollTransform();
  }

  // addMessage("あいうえおあいうえおあいうえおあいうえお");
  // addMessage("１２３４５１２３４５１２３４５１２３４５");
  // addMessage("0.138156186915841656415616531");
  // addMessage("１行目\n２行目");

  async function resetStyleSetting() {
    if (scrollArea == null) return;

    paddingSize = 0;
    scrollArea.style.removeProperty("top");
    scrollArea.style.removeProperty("left");
    scrollArea.style.removeProperty("transform");

    padding.style.removeProperty("width");
    padding.style.removeProperty("height");

    if (setting.direction === "column") {
      scrollArea.style.removeProperty("width");
    } else {
      scrollArea.style.width = "max-content";
    }

    const reverse = setting.reverseOrder ? "-reverse" : "";
    scrollArea.style.flexDirection = setting.direction + reverse;

    resetTimeLoop();

    // 設定完了. 新しい設定での見た目の調整
    resetScrollTransform();

    scrollArea.style.transition = "none";
    requestAnimationFrame(() => {
      scrollArea.style.transition = "transform 1s ease-out";
    });
  }

  function resetScrollTransform() {
    if (setting.direction === "column") {
      if (setting.reverseOrder) {
        scrollArea.style.top = `${-scrollArea.clientHeight}px`;
        scrollArea.style.transform = `translateY(${scrollArea.clientHeight}px)`;
      } else {
        const scrollY = scrollArea.clientHeight - mainArea.clientHeight;
        scrollArea.style.transform = `translateY(${-scrollY}px)`;
      }
    } else {
      if (setting.reverseOrder) {
        scrollArea.style.left = `${-scrollArea.clientWidth}px`;
        scrollArea.style.transform = `translateX(${scrollArea.clientWidth}px)`;
      } else {
        const scrollX = scrollArea.clientWidth - mainArea.clientWidth;
        scrollArea.style.transform = `translateX(${-scrollX}px)`;
      }
    }
  }

  /**
   * メッセージを退場させる
   */
  function exitMessage(message: ComejeneMessage) {
    message.exit();

    if (setting.exitAnimation == null || setting.exitAnimation.ms <= 0) {
      destroyMessage(messages.findIndex(_m => _m === message));
    } else {
      setTimeout(() => {
        const index = messages.findIndex(_m => _m === message);
        if (index === -1) return;
        destroyMessage(index);
      }, setting.exitAnimation.ms);
    }
  }

  /**
   * メッセージを削除する
   */
  function destroyMessage(index: number) {
    const message = messages.splice(index, 1)[0];
    if (setting.direction === "column") {
      paddingSize += message.node.clientHeight;
      padding.style.height = `${paddingSize}px`;
    } else {
      paddingSize += message.node.clientWidth;
      padding.style.width = `${paddingSize}px`;
    }
  }

  function resetTimeLoop() {
    if (loopId != null) {
      clearInterval(loopId);
    }

    if (setting.exitTimeSec <= 0) return;

    loopId = setInterval(() => {
      const currentTime = Date.now();

      const sec = setting.exitTimeSec * 1e3;
      for (const message of messages) {
        if (message.action === "exit") continue;

        const elapsed = currentTime - message.time;
        if (elapsed < sec) break;

        exitMessage(message);
      }
    }, 100);
  }
</script>

<div style="position: absolute; right: 0px; bottom: 0px; z-index: 1;">
  <select class="item" bind:value={$settingS.direction}>
    <!-- ３つ目の値が undefined だと初期値が設定されてしまうため null を使う -->
    {#each ["row", "column"] as value}
      <option {value} selected={value === $settingS.direction}>{value}</option>
    {/each}
  </select>

  <label for="order">reverseOrder</label>
  <input id="order" type="checkbox" bind:checked={$settingS.reverseOrder} />

  <input style="width:40px" type="number" bind:value={$settingS.exitTimeSec} />

  <button style="" onclick={() => addMessage(Math.random() + "")}>
    追加 {messages.length}
  </button>
</div>

<div bind:this={mainArea} class="mainArea">
  <div bind:this={scrollArea} class="scrollArea">
    <div bind:this={padding} style="background-color: red;"></div>
    {#each messages as message (message.content)}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div bind:this={message.node} class={`message ${message.action}`} tabindex="0">
        <div class="icon">
          <!-- svelte-ignore a11y_missing_attribute -->
          <img src={message.iconUrl} />
        </div>
        <div class="name">{message.name}</div>
        <div class="content">{message.content}</div>
      </div>
    {/each}
  </div>
</div>

<style>
  @layer {
    .mainArea {
      overflow: clip;
      width: 100%;
      height: 100%;
    }

    .scrollArea {
      position: relative;
      display: flex;
      gap: 5px;

      transition: transform 1s ease-out;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .message {
      flex: 0 0 fit-content;
      align-items: center;
      /* padding: 3px; */

      display: grid;
      column-gap: 5px;

      grid-template:
        "icon name" auto
        "icon content" auto / min-content 1fr;

      /* テスト用にホバーしたら退場アニメーション */
      &:focus {
        animation: exit 1s ease-in-out forwards;
      }

      & > .icon {
        grid-area: icon;
        width: 30px;
        height: 30px;

        & > img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
        }
      }

      & > .name {
        word-break: break-all;
        grid-area: name;
      }

      & > .content {
        word-break: break-all;
        grid-area: content;
      }

      &.exit {
        animation: exit 1s ease-in-out forwards;
      }
    }

    .enter {
      animation: enter 1s ease-in-out forwards;
    }

    @keyframes enter {
      0% {
        transform: translateX(100%);
        opacity: 0.3;
      }
      100% {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes exit {
      0% {
        transform: translateX(0);
        opacity: 1;
      }
      100% {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  }
</style>
