export declare const MAX_COMMISSION_LEVEL = 5;
export type CommissionBaseType = 'AMOUNT' | 'PROFIT';
export interface CommissionRuleConfig {
    base_type: CommissionBaseType;
    max_level: number;
    rates: number[];
    settle_delay_days?: number;
    payout_batch_size?: number;
}
export declare const DEFAULT_COMMISSION_RULE: CommissionRuleConfig;
export declare function commissionTypeByLevel(level: number): 'DIRECT' | 'TEAM' | 'SAME_LEVEL';
export declare function parseAncestors(path: string, parentUserId: number, maxLevel: number): {
    userId: number;
    level: number;
}[];
