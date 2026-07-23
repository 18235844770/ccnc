import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'bullmq';
import { CommissionService } from '../modules/commission/commission.service';

export const ORDER_EVENTS_QUEUE = 'order-events';

function parseRedisConnection(redisUrl: string) {
  const url = new URL(redisUrl);
  return {
    host: url.hostname,
    port: Number(url.port) || 6379,
    maxRetriesPerRequest: null as null,
  };
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private connection: ReturnType<typeof parseRedisConnection> | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly commissionService: CommissionService,
  ) {}

  async onModuleInit() {
    const redisUrl = this.config.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not set, queue disabled');
      return;
    }

    try {
      this.connection = parseRedisConnection(redisUrl);
      this.queue = new Queue(ORDER_EVENTS_QUEUE, { connection: this.connection });
      this.worker = new Worker(
        ORDER_EVENTS_QUEUE,
        async (job) => {
          if (job.name === 'order.paid') {
            const orderId = Number(job.data.orderId);
            await this.commissionService.calculateForOrder(orderId);
          }
        },
        { connection: { ...this.connection }, concurrency: 2 },
      );

      this.worker.on('failed', (job, err) => {
        this.logger.error(`Job ${job?.id} failed: ${err.message}`);
      });

      this.logger.log('BullMQ order-events worker started');
    } catch (e) {
      this.logger.warn(`Queue init failed: ${e}`);
      this.queue = null;
      this.worker = null;
    }
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.queue?.close();
  }

  async enqueueOrderPaid(orderId: number) {
    if (!this.queue) {
      return this.commissionService.calculateForOrder(orderId);
    }
    await this.queue.add(
      'order.paid',
      { orderId },
      { jobId: `order-paid-${orderId}`, removeOnComplete: 100, attempts: 3 },
    );
    return { queued: true };
  }
}
