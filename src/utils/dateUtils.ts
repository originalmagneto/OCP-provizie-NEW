export function isInQuarter(
  date: Date,
  year: number,
  quarter: number,
): boolean {
  const quarterStart = new Date(year, (quarter - 1) * 3, 1);
  const quarterEnd = new Date(year, quarter * 3, 0);
  return date >= quarterStart && date <= quarterEnd;
}
