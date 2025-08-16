import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

// Define roles enum
enum Role {
  STUDENT = "STUDENT",
  LECTURER = "LECTURER",
  ADMIN = "ADMIN",
}

// Decorator to set required roles
export const Roles = (...roles: Role[]) => SetMetadata("roles", roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>("roles", [context.getHandler(), context.getClass()]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("User not found in request");
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}

// Example usage in controller:
/*
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  
  @Get('users')
  @Roles(Role.ADMIN)
  async getAllUsers() {
    // Only admins can access this
  }

  @Post('moderate')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async moderateContent() {
    // Admins or moderators can access this
  }
}
*/
