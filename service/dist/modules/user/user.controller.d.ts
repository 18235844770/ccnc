import { UserService } from './user.service';
import { PromotionService } from '../promotion/promotion.service';
import { RegisterDto, LoginDto, PageQueryDto, RealnameAuthDto, BanUserDto, UnbanUserDto, AdjustPromoDto, UpdateProfileDto } from '../../common/dto';
import { AuthTokenService } from '../auth/auth-token.service';
import { UserJwtPayload, AdminJwtPayload } from '../auth/auth-token.service';
export declare class AuthController {
    private readonly userService;
    private readonly authToken;
    constructor(userService: UserService, authToken: AuthTokenService);
    register(dto: RegisterDto): Promise<{
        status: string;
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        status: string;
        token: string;
    }>;
}
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    me(user: UserJwtPayload): Promise<{
        status: string;
        data: {
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
        };
    }>;
    updateMe(user: UserJwtPayload, dto: UpdateProfileDto): Promise<{
        status: string;
        data: {
            id: number;
            username: string;
            email: string | undefined;
            phone_number: string | undefined;
            avatar_url: string | undefined;
            status: string;
            created_at: string;
            updated_at: string;
        };
    }>;
    realnameAuth(user: UserJwtPayload, dto: RealnameAuthDto): Promise<{
        status: string;
        data: {
            auth_status: string;
            real_name: string;
        };
    }>;
    getRealname(user: UserJwtPayload): Promise<{
        status: string;
        data: {
            auth_status: string;
            real_name?: undefined;
            created_at?: undefined;
        } | {
            auth_status: string;
            real_name: string | undefined;
            created_at: string;
        };
    }>;
}
export declare class AdminUserController {
    private readonly userService;
    private readonly promotionService;
    constructor(userService: UserService, promotionService: PromotionService);
    list(query: PageQueryDto & {
        username?: string;
        keyword?: string;
        user_id?: number;
        status?: string;
    }): Promise<{
        status: string;
        data: {
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
        };
    }>;
    detail(id: number): Promise<{
        status: string;
        data: {
            user: {
                user_id: number;
                username: string;
                phone_number: string | undefined;
                email: string | undefined;
                status: string;
                created_at: string;
                promo_summary: Record<string, number>;
            };
            uplines: {
                user_id: number;
                username: string;
            }[];
            downlines: Record<string, {
                user_id: number;
                username: string;
            }[]>;
        };
    }>;
    downlines(id: number, query: PageQueryDto & {
        level?: number;
    }): Promise<{
        status: string;
        data: {
            total: number;
            records: {
                user_id: number;
                username: string;
                level: number;
                promo_level: number;
                invest_amount: number;
                order_count: number;
                joined_at: string;
            }[];
        };
    }>;
    ban(admin: AdminJwtPayload, id: number, dto: BanUserDto): Promise<{
        status: string;
        message: string;
    }>;
    unban(admin: AdminJwtPayload, id: number, dto: UnbanUserDto): Promise<{
        status: string;
        message: string;
    }>;
    adjustPromo(admin: AdminJwtPayload, id: number, dto: AdjustPromoDto): Promise<{
        status: string;
        message: string;
    }>;
}
