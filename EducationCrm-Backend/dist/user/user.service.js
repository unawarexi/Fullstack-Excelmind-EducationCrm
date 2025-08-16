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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const prisma_1 = require("../../generated/prisma");
const bcrypt = require("bcrypt");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(currentUserId, currentUserRole) {
        if (currentUserRole === prisma_1.Role.ADMIN) {
            return this.prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            courses: true,
                            enrollments: true,
                            assignments: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        }
        if (currentUserRole === prisma_1.Role.LECTURER) {
            const lecturer = await this.prisma.user.findUnique({
                where: { id: currentUserId },
                include: {
                    courses: {
                        include: {
                            enrollments: {
                                where: { status: "APPROVED" },
                                include: {
                                    student: {
                                        select: {
                                            id: true,
                                            email: true,
                                            role: true,
                                            createdAt: true,
                                            updatedAt: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            const students = lecturer?.courses.flatMap((course) => course.enrollments.map((enrollment) => enrollment.student)) || [];
            const uniqueStudents = students.filter((student, index, self) => index === self.findIndex((s) => s.id === student.id));
            return uniqueStudents;
        }
        return this.findOne(currentUserId, currentUserId, currentUserRole);
    }
    async findOne(id, currentUserId, currentUserRole) {
        if (currentUserRole !== prisma_1.Role.ADMIN && currentUserId !== id) {
            if (currentUserRole === prisma_1.Role.LECTURER) {
                const isStudentInCourses = await this.prisma.enrollment.findFirst({
                    where: {
                        studentId: id,
                        status: "APPROVED",
                        course: { lecturerId: currentUserId },
                    },
                });
                if (!isStudentInCourses) {
                    throw new common_1.ForbiddenException("You can only view students enrolled in your courses");
                }
            }
            else {
                throw new common_1.ForbiddenException("You can only view your own profile");
            }
        }
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                courses: {
                    select: {
                        id: true,
                        title: true,
                        credits: true,
                        createdAt: true,
                        _count: {
                            select: {
                                enrollments: true,
                                assignments: true,
                            },
                        },
                    },
                },
                enrollments: {
                    select: {
                        id: true,
                        status: true,
                        enrolledAt: true,
                        course: {
                            select: {
                                id: true,
                                title: true,
                                credits: true,
                                lecturer: {
                                    select: {
                                        id: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
                assignments: {
                    select: {
                        id: true,
                        title: true,
                        grade: true,
                        weight: true,
                        dueDate: true,
                        submittedAt: true,
                        course: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        return user;
    }
    async create(dto, currentUserRole) {
        if (currentUserRole !== prisma_1.Role.ADMIN) {
            throw new common_1.ForbiddenException("Only administrators can create users");
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException("User with this email already exists");
        }
        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: hashedPassword,
                role: dto.role || prisma_1.Role.STUDENT,
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async update(id, dto, currentUserId, currentUserRole) {
        if (currentUserRole !== prisma_1.Role.ADMIN && currentUserId !== id) {
            throw new common_1.ForbiddenException("You can only update your own profile");
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException("User not found");
        }
        if (dto.email && dto.email !== existingUser.email) {
            const emailExists = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (emailExists) {
                throw new common_1.BadRequestException("User with this email already exists");
            }
        }
        if (dto.role && currentUserRole !== prisma_1.Role.ADMIN) {
            throw new common_1.ForbiddenException("Only administrators can change user roles");
        }
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                ...(dto.email && { email: dto.email }),
                ...(dto.role && { role: dto.role }),
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async updatePassword(id, dto, currentUserId, currentUserRole) {
        if (currentUserRole !== prisma_1.Role.ADMIN && currentUserId !== id) {
            throw new common_1.ForbiddenException("You can only update your own password");
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException("User not found");
        }
        if (currentUserRole !== prisma_1.Role.ADMIN) {
            const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, existingUser.passwordHash);
            if (!isCurrentPasswordValid) {
                throw new common_1.BadRequestException("Current password is incorrect");
            }
        }
        const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id },
            data: { passwordHash: hashedPassword },
        });
        return { message: "Password updated successfully" };
    }
    async remove(id, currentUserRole) {
        if (currentUserRole !== prisma_1.Role.ADMIN) {
            throw new common_1.ForbiddenException("Only administrators can delete users");
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException("User not found");
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: "User deleted successfully" };
    }
    async getUserStats(id, currentUserId, currentUserRole) {
        if (currentUserRole !== prisma_1.Role.ADMIN && currentUserId !== id) {
            if (currentUserRole === prisma_1.Role.LECTURER) {
                const isStudentInCourses = await this.prisma.enrollment.findFirst({
                    where: {
                        studentId: id,
                        status: "APPROVED",
                        course: { lecturerId: currentUserId },
                    },
                });
                if (!isStudentInCourses) {
                    throw new common_1.ForbiddenException("You can only view stats for students enrolled in your courses");
                }
            }
            else {
                throw new common_1.ForbiddenException("You can only view your own stats");
            }
        }
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        courses: true,
                        enrollments: true,
                        assignments: true,
                    },
                },
                assignments: {
                    where: {
                        grade: { not: null },
                    },
                    select: {
                        grade: true,
                        weight: true,
                    },
                },
                enrollments: {
                    where: { status: "APPROVED" },
                    include: {
                        course: {
                            select: {
                                credits: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        let weightedGrade = 0;
        let totalWeight = 0;
        user.assignments.forEach((assignment) => {
            if (assignment.grade !== null) {
                weightedGrade += assignment.grade * assignment.weight;
                totalWeight += assignment.weight;
            }
        });
        const averageGrade = totalWeight > 0 ? Math.round(weightedGrade / totalWeight) : null;
        const totalCredits = user.enrollments.reduce((sum, enrollment) => sum + enrollment.course.credits, 0);
        return {
            totalCourses: user._count.courses,
            totalEnrollments: user._count.enrollments,
            totalAssignments: user._count.assignments,
            averageGrade,
            totalCredits,
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map