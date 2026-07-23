import { AdminService } from './admin.service';
import { AdminLoginDto } from '../../common/dto';
import { AuthTokenService } from '../auth/auth-token.service';
export declare class AdminAuthController {
    private readonly adminService;
    private readonly authToken;
    constructor(adminService: AdminService, authToken: AuthTokenService);
    login(dto: AdminLoginDto): Promise<{
        status: string;
        token: string;
        data: {
            admin: {
                id: number;
                username: string;
                avatar: string | undefined;
                status: string;
                last_login_ip: string | undefined;
                last_login_time: string | undefined;
                created_at: string;
                updated_at: string;
            };
            permissions: string[];
            menus: import("./admin.service").MenuNode[];
        };
    }>;
    info(admin: {
        sub: number;
    }): Promise<{
        status: string;
        data: {
            user: {
                id: number;
                username: string;
                avatar: string | undefined;
                status: string;
                last_login_ip: string | undefined;
                last_login_time: string | undefined;
                created_at: string;
                updated_at: string;
            };
            roles: string[];
            permissions: string[];
            menus: import("./admin.service").MenuNode[];
        };
    }>;
    menusTree(admin: {
        sub: number;
    }): Promise<{
        status: string;
        data: import("./admin.service").MenuNode[];
    }>;
}
