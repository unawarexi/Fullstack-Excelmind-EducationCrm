import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.jwt;

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      const decoded = await this.authService.validateToken(token);
      request.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
