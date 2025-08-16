import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, ValidationPipe } from "@nestjs/common";
import { AiService } from "./ai.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guards";
import { RecommendCoursesDto, GenerateSyllabusDto, GenerateTextDto } from "./dto";
import { Role } from "../../generated/prisma";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Recommends courses based on student interests
   * Available to all authenticated users
   */
  @Post("recommend")
  @HttpCode(HttpStatus.OK)
  async recommendCourses(@Body(ValidationPipe) recommendCoursesDto: RecommendCoursesDto, @Request() req: AuthenticatedRequest) {
    return this.aiService.recommendCourses(recommendCoursesDto, req.user.id, req.user.role);
  }

  /**
   * Auto-generates syllabus based on topic input
   * Available to all authenticated users
   */
  @Post("syllabus")
  @HttpCode(HttpStatus.OK)
  async generateSyllabus(@Body(ValidationPipe) generateSyllabusDto: GenerateSyllabusDto, @Request() req: AuthenticatedRequest) {
    return this.aiService.generateSyllabus(generateSyllabusDto, req.user.id, req.user.role);
  }

  /**
   * Generates text based on user prompt
   * General AI text generation endpoint
   */
  @Post("generate")
  @HttpCode(HttpStatus.OK)
  async generateText(@Body(ValidationPipe) generateTextDto: GenerateTextDto, @Request() req: AuthenticatedRequest) {
    return this.aiService.generateText(generateTextDto.prompt, req.user.id, req.user.role);
  }
}
