import { HttpException, HttpStatus } from '@nestjs/common';
export declare class BusinessException extends HttpException {
    readonly code: string;
    constructor(code: string, message: string, status?: HttpStatus);
}
export declare const UserErrors: {
    readonly USERNAME_EXISTS: "USERNAME_EXISTS";
    readonly USER_NOT_FOUND: "USER_NOT_FOUND";
    readonly INVALID_CREDENTIALS: "INVALID_CREDENTIALS";
    readonly USER_DISABLED: "USER_DISABLED";
    readonly INVALID_INVITE_CODE: "INVALID_INVITE_CODE";
};
export declare const AdminErrors: {
    readonly INVALID_CREDENTIALS: "ADMIN_INVALID_CREDENTIALS";
    readonly ADMIN_DISABLED: "ADMIN_DISABLED";
    readonly USERNAME_EXISTS: "ADMIN_USERNAME_EXISTS";
};
export declare const PromoErrors: {
    readonly INVALID_PARENT: "INVALID_PARENT";
    readonly CYCLE_DETECTED: "PROMO_CYCLE_DETECTED";
    readonly LEVEL_EXCEEDED: "PROMO_LEVEL_EXCEEDED";
};
export declare const OrderErrors: {
    readonly NOT_FOUND: "ORDER_NOT_FOUND";
    readonly INVALID_STATUS: "ORDER_INVALID_STATUS";
    readonly PRODUCT_UNAVAILABLE: "PRODUCT_UNAVAILABLE";
    readonly AMOUNT_TOO_LOW: "AMOUNT_TOO_LOW";
    readonly INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE";
};
export declare const WalletErrors: {
    readonly NOT_FOUND: "WALLET_NOT_FOUND";
    readonly INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE";
    readonly WITHDRAW_TOO_LOW: "WITHDRAW_TOO_LOW";
    readonly WITHDRAW_NOT_FOUND: "WITHDRAW_NOT_FOUND";
    readonly INVALID_WITHDRAW_STATUS: "INVALID_WITHDRAW_STATUS";
};
export declare const RechargeErrors: {
    readonly NOT_FOUND: "RECHARGE_NOT_FOUND";
    readonly AMOUNT_TOO_LOW: "RECHARGE_AMOUNT_TOO_LOW";
    readonly INVALID_STATUS: "RECHARGE_INVALID_STATUS";
    readonly AMOUNT_MISMATCH: "RECHARGE_AMOUNT_MISMATCH";
    readonly INVALID_NOTIFY: "INVALID_NOTIFY";
};
