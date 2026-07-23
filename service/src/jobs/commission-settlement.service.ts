import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CommissionService } from '../modules/commission/commission.service';
import { JobLockService } from './job-lock.service';

const LOCK_KEY = 'job:commission-settlement';
const LOCK_TTL = 280;

@Injectable()
export class CommissionSettlementService {
  private readonly logger = new Logger(CommissionSettlementService.name);

  constructor(
    private readonly commissionService: CommissionService,
    private readonly jobLock: JobLockService,
  ) {}

  /** 每 5 分钟：待结算 → 已结算 → 发放入账 */
  @Cron('*/5 * * * *')
  async handleCommissionSettlementCron() {
    await this.jobLock.runWithLock(LOCK_KEY, LOCK_TTL, () => this.runSettlementCycle());
  }

  async runSettlementCycle() {
    const result = await this.commissionService.runSettlementCycle();
    if (result.settled > 0 || result.paid > 0) {
      this.logger.log(`Commission cycle: settled=${result.settled}, paid=${result.paid}`);
    }
    return result;
  }
}
