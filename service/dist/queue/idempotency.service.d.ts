import { RedisService } from './redis.service';
export declare class IdempotencyService {
    private readonly redis;
    constructor(redis: RedisService);
    checkAndSet(key: string, ttlSeconds?: number): Promise<boolean>;
}
