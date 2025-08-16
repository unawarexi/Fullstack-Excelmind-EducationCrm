import { Injectable, NotFoundException, ConflictException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service"; // Adjust path as needed
import { CreateEnrollmentDto, UpdateEnrollmentDto } from "./dto";
import { Role, EnrollStatus } from "../../../EducationCrm-Backend/generated/prisma";

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto, requesterId: string, requesterRole: Role) {
    const { courseId, studentId, status } = createEnrollmentDto;

    // Determine actual student ID
    const actualStudentId = studentId || requesterId;

    // Role-based authorization
    if (requesterRole === Role.STUDENT && actualStudentId !== requesterId) {
      throw new ForbiddenException("Students can only enroll themselves");
    }

    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { lecturer: true },
    });

    if (!course) {
      throw new NotFoundException("Course not found");
    }

    // Verify student exists and has correct role
    const student = await this.prisma.user.findUnique({
      where: { id: actualStudentId },
    });

    if (!student) {
      throw new NotFoundException("Student not found");
    }

    if (student.role !== Role.STUDENT) {
      throw new ConflictException("Only students can be enrolled in courses");
    }

    // Check for existing enrollment
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: actualStudentId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException("Student is already enrolled in this course");
    }

    // Create enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        courseId,
        studentId: actualStudentId,
        status: status || EnrollStatus.PENDING,
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

  async findAll(requesterId: string, requesterRole: Role, courseId?: string, studentId?: string, status?: EnrollStatus) {
    const where: any = {};

    // Role-based filtering
    if (requesterRole === Role.STUDENT) {
      where.studentId = requesterId;
    } else if (requesterRole === Role.LECTURER) {
      // Lecturers can only see enrollments for their courses
      where.course = {
        lecturerId: requesterId,
      };
    }
    // Admins can see all enrollments

    // Apply additional filters
    if (courseId) where.courseId = courseId;
    if (studentId && requesterRole !== Role.STUDENT) where.studentId = studentId;
    if (status) where.status = status;

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

  async findOne(id: string, requesterId: string, requesterRole: Role) {
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
      throw new NotFoundException("Enrollment not found");
    }

    // Role-based authorization
    if (requesterRole === Role.STUDENT && enrollment.studentId !== requesterId) {
      throw new ForbiddenException("Students can only access their own enrollments");
    } else if (requesterRole === Role.LECTURER && enrollment.course.lecturer.id !== requesterId) {
      throw new ForbiddenException("Lecturers can only access enrollments for their courses");
    }

    return enrollment;
  }

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto, requesterId: string, requesterRole: Role) {
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
      throw new NotFoundException("Enrollment not found");
    }

    // Role-based authorization for updates
    if (requesterRole === Role.STUDENT) {
      throw new ForbiddenException("Students cannot update enrollment status");
    } else if (requesterRole === Role.LECTURER && enrollment.course.lecturer.id !== requesterId) {
      throw new ForbiddenException("Lecturers can only update enrollments for their courses");
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

  async remove(id: string, requesterId: string, requesterRole: Role) {
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
      throw new NotFoundException("Enrollment not found");
    }

    // Role-based authorization
    if (requesterRole === Role.STUDENT && enrollment.studentId !== requesterId) {
      throw new ForbiddenException("Students can only remove their own enrollments");
    } else if (requesterRole === Role.LECTURER && enrollment.course.lecturer.id !== requesterId) {
      throw new ForbiddenException("Lecturers can only remove enrollments for their courses");
    }

    await this.prisma.enrollment.delete({
      where: { id },
    });

    return { message: "Enrollment deleted successfully" };
  }

  async getEnrollmentStats(requesterId: string, requesterRole: Role) {
    if (requesterRole === Role.STUDENT) {
      // Student stats
      const stats = await this.prisma.enrollment.groupBy({
        by: ["status"],
        where: {
          studentId: requesterId,
        },
        _count: true,
      });

      return {
        total: stats.reduce((acc, curr) => acc + curr._count, 0),
        byStatus: stats.reduce(
          (acc, curr) => {
            acc[curr.status] = curr._count;
            return acc;
          },
          {} as Record<EnrollStatus, number>
        ),
      };
    } else if (requesterRole === Role.LECTURER) {
      // Lecturer stats
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
        byStatus: stats.reduce(
          (acc, curr) => {
            acc[curr.status] = curr._count;
            return acc;
          },
          {} as Record<EnrollStatus, number>
        ),
      };
    } else {
      // Admin stats
      const stats = await this.prisma.enrollment.groupBy({
        by: ["status"],
        _count: true,
      });

      return {
        total: stats.reduce((acc, curr) => acc + curr._count, 0),
        byStatus: stats.reduce(
          (acc, curr) => {
            acc[curr.status] = curr._count;
            return acc;
          },
          {} as Record<EnrollStatus, number>
        ),
      };
    }
  }
}
