import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { InviteProgressService } from './invite-progress.service';
export declare class PromotionService {
    private readonly prisma;
    private readonly config;
    private readonly inviteProgress;
    constructor(prisma: PrismaService, config: ConfigService, inviteProgress: InviteProgressService);
    getSummary(userId: number): Promise<{
        invite_code: string;
        share_url: string;
        link_status: string;
        promo_level: number;
        direct_count: number;
        team_count: number;
        commission_total: number;
        level_counts: Record<string, number>;
        invite_unlock: {
            valid_count: number;
            unlock_ratio: number;
            unlock_percent: number;
        };
    }>;
    getLevelCounts(userId: number): Promise<Record<string, number>>;
    listDownlines(userId: number, params: {
        level?: number;
        page?: number;
        page_size?: number;
    }): Promise<{
        total: number;
        records: {
            user_id: number;
            username: string;
            level: number;
            promo_level: number;
            invest_amount: number;
            order_count: number;
            joined_at: string;
        }[];
    }>;
    listCommissions(userId: number, params: {
        page?: number;
        page_size?: number;
        status?: string;
    }): Promise<{
        total: number;
        records: {
            id: number;
            biz_type: string;
            biz_id: string;
            event_id: string | undefined;
            from_user_id: number;
            to_user_id: number;
            relation_level: number;
            amount: number;
            status: string;
            rule_snapshot: string | undefined;
            settled_at: string | undefined;
            paid_at: string | undefined;
            manual_flag: boolean;
            reverse_of: number | undefined;
            created_at: string;
            updated_at: string;
        }[];
    }>;
    getCommissionSummary(userId: number): Promise<{
        pending: number;
        settled: number;
        paid: number;
        total: number;
    }>;
    getAdminUserDetail(userId: number): Promise<{
        user: {
            user_id: number;
            username: string;
            phone_number: string | undefined;
            email: string | undefined;
            status: string;
            created_at: string;
            promo_summary: Record<string, number>;
        };
        uplines: {
            user_id: number;
            username: string;
        }[];
        downlines: Record<string, {
            user_id: number;
            username: string;
        }[]>;
    }>;
    adjustPromoRelation(adminId: number, userId: number, newParentUserId: number, reason: string): Promise<{
        status: string;
    }>;
    private generateInviteCode;
    private computeAuditStatus;
    private getDownlineUserIds;
    private getDownlineSalesTotal;
    private buildDistributorProfile;
    listDistributors(params: {
        page?: number;
        page_size?: number;
        level_id?: number;
        audit_status?: number;
    }): Promise<{
        total: number;
        list: {
            user_id: number;
            username: string | undefined;
            level_id: number;
            audit_status: 0 | 1 | 2;
            total_commission: number;
            total_sales: number;
            join_time: string;
        }[];
    }>;
    getDistributorDetail(userId: number): Promise<{
        profile: {
            user_id: number;
            username: string | undefined;
            level_id: number;
            audit_status: 0 | 1 | 2;
            total_commission: number;
            total_sales: number;
            join_time: string;
        };
        user: {
            user_id: number;
            username: string;
            phone: string | undefined;
            email: string | undefined;
        };
        team: {
            l1_count: number;
            l2_count: number;
            l3_count: number;
        };
    }>;
    auditDistributor(adminId: number, userId: number, status: 1 | 2, reason: string): Promise<{
        status: string;
    }>;
    updateDistributorLevel(adminId: number, userId: number, levelId: number, reason: string): Promise<{
        status: string;
    }>;
    getUserPromoLink(userId: number): Promise<{
        user_id: number;
        invite_code: string;
        link: string;
        status: string;
    }>;
    resetUserPromoLink(adminId: number, userId: number, reason: string): Promise<{
        user_id: number;
        invite_code: string;
        link: string;
        status: string;
    }>;
    listDistributorOrders(userId: number, params: {
        page?: number;
        page_size?: number;
    }): Promise<{
        total: number;
        list: {
            id: string;
            user_id: number;
            username: string;
            amount: number;
            created_at: string;
        }[];
    }>;
}
