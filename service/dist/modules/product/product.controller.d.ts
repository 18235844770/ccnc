import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, PageQueryDto } from '../../common/dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    list(): Promise<{
        status: string;
        data: {
            id: number;
            name: string;
            description: string | undefined;
            yield_rate: number;
            cycle_days: number;
            min_amount: number;
            max_amount: number | undefined;
            status: string;
            rule_version: string | undefined;
            created_at: string;
            updated_at: string;
        }[];
    }>;
    detail(id: number): Promise<{
        status: string;
        data: {
            id: number;
            name: string;
            description: string | undefined;
            yield_rate: number;
            cycle_days: number;
            min_amount: number;
            max_amount: number | undefined;
            status: string;
            rule_version: string | undefined;
            created_at: string;
            updated_at: string;
        };
    }>;
}
export declare class AdminProductController {
    private readonly productService;
    constructor(productService: ProductService);
    list(query: PageQueryDto & {
        status?: string;
    }): Promise<{
        status: string;
        data: {
            total: number;
            records: {
                id: number;
                name: string;
                description: string | undefined;
                yield_rate: number;
                cycle_days: number;
                min_amount: number;
                max_amount: number | undefined;
                status: string;
                rule_version: string | undefined;
                created_at: string;
                updated_at: string;
            }[];
        };
    }>;
    create(dto: CreateProductDto): Promise<{
        status: string;
        data: {
            id: number;
            name: string;
            description: string | undefined;
            yield_rate: number;
            cycle_days: number;
            min_amount: number;
            max_amount: number | undefined;
            status: string;
            rule_version: string | undefined;
            created_at: string;
            updated_at: string;
        };
    }>;
    update(id: number, dto: UpdateProductDto): Promise<{
        status: string;
        data: {
            id: number;
            name: string;
            description: string | undefined;
            yield_rate: number;
            cycle_days: number;
            min_amount: number;
            max_amount: number | undefined;
            status: string;
            rule_version: string | undefined;
            created_at: string;
            updated_at: string;
        };
    }>;
    remove(id: number): Promise<{
        status: string;
        message: string;
    }>;
}
