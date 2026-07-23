import { PrismaService } from '../../prisma/prisma.service';
import { type StatsQuery } from './stats.utils';
export declare class StatsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    overview(params: StatsQuery): Promise<{
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
    }>;
    userGrowth(params: StatsQuery): Promise<{
        series: {
            bucket: string;
            value: number;
        }[];
    }>;
    userConversion(_params: StatsQuery): Promise<{
        new_users: number;
        first_invest_users: number;
        conversion_rate: number;
    }>;
    promoSummary(params: StatsQuery): Promise<{
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
    }>;
    promoTop(params: {
        by?: string;
        limit?: number;
    }): Promise<{
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
    }[]>;
    investSummary(params: StatsQuery): Promise<{
        amount_series: {
            bucket: string;
            value: number;
        }[];
        order_count_series: {
            bucket: string;
            value: number;
        }[];
    }>;
    investByProduct(_params: StatsQuery): Promise<{
        product_id: number;
        product_name: string;
        total_invest_amount: number;
        order_count: number;
    }[]>;
    commissionSummary(params: StatsQuery): Promise<{
        pending_series: {
            bucket: string;
            value: number;
        }[];
        paid_series: {
            bucket: string;
            value: number;
        }[];
    }>;
    commissionCostRate(_params: StatsQuery): Promise<{
        cost_rate: number;
        total_commission: number;
        total_revenue: number;
    }>;
    createExport(type: 'overview' | 'users' | 'orders' | 'products', params: StatsQuery): Promise<{
        task_id: string;
        download_url: string;
    }>;
    getExportFile(taskId: string): import("./stats-export.store").ExportTask;
}
