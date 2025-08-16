import { CourseService } from "./course.service";
import { CreateCourseDto, UpdateCourseDto } from "./dto";
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        role: string;
    };
}
export declare class CourseController {
    private readonly courseService;
    constructor(courseService: CourseService);
    create(createCourseDto: CreateCourseDto, req: AuthenticatedRequest): Promise<any>;
    findAll(req: AuthenticatedRequest): Promise<any>;
    findOne(id: string, req: AuthenticatedRequest): Promise<any>;
    getCourseStats(id: string, req: AuthenticatedRequest): Promise<{
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
    update(id: string, updateCourseDto: UpdateCourseDto, req: AuthenticatedRequest): Promise<any>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
}
export {};
