import { Controller, Post, Body, Res, Req, HttpCode, HttpStatus, UseGuards, UnauthorizedException, Get } from "@nestjs/common";
import express from "express";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto } from "./dto";
import { JwtAuthGuard } from "./guards/jwt.guards";

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
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
    const { email, password } = dto;
    const result = await this.authService.login(email, password);

    // Set HTTP-only cookie with better security
    res.cookie("jwt", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour - match JWT expiration
      path: "/", // Explicit path
    });

    return {
      message: "Login successful",
      user: result.user,
    };
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard) // Protect logout endpoint
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
    const token = req.cookies?.jwt;

    if (token) {
      await this.authService.logout(token);
    }

    // Clear the JWT cookie with same options as when set
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return { message: "Logout successful" };
  }

  @Get("verify") // Changed to GET as it's not modifying state
  @UseGuards(JwtAuthGuard) // Protect verify endpoint
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Req() req: express.Request) {
    // User info is already available from guard
    return {
      message: "Token is valid",
      user: req.user, // This is set by the JwtAuthGuard
    };
  }

}
