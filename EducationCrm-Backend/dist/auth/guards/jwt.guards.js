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
var JwtAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth.service");
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard {
    authService;
    logger = new common_1.Logger(JwtAuthGuard_1.name);
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (!token) {
            this.logger.warn("No token provided in request");
            throw new common_1.UnauthorizedException("Authentication required");
        }
        try {
            const decoded = await this.authService.validateToken(token);
            request.user = {
                id: decoded.sub,
                email: decoded.email,
                role: decoded.role,
            };
            return true;
        }
        catch (error) {
            this.logger.warn(`Token validation failed: ${error.message}`);
            throw new common_1.UnauthorizedException("Invalid or expired token");
        }
    }
    extractToken(request) {
        const cookieToken = request.cookies?.jwt;
        if (cookieToken) {
            return cookieToken;
        }
        const authHeader = request.headers?.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], JwtAuthGuard);
//# sourceMappingURL=jwt.guards.js.map