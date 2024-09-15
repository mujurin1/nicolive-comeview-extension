
## TODO
* 再接続時にその間に来たコメントが全て読み上げられてしまう
  * 今は対応策が思いつかないので放置


## ユーザビリティ
* [ ] コメビュに表示するメッセージの機能強化
  * [ ] 文章の一部のみリンク
  * [ ] ボタン
* [ ] コメビュ内システムメッセージを出す
  * 接続が切れた時にメッセージを出す
  * 音も出すようにして良いかもしれない
* [ ] sm*** もリンクにする
* [ ] 一部設定は別ウィンドウの変更が反映されない方がいい？
  * 読み上げ・


## コメビュー周り
* [ ] 表示・読み上げる種類を細かく調整出来るように
  * [ ] 184
  * [ ] システムメッセージ (来場・エモーション)
  * [ ] ユーザーごと
* [ ] NG機能
  * [ ] コメビュオリジナルNG
  * [ ] ニコ生NG
* [ ] コメビュのカラムの非表示・並び替え・幅変更


## 機能
* [x] コメント送信
* [ ] [コメジェネ](#コメジェネ)
* おみくじ的な機能とか面白そうなので入れたい


## コメジェネ
* HTML5コメントジェネレーター を参考にする？

「ブラウザ拡張機能 - OBS内ブラウザ」で通信するのはWebSocketを使う
```javascript
// OBS 内でイベントリスナーにカスタムイベントを登録する
window.addEventListener("nicolive-comeview-extention", event => { });

// OBS 外でOBSのウェブソケットに向けてメッセージを送信する
const obsws = new OBSWebSocket();
await obsws.connect("ws://localhost:4455","PASSWARD");
obsws.call(
  "CallVendorRequest",
  {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "nicolive-comeview-extention",  // イベントリスナーに登録する名前と同じにする
      event_data: { },  // json-data
    },
  }
);
```
