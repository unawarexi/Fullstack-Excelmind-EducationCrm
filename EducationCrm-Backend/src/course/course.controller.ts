import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus } from "@nestjs/common";
import { CourseService } from "./course.service";
import { CreateCourseDto, UpdateCourseDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt.guards";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller("courses")
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCourseDto: CreateCourseDto, @Request() req: AuthenticatedRequest) {
    return this.courseService.create(createCourseDto, req.user.id, req.user.role as any);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.courseService.findAll(req.user.id, req.user.role as any);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.courseService.findOne(id, req.user.id, req.user.role as any);
  }

  @Get(":id/stats")
  async getCourseStats(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.courseService.getCourseStats(id, req.user.id, req.user.role as any);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateCourseDto: UpdateCourseDto, @Request() req: AuthenticatedRequest) {
    return this.courseService.update(id, updateCourseDto, req.user.id, req.user.role as any);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async remove(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.courseService.remove(id, req.user.id, req.user.role as any);
  }
}
