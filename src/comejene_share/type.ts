
/**
 * コメジェネが受信するメッセージ
 */
export interface ComejeneContent {
  readonly icon: string | undefined;
  readonly name: string | undefined;
  readonly message: string;
}
