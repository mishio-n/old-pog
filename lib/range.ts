export const range = (start: number, end: number) =>
  [...Array(end - start + 1)].map((_, i) => start + i);
