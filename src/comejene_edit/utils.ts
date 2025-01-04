import { promiser } from "@mujurin/nicolive-api-ts";

/**
 * 重み付きランダム選択を行うジェネレータ関数を作成します
 *
 * @param items - 重みと値のペアの配列. 各要素は [重み, 値] の形式です
 * @returns 重み付きランダム選択を行う `get` メソッドを持つオブジェクト
 *
 * @description
 * この関数は、与えられた重みに基づいてランダムに値を選択する `get` メソッドを持つオブジェクトを返します\
 * 各アイテムが選択される確率は、そのアイテムの重みを全アイテムの重みの合計で割った値になります
 *
 * @example
 * const generator = createWeightedRandomGenerator([
 *   [1, "赤"], // "赤"が選ばれる確率: 1/6
 *   [2, "青"], // "青"が選ばれる確率: 1/3
 *   [3, "緑"], // "緑"が選ばれる確率: 1/2
 * ]);
 * const result = generator.get();
 */
export function createRandomGenerator<T>(items: [number, T][]): { get(): T; } {
  const totalWeight = items.reduce((sum, [weight]) => sum + weight, 0);
  const normalizedItems = items.map(([weight, value]) => [weight / totalWeight, value] as const);

  return {
    get(): T {
      const random = Math.random();
      let cumulativeWeight = 0;

      for (const [weight, value] of normalizedItems) {
        cumulativeWeight += weight;
        if (random < cumulativeWeight) {
          return value;
        }
      }

      // 浮動小数点の精度の問題で万が一の場合に備えて
      return normalizedItems[normalizedItems.length - 1][1];
    }
  };
}


let _lastComment = "";
export function getDummyContent(): string {
  let comment: string;
  do {
    const ary = dummyComments.get();
    comment = ary[Math.floor(Math.random() * ary.length)];
  } while (_lastComment === comment);

  _lastComment = comment;
  return comment;
}


const dummyComments = createRandomGenerator<string[]>([
  [40, [    // 挨拶
    "わこつ", "初見です",
    "おはよう", "こんにちは", "こんばんわ",
    "おつ", "またね", "ばいばい",
  ]],
  [10, [    // 挨拶 長め
    "初見です！よろしくお願いします！",
    "おはよう！今日は寒いね",
    "今日も配信おつかれさま！",
  ]],

  [100, [    // 一般
    "長く苦しい戦いだった・・・",
    "ハッピーハロウィーン",
    "犬のおまわりさん♪",
    // "座布団10枚あげたい",
    "田舎の鳥はカントリー",
    // "また幽体離脱してる",
    "ﾜｧ───ヽ(*ﾟ∀ﾟ*)ﾉ───ｲ",
    "👹悪い子はいねがー👹",
  ]],

  [40, [    // 単発
    "にょきにょき", "わぁわぁ", "どうぞどうぞ",
    "８８８８８８", "8888888",
  ]],
  [40, [    // 長め
    "ダミーテキストです",
    "もう少し長めのダミーテキストです",
    "☄これは長いダミーテキストで絵文字も含んでいます🥚🐣🐔",
  ]],
  [20, [    // 複数行
    "１行目\n２行目です\n３行目",
    "こいつら、強いよね。\n序盤、中盤、終盤、隙がない",
    "パラッシュ、疲れたろう。\n僕とっても眠いんだ・・・",
  ]],

  [5, [     // 単発 あまりでないで良いやつ
    "見せられないよ！",
    "草", "なるほど", "わかる", "すご！", "美味しい",
    "＼(^o^)／", "つよい", "ﾔｧｯﾊｯﾊｯ", "みょんみょん", "🙈🙉🙊", "💩",
  ]],

  [5, [   // ???
    "❤　ℳℴℯℳℴℯ　ｷｭﾝ　❤＼(◕‿◕✿ฺ)／❤　ℳℴℯℳℴℯ　ｷｭﾝ　❤❤　ℳℴℯℳℴℯ　ｷｭﾝ❤＼(◕‿◕✿ฺ)／",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  ]],
]);

/**
 * `navigator.locks.request`でロックを獲得し、開放する関数を返す\
 * ロックを獲得出来なかった場合は`undefined`を返す
 * @param name ロックする名前
 * @returns ロックを開放する関数
 */
export function getNavigatorLock(name: string): (() => void) | undefined {
  const p = promiser();

  const lock = navigator.locks.request(name, { ifAvailable: true }, () => p.promise);
  // ロックの獲得に失敗した
  if (lock == null) return;

  return p.resolve;
}
