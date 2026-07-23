export interface ExportTask {
  content: string;
  filename: string;
  expiresAt: number;
}

const tasks = new Map<string, ExportTask>();

export function saveExportTask(taskId: string, task: ExportTask) {
  tasks.set(taskId, task);
}

export function getExportTask(taskId: string): ExportTask | undefined {
  const task = tasks.get(taskId);
  if (!task) return undefined;
  if (task.expiresAt < Date.now()) {
    tasks.delete(taskId);
    return undefined;
  }
  return task;
}

function csvEscape(value: string | number) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(headers: string[], rows: Array<Array<string | number>>) {
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(','));
  }
  return `\uFEFF${lines.join('\n')}`;
}
