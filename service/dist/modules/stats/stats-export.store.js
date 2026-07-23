"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveExportTask = saveExportTask;
exports.getExportTask = getExportTask;
exports.toCsv = toCsv;
const tasks = new Map();
function saveExportTask(taskId, task) {
    tasks.set(taskId, task);
}
function getExportTask(taskId) {
    const task = tasks.get(taskId);
    if (!task)
        return undefined;
    if (task.expiresAt < Date.now()) {
        tasks.delete(taskId);
        return undefined;
    }
    return task;
}
function csvEscape(value) {
    const text = String(value ?? '');
    if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}
function toCsv(headers, rows) {
    const lines = [headers.map(csvEscape).join(',')];
    for (const row of rows) {
        lines.push(row.map(csvEscape).join(','));
    }
    return `\uFEFF${lines.join('\n')}`;
}
//# sourceMappingURL=stats-export.store.js.map