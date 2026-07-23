import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private client;
    private enabled;
    constructor(config: ConfigService);
    isEnabled(): boolean;
    connect(): Promise<boolean>;
    getClient(): Redis | null;
    duplicate(): Redis | null;
    onModuleDestroy(): Promise<void>;
}
