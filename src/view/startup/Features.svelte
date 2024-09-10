<script lang="ts">
  import { setting } from "../view";

  /*
   * 更新履歴を書きたいわけではない
   * * 不具合
   * * 新機能
   * * 変更
   * * その他
   */

  function openSettinListener() {
    setting.page.openSetting(true, "リスナー");
  }
  function openSettinGeneral() {
    setting.page.openSetting(true, "一般");
  }
  function openSettinYomiage() {
    setting.page.openSetting(true, "読み上げ");
  }
</script>

<div class="content-box">
  <div class="content new-features">
    <div class="title">新機能 (2024.9.10)</div>

    <div class="section">
      <div class="section-title">コメント投稿</div>
      <div class="section-content">ブラウザでログインしているアカウントで投稿します</div>
    </div>
  </div>

  <div class="content features">
    <div class="title">機能紹介</div>

    <div class="section">
      <div class="section-title">見た目のカスタマイズ</div>
      <div class="section-content">
        <div>
          リスナー毎のコメントの見た目を
          <button class="link-button" type="button" onclick={openSettinListener}
            >リスナー設定</button
          >
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
          <button class="link-button" type="button" onclick={openSettinGeneral}>一般設定</button>
          からコテハン・呼び名を有効化する必要があります
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">呼び名</div>
      <div class="section-content">
        <div>
          <button class="link-button" type="button" onclick={openSettinYomiage}>
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
    font-size: 1.5rem;
    margin: 0 0 10px 10px;
    font-weight: bold;
  }

  .new-features {
    background-color: #ffebde;

    .title {
      color: #42a1ff;
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

  .features {
    .section {
      border-left: 2px solid #00bfff85;

      &:hover {
        border-left-color: deepskyblue;
      }
      &:active {
      }
    }
  }
</style>
