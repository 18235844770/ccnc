import { BannerService } from './banner.service';
import { CreateBannerDto, PageQueryDto, UpdateBannerDto } from '../../common/dto';
export declare class BannerController {
    private readonly bannerService;
    constructor(bannerService: BannerService);
    list(): Promise<{
        status: string;
        data: {
            id: number;
            title: string;
            image_url: string;
            link_url: string | undefined;
            status: string;
            sort_order: number;
            start_time: string | undefined;
            end_time: string | undefined;
            created_at: string;
            updated_at: string;
        }[];
    }>;
}
export declare class AdminBannerController {
    private readonly bannerService;
    constructor(bannerService: BannerService);
    list(query: PageQueryDto & {
        status?: string;
    }): Promise<{
        status: string;
        data: {
            total: number;
            records: {
                id: number;
                title: string;
                image_url: string;
                link_url: string | undefined;
                status: string;
                sort_order: number;
                start_time: string | undefined;
                end_time: string | undefined;
                created_at: string;
                updated_at: string;
            }[];
        };
    }>;
    detail(id: number): Promise<{
        status: string;
        data: {
            id: number;
            title: string;
            image_url: string;
            link_url: string | undefined;
            status: string;
            sort_order: number;
            start_time: string | undefined;
            end_time: string | undefined;
            created_at: string;
            updated_at: string;
        };
    }>;
    create(dto: CreateBannerDto): Promise<{
        status: string;
        data: {
            id: number;
            title: string;
            image_url: string;
            link_url: string | undefined;
            status: string;
            sort_order: number;
            start_time: string | undefined;
            end_time: string | undefined;
            created_at: string;
            updated_at: string;
        };
    }>;
    update(id: number, dto: UpdateBannerDto): Promise<{
        status: string;
        data: {
            id: number;
            title: string;
            image_url: string;
            link_url: string | undefined;
            status: string;
            sort_order: number;
            start_time: string | undefined;
            end_time: string | undefined;
            created_at: string;
            updated_at: string;
        };
    }>;
    remove(id: number): Promise<{
        status: string;
        data: {
            status: string;
        };
    }>;
}
