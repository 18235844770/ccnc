"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const order_settlement_service_1 = require("./order-settlement.service");
const commission_settlement_service_1 = require("./commission-settlement.service");
const job_lock_service_1 = require("./job-lock.service");
const commission_module_1 = require("../modules/commission/commission.module");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot(), commission_module_1.CommissionModule],
        providers: [order_settlement_service_1.OrderSettlementService, commission_settlement_service_1.CommissionSettlementService, job_lock_service_1.JobLockService],
        exports: [order_settlement_service_1.OrderSettlementService, commission_settlement_service_1.CommissionSettlementService, job_lock_service_1.JobLockService],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map