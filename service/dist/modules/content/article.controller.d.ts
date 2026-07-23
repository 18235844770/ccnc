import { ArticleService } from './article.service';
import { CreateArticleDto, PageQueryDto, UpdateArticleDto } from '../../common/dto';
export declare class ArticleController {
    private readonly articleService;
    constructor(articleService: ArticleService);
    list(query: PageQueryDto): Promise<{
        status: string;
        data: {
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
        };
    }>;
    detail(id: number): Promise<{
        status: string;
        data: {
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
        };
    }>;
}
export declare class AdminArticleController {
    private readonly articleService;
    constructor(articleService: ArticleService);
    list(query: PageQueryDto & {
        status?: string;
    }): Promise<{
        status: string;
        data: {
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
        };
    }>;
    detail(id: number): Promise<{
        status: string;
        data: {
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
        };
    }>;
    create(dto: CreateArticleDto): Promise<{
        status: string;
        data: {
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
        };
    }>;
    update(id: number, dto: UpdateArticleDto): Promise<{
        status: string;
        data: {
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
        };
    }>;
    remove(id: number): Promise<{
        status: string;
        data: {
            status: string;
        };
    }>;
}
