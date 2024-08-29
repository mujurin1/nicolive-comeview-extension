
export const iconNone = "https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/defaults/blank.jpg";

export function timeString(ms: number): string {
  const sign = ms < 0 ? "-" : "";

  const totalSec = Math.abs(Math.floor(ms / 1000));

  const sec = totalSec % 60;
  const min = (totalSec - sec) % 3600 / 60;
  const hor = Math.floor(totalSec / 3600);
  return `${sign}${hor}:${pad(min)}:${pad(sec)}`;
}

function pad(num: number): string {
  return `00${num}`.slice(-2);
}

export function onErrorImage(e: Event) {
  const img = e.currentTarget as HTMLImageElement;
  img.src = iconNone;
}

export function parseIconUrl(userId?: string | number) {
  if (typeof userId !== "number") return iconNone;
  return `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${Math.floor(userId / 1e4)}/${userId}.jpg`;
}
