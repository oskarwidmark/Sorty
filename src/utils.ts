export function hsvToRgbHex(h: number, s: number, v: number) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)) * 255);
  };

  return (
    '#' +
    [f(5), f(3), f(1)].map((x) => x.toString(16).padStart(2, '0')).join('')
  );
}

export function shuffleArray(arr: unknown[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export const createArr = (columnNbr: number) =>
  [...Array(columnNbr).keys()].map((a, idx) => {
    return { x: a, id: idx };
  });

export const timeScale = (x: number) => Math.round(2 ** x) - 1;

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
