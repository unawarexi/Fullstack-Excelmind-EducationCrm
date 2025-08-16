import { PrismaService } from "../prisma/prisma.service";
import { CreateCourseDto, UpdateCourseDto } from "./dto";
import { Role } from "../../../EducationCrm-Backend/generated/prisma";
export declare class CourseService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCourseDto: CreateCourseDto, lecturerId: string, userRole: Role): Promise<any>;
    findAll(userId: string, userRole: Role): Promise<any>;
    findOne(id: string, userId: string, userRole: Role): Promise<any>;
    getCourseStats(id: string, userId: string, userRole: Role): Promise<{
        courseId: string;
        courseTitle: any;
        totalAssignments: any;
        submittedAssignments: any;
        averageGrade: number | null;
        assignments: any;
        enrollmentStats?: undefined;
        totalEnrollments?: undefined;
    } | {
        courseId: string;
        courseTitle: any;
        enrollmentStats: any;
        totalAssignments: any;
        averageGrade: any;
        totalEnrollments: any;
        submittedAssignments?: undefined;
        assignments?: undefined;
    }>;
    update(id: string, updateCourseDto: UpdateCourseDto, userId: string, userRole: Role): Promise<any>;
    remove(id: string, userId: string, userRole: Role): Promise<{
        message: string;
    }>;
}
