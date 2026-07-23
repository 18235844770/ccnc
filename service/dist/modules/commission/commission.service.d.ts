import { PrismaService } from '../../prisma/prisma.service';
import { mapCommission } from '../../common/utils/mapper';
import { type CommissionRuleConfig } from './commission.config';
export declare class CommissionService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getActiveRule(): Promise<CommissionRuleConfig>;
    calculateForOrder(orderId: number): Promise<{
        created: number;
        skipped?: undefined;
    } | {
        created: number;
        skipped: boolean;
    }>;
    voidForOrder(orderId: number): Promise<{
        voided: number;
        reversed: number;
    }>;
    payoutForOrder(orderId: number): Promise<{
        marked: number;
        paid: number;
    }>;
    markSettledBatch(limit?: number): Promise<{
        marked: number;
    }>;
    markSettledForOrder(orderId: number): Promise<number>;
    private isCommissionEligibleToSettle;
    payoutSettledBatch(limit?: number): Promise<{
        paid: number;
    }>;
    payoutSettledForOrder(orderId: number): Promise<number>;
    runSettlementCycle(): Promise<{
        settled: number;
        paid: number;
    }>;
    private payoutOne;
    private reversePaidCommission;
    mapAdminListItem(c: ReturnType<typeof mapCommission>): {
        id: number;
        user_id: number;
        amount: number;
        source_order_id: string;
        from_user_id: number;
        status: string;
        type: "DIRECT" | "TEAM" | "SAME_LEVEL";
        created_at: string;
    };
    listAdmin(params: {
        page?: number;
        page_size?: number;
        user_id?: number;
        status?: string;
        type?: string;
    }): Promise<{
        total: number;
        list: {
            id: number;
            user_id: number;
            amount: number;
            source_order_id: string;
            from_user_id: number;
            status: string;
            type: "DIRECT" | "TEAM" | "SAME_LEVEL";
            created_at: string;
        }[];
    }>;
    getAdmin(id: number): Promise<{
        rule_snapshot: string | undefined;
        manual_flag: boolean;
        id: number;
        user_id: number;
        amount: number;
        source_order_id: string;
        from_user_id: number;
        status: string;
        type: "DIRECT" | "TEAM" | "SAME_LEVEL";
        created_at: string;
    }>;
    freeze(id: number, reason: string): Promise<{
        status: string;
        reason: string;
    }>;
    unfreeze(id: number, reason: string): Promise<{
        status: string;
        reason: string;
    }>;
    void(id: number, reason: string): Promise<{
        status: string;
    }>;
    manualCredit(dto: {
        user_id: number;
        amount: number;
        reason: string;
    }): Promise<{
        status: string;
    }>;
    manualReverse(dto: {
        user_id: number;
        amount: number;
        reason: string;
    }): Promise<{
        status: string;
    }>;
    publishRule(dto: {
        name: string;
        config: string;
    }): Promise<{
        status: string;
        version: string;
    }>;
    listRules(): Promise<{
        id: number;
        name: string;
        version: string;
        config: string;
        status: string;
        published_at: string | undefined;
        created_at: string;
    }[]>;
    getActiveRuleDetail(): Promise<{
        name: string;
        version: string;
        status: string;
        base_type: import("./commission.config").CommissionBaseType;
        max_level: number;
        rates: number[];
        settle_delay_days?: number;
        payout_batch_size?: number;
        id?: undefined;
        config?: undefined;
        published_at?: undefined;
    } | {
        id: number;
        name: string;
        version: string;
        config: string;
        status: string;
        published_at: string | undefined;
    }>;
}
