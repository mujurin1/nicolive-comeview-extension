
メッセージコンテナ (.message-container) について  
ユーザーが指定するグリッドのサイズは PX/FIT/FLEX の３種類  
`grid-template-columns` との対応
* PX - 固定幅 `"XXpx"`
* FIT - 要素にフィットするサイズ `"auto"`
* FLEX - 残りの幅を使う伸びるサイズ `"1fr"`

FLEX は 1fr のみ  
これは複雑な指定は出来ないほうが分かりやすいため


生成されるDIV要素
```
div.motion > モーション毎に自由な定義 >
  div.message-container >
    +div.content-frame.フレーム名 >
      div.content > CONTENT
```

適用されるCSSの例
```css
.motion { }

.message-container {
  display: grid;
  grid-template:
          "icon name    .      " 40px
          "icon message message" auto / 40px fit-content auto;
}
.content-frame.フレーム名 {
  display: 未定;
  grid-area: フレーム名;
}
.content { }
```

