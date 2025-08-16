import express from "express";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto } from "./dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: any;
    }>;
    login(dto: LoginDto, res: express.Response): Promise<{
        message: string;
        user: {
            id: any;
            email: any;
            role: any;
        };
    }>;
    logout(req: express.Request, res: express.Response): Promise<{
        message: string;
    }>;
    verifyToken(req: express.Request): Promise<{
        message: string;
        user: Express.User | undefined;
    }>;
}
