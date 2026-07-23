import { PrismaService } from '../../prisma/prisma.service';
export declare class BannerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listForDisplay(): Promise<{
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
    }[]>;
    listAdmin(params: {
        page?: number;
        page_size?: number;
        status?: string;
    }): Promise<{
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
    }>;
    getAdmin(id: number): Promise<{
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
    }>;
    createAdmin(dto: {
        title: string;
        image_url: string;
        link_url?: string;
        status?: string;
        sort_order?: number;
        start_time?: string;
        end_time?: string;
    }): Promise<{
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
    }>;
    updateAdmin(id: number, dto: {
        title?: string;
        image_url?: string;
        link_url?: string;
        status?: string;
        sort_order?: number;
        start_time?: string;
        end_time?: string;
    }): Promise<{
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
    }>;
    deleteAdmin(id: number): Promise<{
        status: string;
    }>;
}
