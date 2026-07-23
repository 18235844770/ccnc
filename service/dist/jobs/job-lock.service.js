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
var JobLockService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobLockService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let JobLockService = JobLockService_1 = class JobLockService {
    config;
    logger = new common_1.Logger(JobLockService_1.name);
    redis;
    localLocks = new Set();
    constructor(config) {
        this.config = config;
        const redisUrl = this.config.get('REDIS_URL');
        if (!redisUrl) {
            this.redis = null;
            this.logger.warn('REDIS_URL not set, job locks use in-process fallback');
            return;
        }
        try {
            this.redis = new ioredis_1.default(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
            this.redis.connect().catch((err) => {
                this.logger.warn(`Redis lock connect failed: ${err.message}`);
            });
        }
        catch (e) {
            this.logger.warn(`Redis lock init failed: ${e}`);
            this.redis = null;
        }
    }
    async onModuleDestroy() {
        await this.redis?.quit();
    }
    async runWithLock(key, ttlSeconds, fn) {
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
        }
        catch (e) {
            this.logger.error(`Job ${key} failed: ${e}`);
            throw e;
        }
        finally {
            await this.release(key);
        }
    }
    async acquire(key, ttlSeconds) {
        if (this.redis?.status === 'ready') {
            const ok = await this.redis.set(key, String(process.pid), 'EX', ttlSeconds, 'NX');
            return ok === 'OK';
        }
        if (this.localLocks.has(key))
            return false;
        this.localLocks.add(key);
        return true;
    }
    async release(key) {
        if (this.redis?.status === 'ready') {
            await this.redis.del(key);
            return;
        }
        this.localLocks.delete(key);
    }
};
exports.JobLockService = JobLockService;
exports.JobLockService = JobLockService = JobLockService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JobLockService);
//# sourceMappingURL=job-lock.service.js.map