import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdminDto, CreateMenuDto, CreateRoleDto, UpdateMenuDto, UpdateRoleDto } from '../../common/dto';
export declare class SystemService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listAdmins(params: {
        page?: number;
        page_size?: number;
    }): Promise<{
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
    }>;
    createAdmin(dto: CreateAdminDto): Promise<{
        id: number;
    }>;
    resetAdminPassword(id: number, password: string): Promise<{
        status: string;
    }>;
    listRoles(): Promise<{
        id: number;
        name: string;
        key: string;
        status: number;
        created_at: string;
    }[]>;
    createRole(dto: CreateRoleDto): Promise<{
        id: number;
    }>;
    updateRole(id: number, dto: UpdateRoleDto): Promise<{
        status: string;
    }>;
    assignRoleMenus(roleId: number, menuIds: number[]): Promise<{
        status: string;
    }>;
    getRoleMenuIds(roleId: number): Promise<number[]>;
    listMenus(): Promise<{
        id: number;
        parent_id: number;
        name: string;
        type: 1 | 2 | 3;
        path: string | undefined;
        component: string | undefined;
        permission: string | undefined;
        sort: number;
        visible: boolean;
    }[]>;
    createMenu(dto: CreateMenuDto): Promise<{
        id: number;
    }>;
    updateMenu(id: number, dto: UpdateMenuDto): Promise<{
        status: string;
    }>;
    listAuditLogs(params: {
        page?: number;
        page_size?: number;
        admin_id?: number;
        action?: string;
        start_time?: string;
        end_time?: string;
    }): Promise<{
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
    }>;
}
