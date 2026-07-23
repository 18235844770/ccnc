import { PrismaService } from '../../prisma/prisma.service';
import { WithdrawDto } from '../../common/dto';
export declare class WalletService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listWallets(userId: number): Promise<{
        id: number;
        user_id: number;
        type: string;
        balance_available: number;
        balance_frozen: number;
        created_at: string;
        updated_at: string;
    }[]>;
    listLedger(userId: number, params: {
        page?: number;
        page_size?: number;
        wallet_type?: string;
    }): Promise<{
        total: number;
        records: {
            id: number;
            wallet_id: number;
            user_id: number;
            type: string;
            wallet_type: string;
            reference_id: string;
            reference_type: string;
            amount: number;
            balance_before: number;
            balance_after: number;
            description: string | undefined;
            created_at: string;
        }[];
    }>;
    withdraw(userId: number, dto: WithdrawDto): Promise<{
        withdraw_id: number;
    }>;
    listWithdraws(userId: number, params: {
        page?: number;
        page_size?: number;
        status?: string;
    }): Promise<{
        total: number;
        records: {
            id: number;
            withdraw_id: number;
            user_id: number;
            amount: number;
            fee: number;
            status: string;
            address: string;
            network: string;
            reason: string | undefined;
            created_at: string;
            updated_at: string;
        }[];
    }>;
    listAdminWithdraws(params: {
        page?: number;
        page_size?: number;
        user_id?: number;
        status?: string;
    }): Promise<{
        total: number;
        records: {
            id: number;
            withdraw_id: number;
            user_id: number;
            amount: number;
            fee: number;
            status: string;
            address: string;
            network: string;
            reason: string | undefined;
            created_at: string;
            updated_at: string;
        }[];
    }>;
    approveWithdraw(adminId: number, withdrawId: number): Promise<{
        status: string;
    }>;
    rejectWithdraw(adminId: number, withdrawId: number, reason: string): Promise<{
        status: string;
    }>;
    listAdminLedger(params: {
        page?: number;
        page_size?: number;
        user_id?: number;
        biz_type?: string;
    }): Promise<{
        total: number;
        records: {
            type: string;
            id: number;
            wallet_id: number;
            user_id: number;
            wallet_type: string;
            reference_id: string;
            reference_type: string;
            amount: number;
            balance_before: number;
            balance_after: number;
            description: string | undefined;
            created_at: string;
        }[];
    }>;
    adjustBalance(adminId: number, dto: {
        user_id: number;
        amount: number;
        description: string;
    }): Promise<{
        status: string;
    }>;
}
