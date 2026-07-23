import { PromotionService } from './promotion.service';
import { PageQueryDto } from '../../common/dto';
import { AdminJwtPayload } from '../auth/auth-token.service';
declare class AuditDistributorDto {
    status: 1 | 2;
    reason: string;
}
declare class UpdateLevelDto {
    level_id: number;
    reason: string;
}
declare class ResetLinkDto {
    reason: string;
}
export declare class AdminPromotionController {
    private readonly promotionService;
    constructor(promotionService: PromotionService);
    listDistributors(query: PageQueryDto & {
        level_id?: number;
        audit_status?: number;
    }): Promise<{
        status: string;
        data: {
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
        };
    }>;
    detail(userId: number): Promise<{
        status: string;
        data: {
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
        };
    }>;
    audit(admin: AdminJwtPayload, userId: number, dto: AuditDistributorDto): Promise<{
        status: string;
        message: string;
    }>;
    updateLevel(admin: AdminJwtPayload, userId: number, dto: UpdateLevelDto): Promise<{
        status: string;
        message: string;
    }>;
    orders(userId: number, query: PageQueryDto): Promise<{
        status: string;
        data: {
            total: number;
            list: {
                id: string;
                user_id: number;
                username: string;
                amount: number;
                created_at: string;
            }[];
        };
    }>;
    promoLink(userId: number): Promise<{
        status: string;
        data: {
            user_id: number;
            invite_code: string;
            link: string;
            status: string;
        };
    }>;
    resetLink(admin: AdminJwtPayload, userId: number, dto: ResetLinkDto): Promise<{
        status: string;
        data: {
            user_id: number;
            invite_code: string;
            link: string;
            status: string;
        };
    }>;
}
export {};
