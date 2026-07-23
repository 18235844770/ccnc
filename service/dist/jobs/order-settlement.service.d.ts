import { PrismaService } from '../prisma/prisma.service';
import { JobLockService } from './job-lock.service';
export declare class OrderSettlementService {
    private readonly prisma;
    private readonly jobLock;
    private readonly logger;
    constructor(prisma: PrismaService, jobLock: JobLockService);
    handleSettlementCron(): Promise<void>;
    settleExpiredOrders(): Promise<{
        settled: number;
    }>;
    settleOne(orderId: number): Promise<boolean>;
}
