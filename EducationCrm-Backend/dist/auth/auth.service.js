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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(dto) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existingUser) {
                throw new common_1.ConflictException("User with this email already exists");
            }
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(dto.password, saltRounds);
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    passwordHash: hashedPassword,
                    role: dto.role,
                },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            });
            this.logger.log(`User registered successfully: ${user.email}`);
            return {
                message: "User registered successfully",
                user,
            };
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            if (error.code === "P2002") {
                throw new common_1.ConflictException("Email already exists");
            }
            this.logger.error(`Registration failed: ${error.message}`);
            throw error;
        }
    }
    async login(email, password) {
        try {
            this.logger.log(`Login attempt for email: ${email}`);
            const user = await this.prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    passwordHash: true,
                    role: true,
                },
            });
            if (!user) {
                this.logger.warn(`Login failed - user not found: ${email}`);
                throw new common_1.UnauthorizedException("Invalid credentials");
            }
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                this.logger.warn(`Login failed - invalid password: ${email}`);
                throw new common_1.UnauthorizedException("Invalid credentials");
            }
            const payload = {
                sub: user.id,
                email: user.email,
                role: user.role,
            };
            const token = this.jwtService.sign(payload);
            this.logger.log(`Login successful for email: ${email}`);
            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Login error: ${error.message}`);
            throw new common_1.UnauthorizedException("Authentication failed");
        }
    }
    async logout(token) {
        try {
            const decoded = this.jwtService.verify(token);
            this.logger.log(`User logged out: ${decoded.email}`);
            return { message: "Logout successful" };
        }
        catch (error) {
            this.logger.warn(`Logout with invalid token attempted`);
            return { message: "Logout successful" };
        }
    }
    async validateToken(token) {
        try {
            const decoded = this.jwtService.verify(token);
            return decoded;
        }
        catch (error) {
            throw new common_1.UnauthorizedException("Invalid token");
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map