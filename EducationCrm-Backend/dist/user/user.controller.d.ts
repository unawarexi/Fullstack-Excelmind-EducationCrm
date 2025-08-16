import { UserService } from "./user.service";
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto } from "./dto";
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        role: string;
    };
}
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto, req: AuthenticatedRequest): Promise<any>;
    findAll(req: AuthenticatedRequest): Promise<any>;
    getCurrentUser(req: AuthenticatedRequest): Promise<any>;
    findOne(id: string, req: AuthenticatedRequest): Promise<any>;
    getUserStats(id: string, req: AuthenticatedRequest): Promise<{
        totalCourses: any;
        totalEnrollments: any;
        totalAssignments: any;
        averageGrade: number;
        totalCredits: any;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, req: AuthenticatedRequest): Promise<any>;
    updatePassword(id: string, updatePasswordDto: UpdatePasswordDto, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
}
export {};
