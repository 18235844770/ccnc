"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
const idempotency_service_1 = require("./idempotency.service");
const queue_service_1 = require("./queue.service");
const commission_module_1 = require("../modules/commission/commission.module");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => commission_module_1.CommissionModule)],
        providers: [redis_service_1.RedisService, idempotency_service_1.IdempotencyService, queue_service_1.QueueService],
        exports: [redis_service_1.RedisService, idempotency_service_1.IdempotencyService, queue_service_1.QueueService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map