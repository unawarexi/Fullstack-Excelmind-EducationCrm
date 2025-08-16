import { Injectable, ForbiddenException, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service"; // Adjust path as needed
import { CreateCourseDto, UpdateCourseDto } from "./dto";
import { Role } from "../../../EducationCrm-Backend/generated/prisma";


@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto, lecturerId: string, userRole: Role) {
    // Only lecturers and admins can create courses
    if (userRole !== Role.LECTURER && userRole !== Role.ADMIN) {
      throw new ForbiddenException("Only lecturers and admins can create courses");
    }

    // Check if course with same title already exists for this lecturer
    const existingCourse = await this.prisma.course.findUnique({
      where: {
        lecturerId_title: {
          lecturerId,
          title: createCourseDto.title,
        },
      },
    });

    if (existingCourse) {
      throw new ConflictException("Course with this title already exists for this lecturer");
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

  async findAll(userId: string, userRole: Role) {
    let whereClause = {};

    // Students can only see courses they're enrolled in or available courses
    if (userRole === Role.STUDENT) {
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

    // Lecturers can only see their own courses
    if (userRole === Role.LECTURER) {
      whereClause = { lecturerId: userId };
    }

    // Admins can see all courses
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

  async findOne(id: string, userId: string, userRole: Role) {
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
      throw new NotFoundException("Course not found");
    }

    // Check permissions
    if (userRole === Role.STUDENT) {
      // Students can only see courses they're enrolled in
      const isEnrolled = course.enrollments.some((enrollment) => enrollment.studentId === userId);
      if (!isEnrolled) {
        // Return limited info for non-enrolled students
        return {
          id: course.id,
          title: course.title,
          credits: course.credits,
          lecturer: course.lecturer,
          createdAt: course.createdAt,
          _count: course._count,
        };
      }
    } else if (userRole === Role.LECTURER) {
      // Lecturers can only see their own courses with full details
      if (course.lecturerId !== userId) {
        throw new ForbiddenException("You can only view your own courses");
      }
    }

    return course;
  }

  async getCourseStats(id: string, userId: string, userRole: Role) {
    const course = await this.findOne(id, userId, userRole);

    if (userRole === Role.STUDENT) {
      // Students get their own stats for the course
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
      const weightedGrade = studentAssignments.filter((a) => a.grade !== null).reduce((sum, assignment) => sum + assignment.grade! * assignment.weight, 0);
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

    // Lecturers and admins get full course statistics
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

  async update(id: string, updateCourseDto: UpdateCourseDto, userId: string, userRole: Role) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException("Course not found");
    }

    // Only course lecturer or admin can update
    if (userRole !== Role.ADMIN && course.lecturerId !== userId) {
      throw new ForbiddenException("You can only update your own courses");
    }

    // Check for title conflicts if title is being updated
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
        throw new ConflictException("Course with this title already exists for this lecturer");
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

  async remove(id: string, userId: string, userRole: Role) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException("Course not found");
    }

    // Only course lecturer or admin can delete
    if (userRole !== Role.ADMIN && course.lecturerId !== userId) {
      throw new ForbiddenException("You can only delete your own courses");
    }

    await this.prisma.course.delete({
      where: { id },
    });

    return { message: "Course deleted successfully" };
  }
}
