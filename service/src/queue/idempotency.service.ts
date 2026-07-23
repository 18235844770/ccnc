import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class IdempotencyService {
  constructor(private readonly redis: RedisService) {}

  async checkAndSet(key: string, ttlSeconds = 86400): Promise<boolean> {
    if (!this.redis.isEnabled()) return true;
    const client = this.redis.getClient();
    if (!client) return true;
    await this.redis.connect();
    const redisKey = `idempotency:${key}`;
    const result = await client.set(redisKey, '1', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }
}
