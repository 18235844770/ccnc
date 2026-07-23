import { PrismaService } from '../../prisma/prisma.service';
import { JobLockService } from '../../jobs/job-lock.service';
export declare class RiskService {
    private readonly prisma;
    private readonly jobLock;
    private readonly logger;
    constructor(prisma: PrismaService, jobLock: JobLockService);
    ensureDefaultRules(): Promise<void>;
    handleRiskScanCron(): Promise<void>;
    runScan(): Promise<{
        created: number;
    }>;
    private createEventIfNew;
    listEvents(params: {
        page?: number;
        page_size?: number;
        status?: string;
        rule_code?: string;
        user_id?: number;
    }): Promise<{
        total: number;
        list: {
            id: number;
            rule_code: string;
            user_id: number | null;
            severity: string;
            status: string;
            detail: string | null;
            created_at: string;
        }[];
    }>;
    listRules(): Promise<{
        id: number;
        code: string;
        name: string;
        rule_type: string;
        threshold: string;
        enabled: boolean;
        description: string | null;
    }[]>;
    resolveEvent(adminId: number, eventId: number, action: string, reason?: string): Promise<{
        status: string;
    } | null>;
    getDashboard(): Promise<{
        open_events: number;
        high_severity: number;
        today_events: number;
        enabled_rules: number;
    }>;
}
