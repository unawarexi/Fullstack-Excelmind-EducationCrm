import { Role } from "../../../../EducationCrm-Backend/generated/prisma";
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role: Role;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class LogoutDto {
}
