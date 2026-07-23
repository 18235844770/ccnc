import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, PayOrderDto } from '../../common/dto';
import { CommissionService } from '../commission/commission.service';
import { QueueService } from '../../queue/queue.service';
import { InviteProgressService } from '../promotion/invite-progress.service';
export declare class OrderService {
    private readonly prisma;
    private readonly config;
    private readonly commissionService;
    private readonly queueService;
    private readonly inviteProgress;
    constructor(prisma: PrismaService, config: ConfigService, commissionService: CommissionService, queueService: QueueService, inviteProgress: InviteProgressService);
    private ensureRealnameApproved;
    create(userId: number, dto: CreateOrderDto): Promise<{
        order_id: number;
    }>;
    pay(userId: number, orderId: number, dto: PayOrderDto): Promise<{
        status: string;
        message: string;
        order_id: number;
        redirect_url?: undefined;
        pay_url?: undefined;
    } | {
        status: string;
        redirect_url: string;
        pay_url: string;
        message?: undefined;
        order_id?: undefined;
    }>;
    private payWithBalance;
    private markOrderPaid;
    private markOrderPaidInTx;
    list(userId: number, params: {
        page?: number;
        page_size?: number;
        status?: string;
    }): Promise<{
        total: number;
        records: {
            id: number;
            order_id: number;
            order_no: string;
            user_id: number;
            product_id: number;
            product_name: string | undefined;
            amount: number;
            profit: number | undefined;
            reward_amount: number | undefined;
            status: string;
            start_date: string | undefined;
            end_date: string | undefined;
            created_at: string;
            updated_at: string;
            paid_at: string | undefined;
        }[];
    }>;
    get(userId: number, orderId: number): Promise<{
        id: number;
        order_id: number;
        order_no: string;
        user_id: number;
        product_id: number;
        product_name: string | undefined;
        amount: number;
        profit: number | undefined;
        reward_amount: number | undefined;
        status: string;
        start_date: string | undefined;
        end_date: string | undefined;
        created_at: string;
        updated_at: string;
        paid_at: string | undefined;
    }>;
    cancel(userId: number, orderId: number): Promise<{
        status: string;
        message: string;
    }>;
    refund(userId: number, orderId: number): Promise<{
        status: string;
        message: string;
    }>;
    refundAdmin(adminId: number, orderId: number, reason: string): Promise<{
        status: string;
        message: string;
    }>;
    listAdmin(params: {
        page?: number;
        page_size?: number;
        status?: string;
        user_id?: number;
        order_no?: string;
    }): Promise<{
        total: number;
        records: {
            username: string;
            id: number;
            order_id: number;
            order_no: string;
            user_id: number;
            product_id: number;
            product_name: string | undefined;
            amount: number;
            profit: number | undefined;
            reward_amount: number | undefined;
            status: string;
            start_date: string | undefined;
            end_date: string | undefined;
            created_at: string;
            updated_at: string;
            paid_at: string | undefined;
        }[];
    }>;
    getAdmin(orderId: number): Promise<{
        username: string;
        start_time: string | undefined;
        end_time: string | undefined;
        id: number;
        order_id: number;
        order_no: string;
        user_id: number;
        product_id: number;
        product_name: string | undefined;
        amount: number;
        profit: number | undefined;
        reward_amount: number | undefined;
        status: string;
        start_date: string | undefined;
        end_date: string | undefined;
        created_at: string;
        updated_at: string;
        paid_at: string | undefined;
    }>;
    private triggerCommission;
}
