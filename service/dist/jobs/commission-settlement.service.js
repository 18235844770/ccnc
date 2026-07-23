"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CommissionSettlementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionSettlementService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const commission_service_1 = require("../modules/commission/commission.service");
const job_lock_service_1 = require("./job-lock.service");
const LOCK_KEY = 'job:commission-settlement';
const LOCK_TTL = 280;
let CommissionSettlementService = CommissionSettlementService_1 = class CommissionSettlementService {
    commissionService;
    jobLock;
    logger = new common_1.Logger(CommissionSettlementService_1.name);
    constructor(commissionService, jobLock) {
        this.commissionService = commissionService;
        this.jobLock = jobLock;
    }
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
};
exports.CommissionSettlementService = CommissionSettlementService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommissionSettlementService.prototype, "handleCommissionSettlementCron", null);
exports.CommissionSettlementService = CommissionSettlementService = CommissionSettlementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [commission_service_1.CommissionService,
        job_lock_service_1.JobLockService])
], CommissionSettlementService);
//# sourceMappingURL=commission-settlement.service.js.map