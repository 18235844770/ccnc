import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class JobLockService implements OnModuleDestroy {
  private readonly logger = new Logger(JobLockService.name);
  private readonly redis: Redis | null;
  private readonly localLocks = new Set<string>();

  constructor(private readonly config: ConfigService) {
    const redisUrl = this.config.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.redis = null;
      this.logger.warn('REDIS_URL not set, job locks use in-process fallback');
      return;
    }
    try {
      this.redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
      this.redis.connect().catch((err) => {
        this.logger.warn(`Redis lock connect failed: ${err.message}`);
      });
    } catch (e) {
      this.logger.warn(`Redis lock init failed: ${e}`);
      this.redis = null;
    }
  }

  async onModuleDestroy() {
    await this.redis?.quit();
  }

  async runWithLock<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T | null> {
    const acquired = await this.acquire(key, ttlSeconds);
    if (!acquired) {
      this.logger.debug(`Skip job ${key}, lock held by another instance`);
      return null;
    }
    const started = Date.now();
    try {
      const result = await fn();
      this.logger.log(`Job ${key} finished in ${Date.now() - started}ms`);
      return result;
    } catch (e) {
      this.logger.error(`Job ${key} failed: ${e}`);
      throw e;
    } finally {
      await this.release(key);
    }
  }

  private async acquire(key: string, ttlSeconds: number): Promise<boolean> {
    if (this.redis?.status === 'ready') {
      const ok = await this.redis.set(key, String(process.pid), 'EX', ttlSeconds, 'NX');
      return ok === 'OK';
    }
    if (this.localLocks.has(key)) return false;
    this.localLocks.add(key);
    return true;
  }

  private async release(key: string) {
    if (this.redis?.status === 'ready') {
      await this.redis.del(key);
      return;
    }
    this.localLocks.delete(key);
  }
}
