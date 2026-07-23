import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRechargeDto, RechargeNotifyDto } from '../../common/dto';
export declare class RechargeService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    create(userId: number, dto: CreateRechargeDto): Promise<{
        recharge_id: number;
        biz_id: string;
        amount: number;
        channel: string;
        pay_url: string;
    }>;
    handleNotify(dto: RechargeNotifyDto): Promise<{
        status: string;
        message: string;
        recharge_id: number;
    } | {
        status: string;
        message: string;
        recharge_id?: undefined;
    }>;
    private creditRecharge;
    list(userId: number, params: {
        page?: number;
        page_size?: number;
        status?: string;
    }): Promise<{
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
    }>;
}
