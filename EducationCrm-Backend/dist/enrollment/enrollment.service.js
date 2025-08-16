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
exports.EnrollmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const prisma_1 = require("../../../EducationCrm-Backend/generated/prisma");
let EnrollmentService = class EnrollmentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createEnrollmentDto, requesterId, requesterRole) {
        const { courseId, studentId, status } = createEnrollmentDto;
        const actualStudentId = studentId || requesterId;
        if (requesterRole === prisma_1.Role.STUDENT && actualStudentId !== requesterId) {
            throw new common_1.ForbiddenException("Students can only enroll themselves");
        }
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: { lecturer: true },
        });
        if (!course) {
            throw new common_1.NotFoundException("Course not found");
        }
        const student = await this.prisma.user.findUnique({
            where: { id: actualStudentId },
        });
        if (!student) {
            throw new common_1.NotFoundException("Student not found");
        }
        if (student.role !== prisma_1.Role.STUDENT) {
            throw new common_1.ConflictException("Only students can be enrolled in courses");
        }
        const existingEnrollment = await this.prisma.enrollment.findUnique({
            where: {
                courseId_studentId: {
                    courseId,
                    studentId: actualStudentId,
                },
            },
        });
        if (existingEnrollment) {
            throw new common_1.ConflictException("Student is already enrolled in this course");
        }
        const enrollment = await this.prisma.enrollment.create({
            data: {
                courseId,
                studentId: actualStudentId,
                status: status || prisma_1.EnrollStatus.PENDING,
            },
            include: {
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
                student: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
        return enrollment;
    }
    async findAll(requesterId, requesterRole, courseId, studentId, status) {
        const where = {};
        if (requesterRole === prisma_1.Role.STUDENT) {
            where.studentId = requesterId;
        }
        else if (requesterRole === prisma_1.Role.LECTURER) {
            where.course = {
                lecturerId: requesterId,
            };
        }
        if (courseId)
            where.courseId = courseId;
        if (studentId && requesterRole !== prisma_1.Role.STUDENT)
            where.studentId = studentId;
        if (status)
            where.status = status;
        const enrollments = await this.prisma.enrollment.findMany({
            where,
            include: {
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
                student: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                enrolledAt: "desc",
            },
        });
        return enrollments;
    }
    async findOne(id, requesterId, requesterRole) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id },
            include: {
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
                student: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException("Enrollment not found");
        }
        if (requesterRole === prisma_1.Role.STUDENT && enrollment.studentId !== requesterId) {
            throw new common_1.ForbiddenException("Students can only access their own enrollments");
        }
        else if (requesterRole === prisma_1.Role.LECTURER && enrollment.course.lecturer.id !== requesterId) {
            throw new common_1.ForbiddenException("Lecturers can only access enrollments for their courses");
        }
        return enrollment;
    }
    async update(id, updateEnrollmentDto, requesterId, requesterRole) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id },
            include: {
                course: {
                    select: {
                        lecturer: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException("Enrollment not found");
        }
        if (requesterRole === prisma_1.Role.STUDENT) {
            throw new common_1.ForbiddenException("Students cannot update enrollment status");
        }
        else if (requesterRole === prisma_1.Role.LECTURER && enrollment.course.lecturer.id !== requesterId) {
            throw new common_1.ForbiddenException("Lecturers can only update enrollments for their courses");
        }
        const updatedEnrollment = await this.prisma.enrollment.update({
            where: { id },
            data: updateEnrollmentDto,
            include: {
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
                student: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
        return updatedEnrollment;
    }
    async remove(id, requesterId, requesterRole) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { id },
            include: {
                course: {
                    select: {
                        lecturer: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
            },
        });
        if (!enrollment) {
            throw new common_1.NotFoundException("Enrollment not found");
        }
        if (requesterRole === prisma_1.Role.STUDENT && enrollment.studentId !== requesterId) {
            throw new common_1.ForbiddenException("Students can only remove their own enrollments");
        }
        else if (requesterRole === prisma_1.Role.LECTURER && enrollment.course.lecturer.id !== requesterId) {
            throw new common_1.ForbiddenException("Lecturers can only remove enrollments for their courses");
        }
        await this.prisma.enrollment.delete({
            where: { id },
        });
        return { message: "Enrollment deleted successfully" };
    }
    async getEnrollmentStats(requesterId, requesterRole) {
        if (requesterRole === prisma_1.Role.STUDENT) {
            const stats = await this.prisma.enrollment.groupBy({
                by: ["status"],
                where: {
                    studentId: requesterId,
                },
                _count: true,
            });
            return {
                total: stats.reduce((acc, curr) => acc + curr._count, 0),
                byStatus: stats.reduce((acc, curr) => {
                    acc[curr.status] = curr._count;
                    return acc;
                }, {}),
            };
        }
        else if (requesterRole === prisma_1.Role.LECTURER) {
            const stats = await this.prisma.enrollment.groupBy({
                by: ["status"],
                where: {
                    course: {
                        lecturerId: requesterId,
                    },
                },
                _count: true,
            });
            return {
                total: stats.reduce((acc, curr) => acc + curr._count, 0),
                byStatus: stats.reduce((acc, curr) => {
                    acc[curr.status] = curr._count;
                    return acc;
                }, {}),
            };
        }
        else {
            const stats = await this.prisma.enrollment.groupBy({
                by: ["status"],
                _count: true,
            });
            return {
                total: stats.reduce((acc, curr) => acc + curr._count, 0),
                byStatus: stats.reduce((acc, curr) => {
                    acc[curr.status] = curr._count;
                    return acc;
                }, {}),
            };
        }
    }
};
exports.EnrollmentService = EnrollmentService;
exports.EnrollmentService = EnrollmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnrollmentService);
//# sourceMappingURL=enrollment.service.js.map