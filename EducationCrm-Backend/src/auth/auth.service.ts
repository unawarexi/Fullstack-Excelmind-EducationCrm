import { Injectable, UnauthorizedException, ConflictException, Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException("User with this email already exists");
      }

      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

      // Create the user
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword, // Note: using passwordHash as per schema
          role: dto.role,
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      this.logger.log(`User registered successfully: ${user.email}`);

      return {
        message: "User registered successfully",
        user,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      // Handle Prisma unique constraint violations
      if (error.code === "P2002") {
        throw new ConflictException("Email already exists");
      }

      this.logger.error(`Registration failed: ${error.message}`);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      this.logger.log(`Login attempt for email: ${email}`);

      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
        },
      });

      if (!user) {
        this.logger.warn(`Login failed - user not found: ${email}`);
        throw new UnauthorizedException("Invalid credentials");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        this.logger.warn(`Login failed - invalid password: ${email}`);
        throw new UnauthorizedException("Invalid credentials");
      }

      // Create JWT payload
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      // Generate JWT token
      const token = this.jwtService.sign(payload);

      this.logger.log(`Login successful for email: ${email}`);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`Login error: ${error.message}`);
      throw new UnauthorizedException("Authentication failed");
    }
  }

  async logout(token: string) {
    try {
      // Verify the token is valid
      const decoded = this.jwtService.verify(token);

      this.logger.log(`User logged out: ${decoded.email}`);

      return { message: "Logout successful" };
    } catch (error) {
      this.logger.warn(`Logout with invalid token attempted`);
      // Even if token is invalid, we still return success for logout
      return { message: "Logout successful" };
    }
  }

  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
