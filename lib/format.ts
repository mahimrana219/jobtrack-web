const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

export function shortDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : fmt.format(d);
}

export function daysSince(iso?: string) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function relative(iso?: string) {
  const d = daysSince(iso);
  if (d === null) return '';
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d} days ago`;
  if (d < 14) return 'last week';
  return `${Math.floor(d / 7)} weeks ago`;
}

export function isFollowUpDue(iso?: string) {
  return !!iso && new Date(iso).getTime() <= Date.now();
}

// For <input type="date">
export function toDateInput(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}
