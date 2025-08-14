import { IsEmail, IsNotEmpty, IsString, IsEnum, MinLength } from "class-validator";
import Role  from "@prisma/client";

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;

  @IsEnum(Role, { message: "Role must be either STUDENT, LECTURER, or ADMIN" })
  role: Role;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LogoutDto {
  // No fields needed - logout will use the JWT from cookies
}
