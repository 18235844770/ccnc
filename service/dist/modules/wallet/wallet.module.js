"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const wallet_service_1 = require("./wallet.service");
const recharge_service_1 = require("./recharge.service");
const wallet_controller_1 = require("./wallet.controller");
const recharge_controller_1 = require("./recharge.controller");
const admin_wallet_controller_1 = require("./admin-wallet.controller");
let WalletModule = class WalletModule {
};
exports.WalletModule = WalletModule;
exports.WalletModule = WalletModule = __decorate([
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
        controllers: [wallet_controller_1.WalletController, recharge_controller_1.RechargeController, admin_wallet_controller_1.AdminWalletController],
        providers: [wallet_service_1.WalletService, recharge_service_1.RechargeService],
        exports: [wallet_service_1.WalletService, recharge_service_1.RechargeService],
    })
], WalletModule);
//# sourceMappingURL=wallet.module.js.map