import { EnrollmentService } from "./enrollment.service";
import { CreateEnrollmentDto, UpdateEnrollmentDto } from "./dto";
import { EnrollStatus } from "../../../EducationCrm-Backend/generated/prisma";
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        role: string;
    };
}
export declare class EnrollmentController {
    private readonly enrollmentService;
    constructor(enrollmentService: EnrollmentService);
    create(createEnrollmentDto: CreateEnrollmentDto, req: AuthenticatedRequest): Promise<any>;
    findAll(req: AuthenticatedRequest, courseId?: string, studentId?: string, status?: EnrollStatus): Promise<any>;
    getEnrollmentStats(req: AuthenticatedRequest): Promise<{
        total: any;
        byStatus: any;
    }>;
    findOne(id: string, req: AuthenticatedRequest): Promise<any>;
    update(id: string, updateEnrollmentDto: UpdateEnrollmentDto, req: AuthenticatedRequest): Promise<any>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
}
export {};
