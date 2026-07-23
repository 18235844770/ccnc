import { CommissionService } from './commission.service';
import { PageQueryDto } from '../../common/dto';
declare class ReasonDto {
    reason: string;
}
declare class ManualCommissionDto {
    user_id: number;
    amount: number;
    reason: string;
}
declare class PublishRuleDto {
    name: string;
    config: string;
}
export declare class AdminCommissionController {
    private readonly commissionService;
    constructor(commissionService: CommissionService);
    list(query: PageQueryDto & {
        user_id?: number;
        status?: string;
        type?: string;
    }): Promise<{
        status: string;
        data: {
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
        };
    }>;
    detail(id: number): Promise<{
        status: string;
        data: {
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
        };
    }>;
    freeze(id: number, dto: ReasonDto): Promise<{
        status: string;
        message: string;
    }>;
    unfreeze(id: number, dto: ReasonDto): Promise<{
        status: string;
        message: string;
    }>;
    voidOne(id: number, dto: ReasonDto): Promise<{
        status: string;
        message: string;
    }>;
    manualCredit(dto: ManualCommissionDto): Promise<{
        status: string;
        message: string;
    }>;
    manualReverse(dto: ManualCommissionDto): Promise<{
        status: string;
        message: string;
    }>;
    publishRule(dto: PublishRuleDto): Promise<{
        status: string;
        data: {
            status: string;
            version: string;
        };
    }>;
    listRules(): Promise<{
        status: string;
        data: {
            id: number;
            name: string;
            version: string;
            config: string;
            status: string;
            published_at: string | undefined;
            created_at: string;
        }[];
    }>;
    activeRule(): Promise<{
        status: string;
        data: {
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
        };
    }>;
    runSettlement(): Promise<{
        status: string;
        data: {
            settled: number;
            paid: number;
        };
    }>;
}
export {};
