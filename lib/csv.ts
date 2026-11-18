import type { Application } from './types';
import { STATUS_LABEL } from './types';

const COLUMNS: { header: string; value: (a: Application) => string | undefined }[] = [
  { header: 'Company', value: (a) => a.company },
  { header: 'Role', value: (a) => a.role },
  { header: 'Stage', value: (a) => STATUS_LABEL[a.status] },
  { header: 'Location', value: (a) => a.location },
  { header: 'Salary', value: (a) => a.salary },
  { header: 'Applied on', value: (a) => a.appliedOn?.slice(0, 10) },
  { header: 'Follow up on', value: (a) => a.followUpOn?.slice(0, 10) },
  { header: 'Job link', value: (a) => a.jobUrl },
  { header: 'Notes', value: (a) => a.notes },
];

/** Quote a value for CSV when it contains a comma, quote or line break. */
function cell(value: string | undefined): string {
  const v = value ?? '';
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function toCsv(items: Application[]): string {
  const rows = [COLUMNS.map((c) => c.header), ...items.map((a) => COLUMNS.map((c) => c.value(a)))];
  return rows.map((r) => r.map(cell).join(',')).join('\r\n');
}

/** Download the applications as a CSV file that opens cleanly in Excel and Google Sheets. */
export function downloadCsv(items: Application[], filename = `jobtrack-${new Date().toISOString().slice(0, 10)}.csv`) {
  // The BOM keeps Excel from mangling non-ASCII characters such as arrows or accented names.
  const blob = new Blob(['﻿' + toCsv(items)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
