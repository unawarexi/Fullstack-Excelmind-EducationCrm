import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto } from "./dto";
import { Role } from "../../../EducationCrm-Backend/generated/prisma";
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(currentUserId: string, currentUserRole: Role): Promise<any>;
    findOne(id: string, currentUserId: string, currentUserRole: Role): Promise<any>;
    create(dto: CreateUserDto, currentUserRole: Role): Promise<any>;
    update(id: string, dto: UpdateUserDto, currentUserId: string, currentUserRole: Role): Promise<any>;
    updatePassword(id: string, dto: UpdatePasswordDto, currentUserId: string, currentUserRole: Role): Promise<{
        message: string;
    }>;
    remove(id: string, currentUserRole: Role): Promise<{
        message: string;
    }>;
    getUserStats(id: string, currentUserId: string, currentUserRole: Role): Promise<{
        totalCourses: any;
        totalEnrollments: any;
        totalAssignments: any;
        averageGrade: number | null;
        totalCredits: any;
    }>;
}
