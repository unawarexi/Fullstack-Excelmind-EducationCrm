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
exports.CourseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const prisma_1 = require("../../../EducationCrm-Backend/generated/prisma");
let CourseService = class CourseService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCourseDto, lecturerId, userRole) {
        if (userRole !== prisma_1.Role.LECTURER && userRole !== prisma_1.Role.ADMIN) {
            throw new common_1.ForbiddenException("Only lecturers and admins can create courses");
        }
        const existingCourse = await this.prisma.course.findUnique({
            where: {
                lecturerId_title: {
                    lecturerId,
                    title: createCourseDto.title,
                },
            },
        });
        if (existingCourse) {
            throw new common_1.ConflictException("Course with this title already exists for this lecturer");
        }
        return this.prisma.course.create({
            data: {
                ...createCourseDto,
                lecturerId,
            },
            include: {
                lecturer: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                        assignments: true,
                    },
                },
            },
        });
    }
    async findAll(userId, userRole) {
        let whereClause = {};
        if (userRole === prisma_1.Role.STUDENT) {
            return this.prisma.course.findMany({
                include: {
                    lecturer: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                        },
                    },
                    enrollments: {
                        where: { studentId: userId },
                        select: {
                            id: true,
                            status: true,
                            enrolledAt: true,
                        },
                    },
                    _count: {
                        select: {
                            enrollments: true,
                            assignments: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }
        if (userRole === prisma_1.Role.LECTURER) {
            whereClause = { lecturerId: userId };
        }
        return this.prisma.course.findMany({
            where: whereClause,
            include: {
                lecturer: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                        assignments: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findOne(id, userId, userRole) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                lecturer: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
                enrollments: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                },
                assignments: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        dueDate: true,
                        weight: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                        assignments: true,
                    },
                },
            },
        });
        if (!course) {
            throw new common_1.NotFoundException("Course not found");
        }
        if (userRole === prisma_1.Role.STUDENT) {
            const isEnrolled = course.enrollments.some((enrollment) => enrollment.studentId === userId);
            if (!isEnrolled) {
                return {
                    id: course.id,
                    title: course.title,
                    credits: course.credits,
                    lecturer: course.lecturer,
                    createdAt: course.createdAt,
                    _count: course._count,
                };
            }
        }
        else if (userRole === prisma_1.Role.LECTURER) {
            if (course.lecturerId !== userId) {
                throw new common_1.ForbiddenException("You can only view your own courses");
            }
        }
        return course;
    }
    async getCourseStats(id, userId, userRole) {
        const course = await this.findOne(id, userId, userRole);
        if (userRole === prisma_1.Role.STUDENT) {
            const studentAssignments = await this.prisma.assignment.findMany({
                where: {
                    courseId: id,
                    studentId: userId,
                },
                select: {
                    id: true,
                    title: true,
                    grade: true,
                    weight: true,
                    submittedAt: true,
                    dueDate: true,
                },
            });
            const totalWeight = studentAssignments.reduce((sum, assignment) => sum + assignment.weight, 0);
            const weightedGrade = studentAssignments.filter((a) => a.grade !== null).reduce((sum, assignment) => sum + assignment.grade * assignment.weight, 0);
            const averageGrade = totalWeight > 0 ? weightedGrade / totalWeight : null;
            return {
                courseId: id,
                courseTitle: course.title,
                totalAssignments: studentAssignments.length,
                submittedAssignments: studentAssignments.filter((a) => a.submittedAt).length,
                averageGrade,
                assignments: studentAssignments,
            };
        }
        const enrollmentStats = await this.prisma.enrollment.groupBy({
            by: ["status"],
            where: { courseId: id },
            _count: true,
        });
        const assignmentStats = await this.prisma.assignment.aggregate({
            where: { courseId: id },
            _count: true,
            _avg: { grade: true },
        });
        return {
            courseId: id,
            courseTitle: course.title,
            enrollmentStats,
            totalAssignments: assignmentStats._count,
            averageGrade: assignmentStats._avg.grade,
            totalEnrollments: course._count.enrollments,
        };
    }
    async update(id, updateCourseDto, userId, userRole) {
        const course = await this.prisma.course.findUnique({
            where: { id },
        });
        if (!course) {
            throw new common_1.NotFoundException("Course not found");
        }
        if (userRole !== prisma_1.Role.ADMIN && course.lecturerId !== userId) {
            throw new common_1.ForbiddenException("You can only update your own courses");
        }
        if (updateCourseDto.title && updateCourseDto.title !== course.title) {
            const existingCourse = await this.prisma.course.findUnique({
                where: {
                    lecturerId_title: {
                        lecturerId: course.lecturerId,
                        title: updateCourseDto.title,
                    },
                },
            });
            if (existingCourse) {
                throw new common_1.ConflictException("Course with this title already exists for this lecturer");
            }
        }
        return this.prisma.course.update({
            where: { id },
            data: updateCourseDto,
            include: {
                lecturer: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                        assignments: true,
                    },
                },
            },
        });
    }
    async remove(id, userId, userRole) {
        const course = await this.prisma.course.findUnique({
            where: { id },
        });
        if (!course) {
            throw new common_1.NotFoundException("Course not found");
        }
        if (userRole !== prisma_1.Role.ADMIN && course.lecturerId !== userId) {
            throw new common_1.ForbiddenException("You can only delete your own courses");
        }
        await this.prisma.course.delete({
            where: { id },
        });
        return { message: "Course deleted successfully" };
    }
};
exports.CourseService = CourseService;
exports.CourseService = CourseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CourseService);
//# sourceMappingURL=course.service.js.map