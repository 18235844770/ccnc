"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const user_service_1 = require("./user.service");
const user_controller_1 = require("./user.controller");
const auth_token_service_1 = require("../auth/auth-token.service");
const promotion_module_1 = require("../promotion/promotion.module");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            promotion_module_1.PromotionModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET'),
                    signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '7d') },
                }),
            }),
        ],
        controllers: [user_controller_1.AuthController, user_controller_1.UserController, user_controller_1.AdminUserController],
        providers: [user_service_1.UserService, auth_token_service_1.AuthTokenService],
        exports: [user_service_1.UserService, auth_token_service_1.AuthTokenService],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map