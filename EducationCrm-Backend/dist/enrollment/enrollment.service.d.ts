import { PrismaService } from "../prisma/prisma.service";
import { CreateEnrollmentDto, UpdateEnrollmentDto } from "./dto";
import { Role, EnrollStatus } from "../../../EducationCrm-Backend/generated/prisma";
export declare class EnrollmentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createEnrollmentDto: CreateEnrollmentDto, requesterId: string, requesterRole: Role): Promise<any>;
    findAll(requesterId: string, requesterRole: Role, courseId?: string, studentId?: string, status?: EnrollStatus): Promise<any>;
    findOne(id: string, requesterId: string, requesterRole: Role): Promise<any>;
    update(id: string, updateEnrollmentDto: UpdateEnrollmentDto, requesterId: string, requesterRole: Role): Promise<any>;
    remove(id: string, requesterId: string, requesterRole: Role): Promise<{
        message: string;
    }>;
    getEnrollmentStats(requesterId: string, requesterRole: Role): Promise<{
        total: any;
        byStatus: any;
    }>;
}
