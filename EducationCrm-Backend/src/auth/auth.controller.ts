import { Controller, Post, Body, Res, Req, HttpCode, HttpStatus, UseGuards, UnauthorizedException } from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto, LogoutDto } from "./dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { email, password } = dto;

    const result = await this.authService.login(email, password);

    // Set HTTP-only cookie
    res.cookie("jwt", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Return user info (without token in response body for security)
    return {
      message: "Login successful",
      user: result.user,
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Get token from cookie
    const token = req.cookies?.jwt;

    if (token) {
      // Validate and process logout
      await this.authService.logout(token);
    }

    // Clear the JWT cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return { message: "Logout successful" };
  }

  @Post("verify")
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Req() req: Request) {
    const token = req.cookies?.jwt;

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    const decoded = await this.authService.validateToken(token);

    return {
      message: "Token is valid",
      user: {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      },
    };
  }
}
