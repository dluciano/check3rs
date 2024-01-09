export const getMiddlePoint = (
  row: number,
  col: number,
  size: number
): {
  readonly x: number;
  readonly y: number;
} => {
  const x = col * size + size / 2;
  const y = row * size + size / 2;
  return { x, y };
};
