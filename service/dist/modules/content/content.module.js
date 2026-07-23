"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const banner_service_1 = require("./banner.service");
const article_service_1 = require("./article.service");
const banner_controller_1 = require("./banner.controller");
const article_controller_1 = require("./article.controller");
let ContentModule = class ContentModule {
};
exports.ContentModule = ContentModule;
exports.ContentModule = ContentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('JWT_ADMIN_SECRET') || config.get('JWT_SECRET'),
                    signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '7d') },
                }),
            }),
        ],
        controllers: [banner_controller_1.BannerController, banner_controller_1.AdminBannerController, article_controller_1.ArticleController, article_controller_1.AdminArticleController],
        providers: [banner_service_1.BannerService, article_service_1.ArticleService],
    })
], ContentModule);
//# sourceMappingURL=content.module.js.map