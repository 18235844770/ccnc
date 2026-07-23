import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OrderSettlementService } from './order-settlement.service';
import { CommissionSettlementService } from './commission-settlement.service';
import { JobLockService } from './job-lock.service';
import { CommissionModule } from '../modules/commission/commission.module';

@Module({
  imports: [ScheduleModule.forRoot(), CommissionModule],
  providers: [OrderSettlementService, CommissionSettlementService, JobLockService],
  exports: [OrderSettlementService, CommissionSettlementService, JobLockService],
})
export class JobsModule {}
