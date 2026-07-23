import { PromotionService } from '../promotion/promotion.service';
import { PageQueryDto } from '../../common/dto';
import { UserJwtPayload } from '../auth/auth-token.service';
export declare class CommissionController {
    private readonly promotionService;
    constructor(promotionService: PromotionService);
    list(user: UserJwtPayload, query: PageQueryDto & {
        status?: string;
    }): Promise<{
        status: string;
        data: {
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
        };
    }>;
    summary(user: UserJwtPayload): Promise<{
        status: string;
        data: {
            pending: number;
            settled: number;
            paid: number;
            total: number;
        };
    }>;
}
