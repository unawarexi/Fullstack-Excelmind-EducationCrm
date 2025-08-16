import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      this.logger.warn("No token provided in request");
      throw new UnauthorizedException("Authentication required");
    }

    try {
      const decoded = await this.authService.validateToken(token);

      // Attach user info to request
      request.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };

      return true;
    } catch (error) {
      this.logger.warn(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  private extractToken(request: any): string | null {
    // Try cookie first (your current implementation)
    const cookieToken = request.cookies?.jwt;
    if (cookieToken) {
      return cookieToken;
    }

    // Fallback to Authorization header for API clients
    const authHeader = request.headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    return null;
  }
}
