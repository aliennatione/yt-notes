export function getVideoEl(): HTMLVideoElement | null {
  return document.querySelector('video');
}
export function seek(t: number) {
  const v = getVideoEl();
  if (v) v.currentTime = t;
}
export function play() { getVideoEl()?.play(); }
export function pause() { getVideoEl()?.pause(); }
export function currentTime(): number { return getVideoEl()?.currentTime || 0; }
