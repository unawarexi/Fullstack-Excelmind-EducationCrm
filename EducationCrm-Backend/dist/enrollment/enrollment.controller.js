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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentController = void 0;
const common_1 = require("@nestjs/common");
const enrollment_service_1 = require("./enrollment.service");
const dto_1 = require("./dto");
const jwt_guards_1 = require("../auth/guards/jwt.guards");
const prisma_1 = require("../../../EducationCrm-Backend/generated/prisma");
let EnrollmentController = class EnrollmentController {
    enrollmentService;
    constructor(enrollmentService) {
        this.enrollmentService = enrollmentService;
    }
    async create(createEnrollmentDto, req) {
        return this.enrollmentService.create(createEnrollmentDto, req.user.id, req.user.role);
    }
    async findAll(req, courseId, studentId, status) {
        return this.enrollmentService.findAll(req.user.id, req.user.role, courseId, studentId, status);
    }
    async getEnrollmentStats(req) {
        return this.enrollmentService.getEnrollmentStats(req.user.id, req.user.role);
    }
    async findOne(id, req) {
        return this.enrollmentService.findOne(id, req.user.id, req.user.role);
    }
    async update(id, updateEnrollmentDto, req) {
        return this.enrollmentService.update(id, updateEnrollmentDto, req.user.id, req.user.role);
    }
    async remove(id, req) {
        return this.enrollmentService.remove(id, req.user.id, req.user.role);
    }
};
exports.EnrollmentController = EnrollmentController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateEnrollmentDto, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)("courseId")),
    __param(2, (0, common_1.Query)("studentId")),
    __param(3, (0, common_1.Query)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("stats"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "getEnrollmentStats", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateEnrollmentDto, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "remove", null);
exports.EnrollmentController = EnrollmentController = __decorate([
    (0, common_1.Controller)("enrollment"),
    (0, common_1.UseGuards)(jwt_guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [enrollment_service_1.EnrollmentService])
], EnrollmentController);
//# sourceMappingURL=enrollment.controller.js.map