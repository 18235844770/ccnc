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
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = exports.ORDER_EVENTS_QUEUE = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const commission_service_1 = require("../modules/commission/commission.service");
exports.ORDER_EVENTS_QUEUE = 'order-events';
function parseRedisConnection(redisUrl) {
    const url = new URL(redisUrl);
    return {
        host: url.hostname,
        port: Number(url.port) || 6379,
        maxRetriesPerRequest: null,
    };
}
let QueueService = QueueService_1 = class QueueService {
    config;
    commissionService;
    logger = new common_1.Logger(QueueService_1.name);
    queue = null;
    worker = null;
    connection = null;
    constructor(config, commissionService) {
        this.config = config;
        this.commissionService = commissionService;
    }
    async onModuleInit() {
        const redisUrl = this.config.get('REDIS_URL');
        if (!redisUrl) {
            this.logger.warn('REDIS_URL not set, queue disabled');
            return;
        }
        try {
            this.connection = parseRedisConnection(redisUrl);
            this.queue = new bullmq_1.Queue(exports.ORDER_EVENTS_QUEUE, { connection: this.connection });
            this.worker = new bullmq_1.Worker(exports.ORDER_EVENTS_QUEUE, async (job) => {
                if (job.name === 'order.paid') {
                    const orderId = Number(job.data.orderId);
                    await this.commissionService.calculateForOrder(orderId);
                }
            }, { connection: { ...this.connection }, concurrency: 2 });
            this.worker.on('failed', (job, err) => {
                this.logger.error(`Job ${job?.id} failed: ${err.message}`);
            });
            this.logger.log('BullMQ order-events worker started');
        }
        catch (e) {
            this.logger.warn(`Queue init failed: ${e}`);
            this.queue = null;
            this.worker = null;
        }
    }
    async onModuleDestroy() {
        await this.worker?.close();
        await this.queue?.close();
    }
    async enqueueOrderPaid(orderId) {
        if (!this.queue) {
            return this.commissionService.calculateForOrder(orderId);
        }
        await this.queue.add('order.paid', { orderId }, { jobId: `order-paid-${orderId}`, removeOnComplete: 100, attempts: 3 });
        return { queued: true };
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        commission_service_1.CommissionService])
], QueueService);
//# sourceMappingURL=queue.service.js.map