import { PrismaService } from '../../prisma/prisma.service';
export interface MenuNode {
    id: number;
    parent_id: number;
    name: string;
    type: 1 | 2 | 3;
    path?: string;
    component?: string;
    permission?: string;
    sort: number;
    visible: boolean;
    children: MenuNode[];
}
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    login(username: string, password: string): Promise<{
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
        menus: MenuNode[];
    }>;
    getProfile(adminId: number): Promise<{
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
        menus: MenuNode[];
    }>;
    private mapMenu;
    private buildMenuTree;
}
