import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private enabled = false;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('REDIS_URL');
    if (!url) {
      this.logger.warn('REDIS_URL not set, Redis features disabled');
      return;
    }
    try {
      this.client = new Redis(url, {
        maxRetriesPerRequest: null,
        lazyConnect: true,
      });
      this.client.on('error', (err) => this.logger.warn(`Redis error: ${err.message}`));
      this.enabled = true;
    } catch (e) {
      this.logger.warn(`Redis init failed: ${e}`);
    }
  }

  isEnabled() {
    return this.enabled && !!this.client;
  }

  async connect() {
    if (!this.client) return false;
    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }
      await this.client.ping();
      return true;
    } catch (e) {
      this.logger.warn(`Redis connect failed: ${e}`);
      this.enabled = false;
      return false;
    }
  }

  getClient() {
    return this.client;
  }

  duplicate() {
    return this.client?.duplicate() ?? null;
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => undefined);
    }
  }
}
