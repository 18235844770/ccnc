"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COMMISSION_RULE = exports.MAX_COMMISSION_LEVEL = void 0;
exports.commissionTypeByLevel = commissionTypeByLevel;
exports.parseAncestors = parseAncestors;
exports.MAX_COMMISSION_LEVEL = 5;
exports.DEFAULT_COMMISSION_RULE = {
    base_type: 'AMOUNT',
    max_level: exports.MAX_COMMISSION_LEVEL,
    rates: [0.05, 0.03, 0.02, 0.01, 0.005],
    settle_delay_days: 0,
    payout_batch_size: 100,
};
function commissionTypeByLevel(level) {
    if (level === 1)
        return 'DIRECT';
    return 'TEAM';
}
function parseAncestors(path, parentUserId, maxLevel) {
    const ancestors = [{ userId: parentUserId, level: 1 }];
    if (!path)
        return ancestors.slice(0, maxLevel);
    const ids = path
        .split('/')
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n) && n > 0);
    const reversed = [...ids].reverse();
    let level = 2;
    for (const id of reversed) {
        if (id === parentUserId)
            continue;
        if (level > maxLevel)
            break;
        ancestors.push({ userId: id, level });
        level += 1;
    }
    return ancestors.slice(0, maxLevel);
}
//# sourceMappingURL=commission.config.js.map