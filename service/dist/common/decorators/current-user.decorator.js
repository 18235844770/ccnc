"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentAdmin = exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    return ctx.switchToHttp().getRequest().user;
});
exports.CurrentAdmin = (0, common_1.createParamDecorator)((_data, ctx) => {
    return ctx.switchToHttp().getRequest().admin;
});
//# sourceMappingURL=current-user.decorator.js.map