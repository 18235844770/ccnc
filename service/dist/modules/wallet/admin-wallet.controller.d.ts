import { WalletService } from './wallet.service';
import { AdjustBalanceDto, PageQueryDto, RejectWithdrawDto } from '../../common/dto';
export declare class AdminWalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    withdraws(query: PageQueryDto & {
        user_id?: number;
        status?: string;
    }): Promise<{
        status: string;
        data: {
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
        };
    }>;
    approve(admin: {
        sub: number;
    }, id: number): Promise<{
        status: string;
        message: string;
    }>;
    reject(admin: {
        sub: number;
    }, id: number, dto: RejectWithdrawDto): Promise<{
        status: string;
        message: string;
    }>;
    ledger(query: PageQueryDto & {
        user_id?: number;
        biz_type?: string;
    }): Promise<{
        status: string;
        data: {
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
        };
    }>;
    adjustment(admin: {
        sub: number;
    }, dto: AdjustBalanceDto): Promise<{
        status: string;
        message: string;
    }>;
}
