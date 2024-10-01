<script lang="ts">
  import { setting } from "../view";

  type TabName = Parameters<typeof setting.page.openHilight>[0];
</script>

<!--
div:content-box
  div:content issue > CONTENT
  div:content new-features > CONTENT
  div:content features > CONTENT

CONTENT
  div:title
  div:section +
    div:section-title
    div:section-content
      div +
 -->

{#snippet Link(name: string, tab: TabName, items?: string[])}
  <button
    class="link-button"
    onclick={() => setting.page.openHilight(tab, items)}
    type="button"
  >
    {name}
  </button>
{/snippet}

<div class="content-box">
  <div class="content issue">
    <div class="title">不具合情報 （2024.10.1 v0.3.1）</div>

    <div class="section">
      <div class="section-title">既知の問題はありません</div>
      <div class="section-content">
        <div>通信部分を全て作り直したため通信に関わる不具合は解消されました</div>
        <div>接続中に問題が発生した場合は自動で再接続されます</div>
        <div>
          問題が見つかった場合は
          {@render Link("フィードバック", "フィードバック")}
          から報告をお願いします
        </div>
      </div>
    </div>

    <details class="section">
      <summary class="section-title">v0.3.1で修正された不具合</summary>
      <div class="section-content">
        <div>放送終了後にウェブソケットが再接続をしてしまう（フィードバックありがとうございます m(_ _)m）</div>
        <div>ウェブソケットが終了メッセージを受信する前に切断された場合に自動再接続されなかった</div>
        <div>
          再接続時に以下の条件を満たしていた時にエラーが出る（可能性があった）<br>
          ・接続後にリアルタイムコメントを受信する前に切断していた時<br>
          ・最後にコメントを取得してから数十秒経過後に切断していた時
        </div>
      </div>
    </details>
  </div>

  <div class="content new-features">
    <div class="title">新機能（2024.9.20 v0.2.9.1）</div>

    <div class="section">
      <div class="section-title feadback-request">
        184コメント・システムの表示/読み上げ設定を追加しました
      </div>
      <div class="section-content">
        <div>
          <button
            class="link-button"
            onclick={() =>
              setting.page.openHilight(
                "ニコ生",[
                "nicolive-184-visible",
                "nicolive-system-visible",
                "nicolive-system-yomiage",]
              )}
            type="button"
          >
            ニコ生設定
          </button>
          から変更できます（アンケートも表示するようになりました）
        </div>
        <div>「読み上げ > システムメッセージの読み上げ」設定は無くなりました</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">ニコニ・コモンズ</div>
      <div class="section-content">
        <div>
          <a href="https://commons.nicovideo.jp/works/nc372441" target="_blank">ニコニ・コモンズ</a>
          へこのアプリを登録しました
        </div>
        <div>親作品登録や権利表記などは任意です</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">フィードバック</div>
      <div class="section-content">
        <div>フィードバックを送るためのGoogle Formsを開設しました</div>
        <div>
          <button
            class="link-button"
            onclick={() => setting.page.openHilight("フィードバック")}
            type="button"
          >
            フィードバック
          </button>
          から送ることが出来ます
        </div>
      </div>
    </div>
  </div>

  <div class="content features">
    <div class="title">機能紹介</div>

    <div class="section">
      <div class="section-title">コメント投稿</div>
      <div class="section-content">
        <div>ブラウザでログインしているアカウントで投稿します</div>
        <div>
          {@render Link("コメント投稿欄を表示する", "ニコ生", ["nicolive-show-post-area"])}
          から表示/非表示を変更できます
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">見た目のカスタマイズ</div>
      <div class="section-content">
        <div>
          リスナー毎のコメントの見た目を
          {@render Link("リスナー設定", "リスナー")}
          から変更出来ます
        </div>
        <div>コメビュでユーザー名をクリックでも開きます</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">コテハン＆呼び名</div>
      <div class="section-content">
        <div>＠を含むコメントでコテハンや呼び名を設定できます</div>
        <div>
          ※
          {@render Link("一般設定", "一般", ["general-kotehan", "general-yobina"])}
          からコテハン・呼び名を有効化する必要があります
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">呼び名</div>
      <div class="section-content">
        <div>
          {@render Link("読み上げる名前のタイプ", "読み上げ", ["yomiage-type"])}
          を 呼び名 のみ有効化すると呼び名が設定されたユーザーのみ名前を読み上げます
        </div>
        <div>
          呼び名に棒読みちゃんのコマンドを付けると設定されたリスナーのみ声を変えたり出来ます
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .content-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 1rem;
    color: #313338;
  }

  .content {
    box-sizing: border-box;
    padding: 5px 10px 10px 10px;
    border-radius: 8px;

    background-color: #f0f0f0;

    & > .section:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  .title {
    font-size: 1.5em;
    /* margin: 0 0 10px 10px; */
    margin-bottom: 10px;
    text-align: center;
    font-weight: bold;
  }

  .new-features {
    background-color: #ffebde;

    .title {
      color: #42a1ff;
    }
  }

  .issue {
    background-color: #e5e8f5;
    font-size: 0.85em;

    .title {
      font-size: 1.5em;
      color: #7c7c7c;
      margin-bottom: 0;
    }
  }

  .features {
    .section {
      border-left: 2px solid #00bfff85;

      &:hover {
        border-left-color: deepskyblue;
      }
      /* TODO: クリックしたら波紋が出るとか‥?
      &:active {
      }
       */
    }
  }

  .section {
    border-left: 2px solid transparent;
    padding-left: 10px;

    & > .section-title {
      color: black;
      /* font-weight: bold; */
      /* font-size: 1.1em; */
    }

    & > .section-content {
      font-size: 0.9em;
      margin-left: 1.5em;

      & > div {
        text-indent: -1em;
      }
    }
  }

  .feadback-request::before {
    content: "フィードバック";
    font-size: 0.75em;
    font-weight: bold;
    padding: 0 5px;
    margin-right: 5px;
    background-color: #e9f9ff;
    color: #3079ff;
    border: 1px solid;
    border-radius: 7px;
  }
</style>
