import { RiskService } from './risk.service';
import { PageQueryDto } from '../../common/dto';
export declare class RiskController {
    private readonly riskService;
    constructor(riskService: RiskService);
    dashboard(): Promise<{
        status: string;
        data: {
            open_events: number;
            high_severity: number;
            today_events: number;
            enabled_rules: number;
        };
    }>;
    events(query: PageQueryDto & {
        status?: string;
        rule_code?: string;
        user_id?: number;
    }): Promise<{
        status: string;
        data: {
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
        };
    }>;
    rules(): Promise<{
        status: string;
        data: {
            id: number;
            code: string;
            name: string;
            rule_type: string;
            threshold: string;
            enabled: boolean;
            description: string | null;
        }[];
    }>;
    resolve(admin: {
        sub: number;
    }, id: number, body: {
        action: string;
        reason?: string;
    }): Promise<{
        status: string;
        message: string;
    }>;
    manualScan(): Promise<{
        status: string;
        data: {
            created: number;
        };
    }>;
}
