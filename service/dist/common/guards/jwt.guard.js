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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminJwtGuard = exports.UserJwtGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let UserJwtGuard = class UserJwtGuard {
    jwt;
    config;
    constructor(jwt, config) {
        this.jwt = jwt;
        this.config = config;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const auth = request.headers.authorization;
        if (!auth?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException({ status: 'error', message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        try {
            const payload = this.jwt.verify(auth.slice(7), {
                secret: this.config.get('JWT_SECRET'),
            });
            if (payload.type !== 'user') {
                throw new common_1.UnauthorizedException();
            }
            request.user = payload;
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException({ status: 'error', message: 'Invalid token', code: 'INVALID_TOKEN' });
        }
    }
};
exports.UserJwtGuard = UserJwtGuard;
exports.UserJwtGuard = UserJwtGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], UserJwtGuard);
let AdminJwtGuard = class AdminJwtGuard {
    jwt;
    config;
    constructor(jwt, config) {
        this.jwt = jwt;
        this.config = config;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const auth = request.headers.authorization;
        if (!auth?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException({ status: 'error', message: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        try {
            const secret = this.config.get('JWT_ADMIN_SECRET') || this.config.get('JWT_SECRET');
            const payload = this.jwt.verify(auth.slice(7), { secret });
            if (payload.type !== 'admin') {
                throw new common_1.UnauthorizedException();
            }
            request.admin = payload;
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException({ status: 'error', message: 'Invalid token', code: 'INVALID_TOKEN' });
        }
    }
};
exports.AdminJwtGuard = AdminJwtGuard;
exports.AdminJwtGuard = AdminJwtGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], AdminJwtGuard);
//# sourceMappingURL=jwt.guard.js.map