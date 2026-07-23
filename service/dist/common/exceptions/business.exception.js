"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RechargeErrors = exports.WalletErrors = exports.OrderErrors = exports.PromoErrors = exports.AdminErrors = exports.UserErrors = exports.BusinessException = void 0;
const common_1 = require("@nestjs/common");
class BusinessException extends common_1.HttpException {
    code;
    constructor(code, message, status = common_1.HttpStatus.BAD_REQUEST) {
        super({ status: 'error', message, code }, status);
        this.code = code;
    }
}
exports.BusinessException = BusinessException;
exports.UserErrors = {
    USERNAME_EXISTS: 'USERNAME_EXISTS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    USER_DISABLED: 'USER_DISABLED',
    INVALID_INVITE_CODE: 'INVALID_INVITE_CODE',
};
exports.AdminErrors = {
    INVALID_CREDENTIALS: 'ADMIN_INVALID_CREDENTIALS',
    ADMIN_DISABLED: 'ADMIN_DISABLED',
    USERNAME_EXISTS: 'ADMIN_USERNAME_EXISTS',
};
exports.PromoErrors = {
    INVALID_PARENT: 'INVALID_PARENT',
    CYCLE_DETECTED: 'PROMO_CYCLE_DETECTED',
    LEVEL_EXCEEDED: 'PROMO_LEVEL_EXCEEDED',
};
exports.OrderErrors = {
    NOT_FOUND: 'ORDER_NOT_FOUND',
    INVALID_STATUS: 'ORDER_INVALID_STATUS',
    PRODUCT_UNAVAILABLE: 'PRODUCT_UNAVAILABLE',
    AMOUNT_TOO_LOW: 'AMOUNT_TOO_LOW',
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
};
exports.WalletErrors = {
    NOT_FOUND: 'WALLET_NOT_FOUND',
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
    WITHDRAW_TOO_LOW: 'WITHDRAW_TOO_LOW',
    WITHDRAW_NOT_FOUND: 'WITHDRAW_NOT_FOUND',
    INVALID_WITHDRAW_STATUS: 'INVALID_WITHDRAW_STATUS',
};
exports.RechargeErrors = {
    NOT_FOUND: 'RECHARGE_NOT_FOUND',
    AMOUNT_TOO_LOW: 'RECHARGE_AMOUNT_TOO_LOW',
    INVALID_STATUS: 'RECHARGE_INVALID_STATUS',
    AMOUNT_MISMATCH: 'RECHARGE_AMOUNT_MISMATCH',
    INVALID_NOTIFY: 'INVALID_NOTIFY',
};
//# sourceMappingURL=business.exception.js.map