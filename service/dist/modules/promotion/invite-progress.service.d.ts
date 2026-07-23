import { PrismaService } from '../../prisma/prisma.service';
export declare function calcUnlockRatio(validCount: number): number;
export declare class InviteProgressService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProgress(userId: number): Promise<{
        valid_count: number;
        unlock_ratio: number;
        unlock_percent: number;
    }>;
    recordFirstInvestment(buyerUserId: number, orderId: number): Promise<{
        recorded: boolean;
        skipped?: undefined;
        inviter_id?: undefined;
    } | {
        recorded: boolean;
        skipped: boolean;
        inviter_id?: undefined;
    } | {
        recorded: boolean;
        inviter_id: number;
        skipped?: undefined;
    }>;
    getUnlockRatioForUser(userId: number): Promise<number>;
}
