import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class JobLockService implements OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private readonly redis;
    private readonly localLocks;
    constructor(config: ConfigService);
    onModuleDestroy(): Promise<void>;
    runWithLock<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T | null>;
    private acquire;
    private release;
}
