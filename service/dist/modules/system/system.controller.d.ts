import { SystemService } from './system.service';
import { AssignRoleMenusDto, CreateAdminDto, CreateMenuDto, CreateRoleDto, PageQueryDto, ResetAdminPwdDto, UpdateMenuDto, UpdateRoleDto } from '../../common/dto';
export declare class SystemController {
    private readonly systemService;
    constructor(systemService: SystemService);
    admins(query: PageQueryDto): Promise<{
        status: string;
        data: {
            total: number;
            list: {
                id: number;
                username: string;
                status: number;
                roles: {
                    id: number;
                    name: string;
                    key: string;
                    status: number;
                    created_at: string;
                }[];
                created_at: string;
            }[];
        };
    }>;
    createAdmin(dto: CreateAdminDto): Promise<{
        status: string;
        data: {
            id: number;
        };
    }>;
    resetPwd(id: number, dto: ResetAdminPwdDto): Promise<{
        status: string;
        message: string;
    }>;
    roles(): Promise<{
        status: string;
        data: {
            id: number;
            name: string;
            key: string;
            status: number;
            created_at: string;
        }[];
    }>;
    createRole(dto: CreateRoleDto): Promise<{
        status: string;
        data: {
            id: number;
        };
    }>;
    updateRole(id: number, dto: UpdateRoleDto): Promise<{
        status: string;
        message: string;
    }>;
    roleMenus(id: number): Promise<{
        status: string;
        data: number[];
    }>;
    assignMenus(id: number, dto: AssignRoleMenusDto): Promise<{
        status: string;
        message: string;
    }>;
    menus(): Promise<{
        status: string;
        data: {
            id: number;
            parent_id: number;
            name: string;
            type: 1 | 2 | 3;
            path: string | undefined;
            component: string | undefined;
            permission: string | undefined;
            sort: number;
            visible: boolean;
        }[];
    }>;
    createMenu(dto: CreateMenuDto): Promise<{
        status: string;
        data: {
            id: number;
        };
    }>;
    updateMenu(id: number, dto: UpdateMenuDto): Promise<{
        status: string;
        message: string;
    }>;
    auditLogs(query: PageQueryDto & {
        admin_id?: number;
        action?: string;
        start_time?: string;
        end_time?: string;
    }): Promise<{
        status: string;
        data: {
            total: number;
            list: {
                id: number;
                admin_id: number;
                admin_name: string;
                action: string;
                target_type: string;
                target_id: number;
                reason: string;
                created_at: string;
            }[];
        };
    }>;
}
