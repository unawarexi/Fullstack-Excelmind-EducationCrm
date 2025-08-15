import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service"; // Adjust import path as needed
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto } from "./dto";
import { Role, User } from  "../../generated/prisma"
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUserId: string, currentUserRole: Role) {
    // Only admins can view all users, lecturers can view students, students can only view themselves
    if (currentUserRole === Role.ADMIN) {
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

    if (currentUserRole === Role.LECTURER) {
      // Lecturers can view students enrolled in their courses
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

      // Remove duplicates
      const uniqueStudents = students.filter((student, index, self) => index === self.findIndex((s) => s.id === student.id));

      return uniqueStudents;
    }

    // Students can only view their own profile
    return this.findOne(currentUserId, currentUserId, currentUserRole);
  }

  async findOne(id: string, currentUserId: string, currentUserRole: Role) {
    // Check permissions
    if (currentUserRole !== Role.ADMIN && currentUserId !== id) {
      if (currentUserRole === Role.LECTURER) {
        // Check if the user is a student in lecturer's courses
        const isStudentInCourses = await this.prisma.enrollment.findFirst({
          where: {
            studentId: id,
            status: "APPROVED",
            course: { lecturerId: currentUserId },
          },
        });

        if (!isStudentInCourses) {
          throw new ForbiddenException("You can only view students enrolled in your courses");
        }
      } else {
        throw new ForbiddenException("You can only view your own profile");
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
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async create(dto: CreateUserDto, currentUserRole: Role) {
    // Only admins can create users
    if (currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException("Only administrators can create users");
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        role: dto.role || Role.STUDENT,
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

  async update(id: string, dto: UpdateUserDto, currentUserId: string, currentUserRole: Role) {
    // Check permissions
    if (currentUserRole !== Role.ADMIN && currentUserId !== id) {
      throw new ForbiddenException("You can only update your own profile");
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    // If updating email, check for uniqueness
    if (dto.email && dto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (emailExists) {
        throw new BadRequestException("User with this email already exists");
      }
    }

    // Only admins can change roles
    if (dto.role && currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException("Only administrators can change user roles");
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

  async updatePassword(id: string, dto: UpdatePasswordDto, currentUserId: string, currentUserRole: Role) {
    // Check permissions
    if (currentUserRole !== Role.ADMIN && currentUserId !== id) {
      throw new ForbiddenException("You can only update your own password");
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    // If not admin, verify current password
    if (currentUserRole !== Role.ADMIN) {
      const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, existingUser.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new BadRequestException("Current password is incorrect");
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: hashedPassword },
    });

    return { message: "Password updated successfully" };
  }

  async remove(id: string, currentUserRole: Role) {
    // Only admins can delete users
    if (currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException("Only administrators can delete users");
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: "User deleted successfully" };
  }

  async getUserStats(id: string, currentUserId: string, currentUserRole: Role) {
    // Check permissions
    if (currentUserRole !== Role.ADMIN && currentUserId !== id) {
      if (currentUserRole === Role.LECTURER) {
        // Check if the user is a student in lecturer's courses
        const isStudentInCourses = await this.prisma.enrollment.findFirst({
          where: {
            studentId: id,
            status: "APPROVED",
            course: { lecturerId: currentUserId },
          },
        });

        if (!isStudentInCourses) {
          throw new ForbiddenException("You can only view stats for students enrolled in your courses");
        }
      } else {
        throw new ForbiddenException("You can only view your own stats");
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
      throw new NotFoundException("User not found");
    }

    // Calculate weighted average grade
    let weightedGrade = 0;
    let totalWeight = 0;

    user.assignments.forEach((assignment) => {
      if (assignment.grade !== null) {
        weightedGrade += assignment.grade * assignment.weight;
        totalWeight += assignment.weight;
      }
    });

    const averageGrade = totalWeight > 0 ? Math.round(weightedGrade / totalWeight) : null;

    // Calculate total credits
    const totalCredits = user.enrollments.reduce((sum, enrollment) => sum + enrollment.course.credits, 0);

    return {
      totalCourses: user._count.courses,
      totalEnrollments: user._count.enrollments,
      totalAssignments: user._count.assignments,
      averageGrade,
      totalCredits,
    };
  }
}
