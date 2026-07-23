import { PromotionService } from './promotion.service';
import { PageQueryDto } from '../../common/dto';
import { UserJwtPayload } from '../auth/auth-token.service';
export declare class PromotionController {
    private readonly promotionService;
    constructor(promotionService: PromotionService);
    summary(user: UserJwtPayload): Promise<{
        status: string;
        data: {
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
        };
    }>;
    downlines(user: UserJwtPayload, query: PageQueryDto & {
        level?: number;
    }): Promise<{
        status: string;
        data: {
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
        };
    }>;
}
