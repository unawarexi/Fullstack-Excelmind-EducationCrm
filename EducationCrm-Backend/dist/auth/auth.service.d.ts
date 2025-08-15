import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto";
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: any;
    }>;
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: any;
            email: any;
            role: any;
        };
    }>;
    logout(token: string): Promise<{
        message: string;
    }>;
    validateToken(token: string): Promise<any>;
}
