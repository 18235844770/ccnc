import { CommissionService } from '../modules/commission/commission.service';
import { JobLockService } from './job-lock.service';
export declare class CommissionSettlementService {
    private readonly commissionService;
    private readonly jobLock;
    private readonly logger;
    constructor(commissionService: CommissionService, jobLock: JobLockService);
    handleCommissionSettlementCron(): Promise<void>;
    runSettlementCycle(): Promise<{
        settled: number;
        paid: number;
    }>;
}
