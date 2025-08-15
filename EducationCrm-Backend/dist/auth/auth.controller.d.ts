import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto } from "./dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: any;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        message: string;
        user: {
            id: any;
            email: any;
            role: any;
        };
    }>;
    logout(req: Request, res: Response): Promise<{
        message: string;
    }>;
    verifyToken(req: Request): Promise<{
        message: string;
        user: {
            id: any;
            email: any;
            role: any;
        };
    }>;
}
