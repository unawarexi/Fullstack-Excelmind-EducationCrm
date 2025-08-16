import { Role } from "../../../generated/prisma";
export declare class CreateUserDto {
    email: string;
    password: string;
    role?: Role;
}
export declare class UpdateUserDto {
    email?: string;
    role?: Role;
}
export declare class UpdatePasswordDto {
    currentPassword: string;
    newPassword: string;
}
