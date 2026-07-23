import { RechargeService } from './recharge.service';
import { CreateRechargeDto, PageQueryDto, RechargeNotifyDto } from '../../common/dto';
import { UserJwtPayload } from '../auth/auth-token.service';
export declare class RechargeController {
    private readonly rechargeService;
    constructor(rechargeService: RechargeService);
    create(user: UserJwtPayload, dto: CreateRechargeDto): Promise<{
        status: string;
        data: {
            recharge_id: number;
            biz_id: string;
            amount: number;
            channel: string;
            pay_url: string;
        };
    }>;
    notify(dto: RechargeNotifyDto): Promise<{
        status: string;
        message: string;
        recharge_id: number;
    } | {
        status: string;
        message: string;
        recharge_id?: undefined;
    }>;
    list(user: UserJwtPayload, query: PageQueryDto & {
        status?: string;
    }): Promise<{
        status: string;
        data: {
            total: number;
            records: {
                id: number;
                recharge_id: number;
                user_id: number;
                biz_id: string;
                amount: number;
                status: string;
                channel: string | undefined;
                created_at: string;
                updated_at: string;
            }[];
        };
    }>;
}
