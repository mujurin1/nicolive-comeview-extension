
/**
 * コメントビューの設定はそのコメントビューコンポーネントでのみ使用する\
 * (後々でコメントビューそのものを変える時に困らないように)
 */
export interface LegacyCommentViewFormat {
  backgroundColor: string;
  borderColor: string;
  borderStyle: "none" | "solid" | "dashed" | "dotted";

  // TODO: ヘッダー項目
}
