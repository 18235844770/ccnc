import { WalletService } from './wallet.service';
import { PageQueryDto, WithdrawDto } from '../../common/dto';
import { UserJwtPayload } from '../auth/auth-token.service';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    wallets(user: UserJwtPayload): Promise<{
        status: string;
        data: {
            id: number;
            user_id: number;
            type: string;
            balance_available: number;
            balance_frozen: number;
            created_at: string;
            updated_at: string;
        }[];
    }>;
    ledger(user: UserJwtPayload, query: PageQueryDto & {
        wallet_type?: string;
    }): Promise<{
        status: string;
        data: {
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
        };
    }>;
    withdraw(user: UserJwtPayload, dto: WithdrawDto): Promise<{
        status: string;
        data: {
            withdraw_id: number;
        };
    }>;
    withdraws(user: UserJwtPayload, query: PageQueryDto & {
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
}
