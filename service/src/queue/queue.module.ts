import { Module, forwardRef } from '@nestjs/common';
import { RedisService } from './redis.service';
import { IdempotencyService } from './idempotency.service';
import { QueueService } from './queue.service';
import { CommissionModule } from '../modules/commission/commission.module';

@Module({
  imports: [forwardRef(() => CommissionModule)],
  providers: [RedisService, IdempotencyService, QueueService],
  exports: [RedisService, IdempotencyService, QueueService],
})
export class QueueModule {}
