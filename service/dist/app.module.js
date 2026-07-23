"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const health_module_1 = require("./modules/health/health.module");
const user_module_1 = require("./modules/user/user.module");
const product_module_1 = require("./modules/product/product.module");
const content_module_1 = require("./modules/content/content.module");
const admin_module_1 = require("./modules/admin/admin.module");
const order_module_1 = require("./modules/order/order.module");
const promotion_module_1 = require("./modules/promotion/promotion.module");
const wallet_module_1 = require("./modules/wallet/wallet.module");
const commission_module_1 = require("./modules/commission/commission.module");
const jobs_module_1 = require("./jobs/jobs.module");
const queue_module_1 = require("./queue/queue.module");
const stats_module_1 = require("./modules/stats/stats.module");
const risk_module_1 = require("./modules/risk/risk.module");
const system_module_1 = require("./modules/system/system.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            user_module_1.UserModule,
            product_module_1.ProductModule,
            content_module_1.ContentModule,
            admin_module_1.AdminModule,
            queue_module_1.QueueModule,
            order_module_1.OrderModule,
            promotion_module_1.PromotionModule,
            wallet_module_1.WalletModule,
            commission_module_1.CommissionModule,
            stats_module_1.StatsModule,
            risk_module_1.RiskModule,
            system_module_1.SystemModule,
            jobs_module_1.JobsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map