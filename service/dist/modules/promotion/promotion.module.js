"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const promotion_service_1 = require("./promotion.service");
const promotion_controller_1 = require("./promotion.controller");
const admin_promotion_controller_1 = require("./admin-promotion.controller");
const invite_progress_service_1 = require("./invite-progress.service");
let PromotionModule = class PromotionModule {
};
exports.PromotionModule = PromotionModule;
exports.PromotionModule = PromotionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET'),
                    signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '7d') },
                }),
            }),
        ],
        controllers: [promotion_controller_1.PromotionController, admin_promotion_controller_1.AdminPromotionController],
        providers: [promotion_service_1.PromotionService, invite_progress_service_1.InviteProgressService],
        exports: [promotion_service_1.PromotionService, invite_progress_service_1.InviteProgressService],
    })
], PromotionModule);
//# sourceMappingURL=promotion.module.js.map