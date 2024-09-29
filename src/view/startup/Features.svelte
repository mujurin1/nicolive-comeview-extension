<script lang="ts">
  import { setting } from "../view";

  /*
   * 更新履歴を書きたいわけではない
   * * 不具合
   * * 新機能
   * * 変更
   * * その他
   */
</script>

<div class="content-box">
  <div class="content bug-fix">
    <div class="title">不具合情報 （～2024.10.1 v0.3）</div>

    <div class="section">
      <div class="section-title">既知の問題はありません</div>
      <div class="section-content">
        <div>通信部分を全て作り直したため通信に関わる不具合は解消されました</div>
        <div>接続中に問題が発生した場合は自動で再接続されます</div>
        <div>
          問題が見つかった場合は
          <button
            class="link-button"
            type="button"
            onclick={() => setting.page.openHilight("フィードバック")}
          >
            フィードバック
          </button>
          から報告をお願いします
        </div>
      </div>
    </div>
  </div>

  <div class="content new-features">
    <div class="title">新機能 （2024.9.20 v0.2.9.1）</div>

    <div class="section">
      <div class="section-title feadback-request">
        184コメント・システムの表示/読み上げ設定を追加しました
      </div>
      <div class="section-content">
        <div>
          <button
            class="link-button"
            type="button"
            onclick={() =>
              setting.page.openHilight(
                "ニコ生",
                "nicolive-184-visible",
                "nicolive-system-visible",
                "nicolive-system-yomiage",
              )}
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
            type="button"
            onclick={() => setting.page.openHilight("フィードバック")}
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
          <button
            class="link-button"
            type="button"
            onclick={() => setting.page.openHilight("ニコ生", "nicolive-show-post-area")}
          >
            コメント投稿欄を表示する
          </button>
          から表示/非表示を変更できます
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">見た目のカスタマイズ</div>
      <div class="section-content">
        <div>
          リスナー毎のコメントの見た目を
          <button
            class="link-button"
            type="button"
            onclick={() => setting.page.openHilight("リスナー")}
          >
            リスナー設定
          </button>
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
          <button
            class="link-button"
            type="button"
            onclick={() => setting.page.openHilight("一般", "general-kotehan", "general-yobina")}
          >
            一般設定
          </button>
          からコテハン・呼び名を有効化する必要があります
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">呼び名</div>
      <div class="section-content">
        <div>
          <button
            class="link-button"
            type="button"
            onclick={() => setting.page.openHilight("読み上げ", "yomiage-type")}
          >
            読み上げる名前のタイプ
          </button>
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
    gap: 20px;
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

  .bug-fix {
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
