export const calculateCircleCenter = (
  row: number,
  col: number,
  size: number,
  r: number
) => {
  // Calculate the center of the rectangle
  const cx = col * size + size / 2;
  const cy = row * size + size / 2;
  return { cx, cy };
};
