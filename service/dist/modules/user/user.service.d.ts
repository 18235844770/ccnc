import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, RealnameAuthDto, BanUserDto, UnbanUserDto, UpdateProfileDto } from '../../common/dto';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    register(dto: RegisterDto): Promise<{
        id: number;
        username: string;
        email: string | undefined;
        phone_number: string | undefined;
        avatar_url: string | undefined;
        status: string;
        created_at: string;
        updated_at: string;
    }>;
    private bindPromotion;
    login(username: string, password: string): Promise<{
        status: string;
        username: string;
        email: string | null;
        phone_number: string | null;
        avatar_url: string | null;
        id: number;
        password_hash: string;
        created_at: Date;
        updated_at: Date;
    }>;
    getById(id: number): Promise<{
        realname_status: string | undefined;
        real_name: string | undefined;
        id: number;
        username: string;
        email: string | undefined;
        phone_number: string | undefined;
        avatar_url: string | undefined;
        status: string;
        created_at: string;
        updated_at: string;
    }>;
    submitRealname(userId: number, dto: RealnameAuthDto): Promise<{
        auth_status: string;
        real_name: string;
    }>;
    getRealname(userId: number): Promise<{
        auth_status: string;
        real_name?: undefined;
        created_at?: undefined;
    } | {
        auth_status: string;
        real_name: string | undefined;
        created_at: string;
    }>;
    updateProfile(userId: number, dto: UpdateProfileDto): Promise<{
        id: number;
        username: string;
        email: string | undefined;
        phone_number: string | undefined;
        avatar_url: string | undefined;
        status: string;
        created_at: string;
        updated_at: string;
    }>;
    listAdmin(params: {
        page?: number;
        page_size?: number;
        username?: string;
        keyword?: string;
        user_id?: number;
        status?: string;
    }): Promise<{
        total: number;
        records: {
            user_id: number;
            username: string;
            phone_number: string | undefined;
            email: string | undefined;
            status: string;
            created_at: string;
            promo_summary: {
                l1_count: number;
            };
        }[];
    }>;
    banUser(adminId: number, userId: number, dto: BanUserDto): Promise<{
        status: string;
    }>;
    unbanUser(adminId: number, userId: number, dto: UnbanUserDto): Promise<{
        status: string;
    }>;
    private generateInviteCode;
}
