export function calculateWorkingDays(
  startDate: Date,
  endDate: Date,
  holidayDates: Set<string>,
): number {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const day = current.getDay();
    const dateStr = current.toISOString().split('T')[0];

    if (day !== 0 && day !== 6 && !holidayDates.has(dateStr)) {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
}
