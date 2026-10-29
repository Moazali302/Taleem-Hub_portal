export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

function escapeCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Downloads `rows` as a CSV file in the browser. Pure client-side — no API call. */
export function downloadCsv<T>(fileName: string, columns: CsvColumn<T>[], rows: T[]): void {
  const lines = [
    columns.map((col) => escapeCell(col.header)).join(','),
    ...rows.map((row) => columns.map((col) => escapeCell(col.value(row))).join(',')),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
