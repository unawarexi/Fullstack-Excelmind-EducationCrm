import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { EnrollmentService } from "./enrollment.service";
import { CreateEnrollmentDto, UpdateEnrollmentDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt.guards";
import { EnrollStatus } from "../../generated/prisma";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller("enrollment")
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto, @Request() req: AuthenticatedRequest) {
    return this.enrollmentService.create(createEnrollmentDto, req.user.id, req.user.role as any);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest, @Query("courseId") courseId?: string, @Query("studentId") studentId?: string, @Query("status") status?: EnrollStatus) {
    return this.enrollmentService.findAll(req.user.id, req.user.role as any, courseId, studentId, status);
  }

  @Get("stats")
  async getEnrollmentStats(@Request() req: AuthenticatedRequest) {
    return this.enrollmentService.getEnrollmentStats(req.user.id, req.user.role as any);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.enrollmentService.findOne(id, req.user.id, req.user.role as any);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateEnrollmentDto: UpdateEnrollmentDto, @Request() req: AuthenticatedRequest) {
    return this.enrollmentService.update(id, updateEnrollmentDto, req.user.id, req.user.role as any);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async remove(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.enrollmentService.remove(id, req.user.id, req.user.role as any);
  }
}
