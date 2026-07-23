"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateRange = parseDateRange;
exports.bucketKey = bucketKey;
exports.buildSeries = buildSeries;
function parseDateRange(params) {
    const to = params.to ? new Date(params.to) : new Date();
    const from = params.from
        ? new Date(params.from)
        : new Date(to.getTime() - 6 * 24 * 60 * 60 * 1000);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return { from, to, granularity: params.granularity || 'day' };
}
function bucketKey(date, granularity) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    if (granularity === 'month')
        return `${y}-${m}`;
    if (granularity === 'week') {
        const day = date.getDay() || 7;
        const monday = new Date(date);
        monday.setDate(date.getDate() - day + 1);
        return monday.toISOString().slice(0, 10);
    }
    return `${y}-${m}-${d}`;
}
function buildSeries(items, getDate, getValue, from, to, granularity) {
    const map = new Map();
    const cursor = new Date(from);
    while (cursor <= to) {
        map.set(bucketKey(cursor, granularity), 0);
        cursor.setDate(cursor.getDate() + 1);
    }
    for (const item of items) {
        const key = bucketKey(getDate(item), granularity);
        if (map.has(key)) {
            map.set(key, (map.get(key) || 0) + getValue(item));
        }
    }
    return [...map.entries()].map(([bucket, value]) => ({ bucket, value }));
}
//# sourceMappingURL=stats.utils.js.map