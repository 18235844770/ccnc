import { PrismaService } from '../../prisma/prisma.service';
export declare class ArticleService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listPublic(params: {
        page?: number;
        page_size?: number;
    }): Promise<{
        total: number;
        records: ({
            id: number;
            title: string;
            tags: string | undefined;
            description: string | undefined;
            cover_image: string | undefined;
            status: string;
            sort_order: number;
            view_count: number;
            publish_time: string | undefined;
            created_at: string;
            updated_at: string;
        } | {
            content: string;
            id: number;
            title: string;
            tags: string | undefined;
            description: string | undefined;
            cover_image: string | undefined;
            status: string;
            sort_order: number;
            view_count: number;
            publish_time: string | undefined;
            created_at: string;
            updated_at: string;
        })[];
    }>;
    getPublic(id: number): Promise<{
        id: number;
        title: string;
        tags: string | undefined;
        description: string | undefined;
        cover_image: string | undefined;
        status: string;
        sort_order: number;
        view_count: number;
        publish_time: string | undefined;
        created_at: string;
        updated_at: string;
    } | {
        content: string;
        id: number;
        title: string;
        tags: string | undefined;
        description: string | undefined;
        cover_image: string | undefined;
        status: string;
        sort_order: number;
        view_count: number;
        publish_time: string | undefined;
        created_at: string;
        updated_at: string;
    }>;
    listAdmin(params: {
        page?: number;
        page_size?: number;
        status?: string;
    }): Promise<{
        total: number;
        records: ({
            id: number;
            title: string;
            tags: string | undefined;
            description: string | undefined;
            cover_image: string | undefined;
            status: string;
            sort_order: number;
            view_count: number;
            publish_time: string | undefined;
            created_at: string;
            updated_at: string;
        } | {
            content: string;
            id: number;
            title: string;
            tags: string | undefined;
            description: string | undefined;
            cover_image: string | undefined;
            status: string;
            sort_order: number;
            view_count: number;
            publish_time: string | undefined;
            created_at: string;
            updated_at: string;
        })[];
    }>;
    getAdmin(id: number): Promise<{
        id: number;
        title: string;
        tags: string | undefined;
        description: string | undefined;
        cover_image: string | undefined;
        status: string;
        sort_order: number;
        view_count: number;
        publish_time: string | undefined;
        created_at: string;
        updated_at: string;
    } | {
        content: string;
        id: number;
        title: string;
        tags: string | undefined;
        description: string | undefined;
        cover_image: string | undefined;
        status: string;
        sort_order: number;
        view_count: number;
        publish_time: string | undefined;
        created_at: string;
        updated_at: string;
    }>;
    createAdmin(dto: {
        title: string;
        tags?: string;
        description?: string;
        publish_time?: string;
        cover_image?: string;
        content?: string;
        status?: string;
        sort_order?: number;
    }): Promise<{
        id: number;
        title: string;
        tags: string | undefined;
        description: string | undefined;
        cover_image: string | undefined;
        status: string;
        sort_order: number;
        view_count: number;
        publish_time: string | undefined;
        created_at: string;
        updated_at: string;
    } | {
        content: string;
        id: number;
        title: string;
        tags: string | undefined;
        description: string | undefined;
        cover_image: string | undefined;
        status: string;
        sort_order: number;
        view_count: number;
        publish_time: string | undefined;
        created_at: string;
        updated_at: string;
    }>;
    updateAdmin(id: number, dto: {
        title?: string;
        tags?: string;
        description?: string;
        publish_time?: string;
        cover_image?: string;
        content?: string;
        status?: string;
        sort_order?: number;
    }): Promise<{
        id: number;
        title: string;
        tags: string | undefined;
        description: string | undefined;
        cover_image: string | undefined;
        status: string;
        sort_order: number;
        view_count: number;
        publish_time: string | undefined;
        created_at: string;
        updated_at: string;
    } | {
        content: string;
        id: number;
        title: string;
        tags: string | undefined;
        description: string | undefined;
        cover_image: string | undefined;
        status: string;
        sort_order: number;
        view_count: number;
        publish_time: string | undefined;
        created_at: string;
        updated_at: string;
    }>;
    deleteAdmin(id: number): Promise<{
        status: string;
    }>;
}
