export function clampProgress(
  value: number,
  max: number,
): { value: number; max: number; percent: number } {
  const safeMax = Math.max(0, max);
  const safeValue = Math.min(Math.max(0, value), safeMax);
  const percent = safeMax === 0 ? 0 : Math.round((safeValue / safeMax) * 100);

  return { value: safeValue, max: safeMax, percent };
}

export function progressLabel(value: number, max: number): string {
  const progress = clampProgress(value, max);
  return `Question ${progress.value} of ${progress.max}`;
}
