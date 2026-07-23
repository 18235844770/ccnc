import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from '../../common/dto';
export declare class ProductService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listPublic(): Promise<{
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
    }[]>;
    getPublic(id: number): Promise<{
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
    }>;
    listAdmin(params: {
        page?: number;
        page_size?: number;
        status?: string;
    }): Promise<{
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
    }>;
    create(dto: CreateProductDto): Promise<{
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
    }>;
    update(id: number, dto: UpdateProductDto): Promise<{
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
    }>;
    remove(id: number): Promise<{
        status: string;
        message: string;
    }>;
}
