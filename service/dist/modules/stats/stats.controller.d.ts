import type { Response } from 'express';
import { StatsService } from './stats.service';
import { ExportStatsDto } from '../../common/dto';
import type { StatsQuery } from './stats.utils';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    overview(query: StatsQuery): Promise<{
        status: string;
        data: {
            cards: {
                new_users: number;
                invest_amount: number;
                withdraw_success_amount: number;
                commission_paid: number;
            };
            new_users_series: {
                bucket: string;
                value: number;
            }[];
            invest_amount_series: {
                bucket: string;
                value: number;
            }[];
        };
    }>;
    userGrowth(query: StatsQuery): Promise<{
        status: string;
        data: {
            series: {
                bucket: string;
                value: number;
            }[];
        };
    }>;
    userConversion(query: StatsQuery): Promise<{
        status: string;
        data: {
            new_users: number;
            first_invest_users: number;
            conversion_rate: number;
        };
    }>;
    promoSummary(query: StatsQuery): Promise<{
        status: string;
        data: {
            l1_series: {
                bucket: string;
                value: number;
            }[];
            l2_series: {
                bucket: string;
                value: number;
            }[];
            l3_series: {
                bucket: string;
                value: number;
            }[];
        };
    }>;
    promoTop(query: {
        by?: string;
        limit?: number;
    }): Promise<{
        status: string;
        data: {
            user_id: number;
            username: string;
            team_invest: number;
        }[] | {
            user_id: number;
            username: string;
            team_commission: number;
        }[] | {
            user_id: number;
            username: string;
            invite_count: number;
        }[];
    }>;
    investSummary(query: StatsQuery): Promise<{
        status: string;
        data: {
            amount_series: {
                bucket: string;
                value: number;
            }[];
            order_count_series: {
                bucket: string;
                value: number;
            }[];
        };
    }>;
    investByProduct(query: StatsQuery): Promise<{
        status: string;
        data: {
            product_id: number;
            product_name: string;
            total_invest_amount: number;
            order_count: number;
        }[];
    }>;
    commissionSummary(query: StatsQuery): Promise<{
        status: string;
        data: {
            pending_series: {
                bucket: string;
                value: number;
            }[];
            paid_series: {
                bucket: string;
                value: number;
            }[];
        };
    }>;
    commissionCostRate(query: StatsQuery): Promise<{
        status: string;
        data: {
            cost_rate: number;
            total_commission: number;
            total_revenue: number;
        };
    }>;
    export(dto: ExportStatsDto): Promise<{
        status: string;
        data: {
            task_id: string;
            download_url: string;
        };
    }>;
    downloadExport(taskId: string, res: Response): Promise<void>;
}
