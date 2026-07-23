import { OrderService } from './order.service';
import { CreateOrderDto, PageQueryDto, PayOrderDto } from '../../common/dto';
import { UserJwtPayload } from '../auth/auth-token.service';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(user: UserJwtPayload, dto: CreateOrderDto): Promise<{
        status: string;
        data: {
            order_id: number;
        };
    }>;
    list(user: UserJwtPayload, query: PageQueryDto & {
        status?: string;
        user_id?: number;
    }): Promise<{
        status: string;
        data: {
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
        };
    }>;
    detail(user: UserJwtPayload, id: number): Promise<{
        status: string;
        data: {
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
        };
    }>;
    pay(user: UserJwtPayload, id: number, dto: PayOrderDto): Promise<{
        status: string;
        data: {
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
        };
    }>;
    cancel(user: UserJwtPayload, id: number): Promise<{
        status: string;
        message: string;
    }>;
    refund(user: UserJwtPayload, id: number): Promise<{
        status: string;
        message: string;
    }>;
}
export declare class AdminOrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    list(query: PageQueryDto & {
        status?: string;
        user_id?: number;
        order_id?: string;
        order_no?: string;
    }): Promise<{
        status: string;
        data: {
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
        };
    }>;
    detail(id: number): Promise<{
        status: string;
        data: {
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
        };
    }>;
    refund(admin: {
        sub: number;
    }, id: number, body: {
        reason: string;
    }): Promise<{
        status: string;
        message: string;
    }>;
}
