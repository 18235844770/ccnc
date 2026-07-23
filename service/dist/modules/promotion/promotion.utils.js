"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_PROMO_LEVEL = void 0;
exports.getRelativeLevel = getRelativeLevel;
exports.maskUsername = maskUsername;
exports.containsPath = containsPath;
exports.levelFromPath = levelFromPath;
exports.MAX_PROMO_LEVEL = 5;
function getRelativeLevel(path, parentUserId, ancestorId) {
    if (parentUserId === ancestorId)
        return 1;
    const segments = path.split('/').filter(Boolean).map(Number);
    const idx = segments.indexOf(ancestorId);
    if (idx === -1)
        return null;
    return segments.length - idx;
}
function maskUsername(username) {
    if (!username)
        return '***';
    if (username.length <= 1)
        return `${username}*`;
    return `${username[0]}${'*'.repeat(Math.min(username.length - 1, 3))}`;
}
function containsPath(path, userId) {
    if (!path)
        return false;
    const segments = path.split('/').filter(Boolean).map(Number);
    return segments.includes(userId);
}
function levelFromPath(path) {
    return path.split('/').filter(Boolean).length;
}
//# sourceMappingURL=promotion.utils.js.map