import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt.guards";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto, @Request() req: AuthenticatedRequest) {
    return this.userService.create(createUserDto, req.user.role as any);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.userService.findAll(req.user.id, req.user.role as any);
  }

  @Get("me")
  async getCurrentUser(@Request() req: AuthenticatedRequest) {
    return this.userService.findOne(req.user.id, req.user.id, req.user.role as any);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.userService.findOne(id, req.user.id, req.user.role as any);
  }

  @Get(":id/stats")
  async getUserStats(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.userService.getUserStats(id, req.user.id, req.user.role as any);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto, @Request() req: AuthenticatedRequest) {
    return this.userService.update(id, updateUserDto, req.user.id, req.user.role as any);
  }

  @Patch(":id/password")
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Param("id") id: string, @Body() updatePasswordDto: UpdatePasswordDto, @Request() req: AuthenticatedRequest) {
    return this.userService.updatePassword(id, updatePasswordDto, req.user.id, req.user.role as any);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async remove(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.userService.remove(id, req.user.role as any);
  }
}
