import { Module } from "@nestjs/common";
import { CourseService } from "./course.service";
import { CourseController } from "./course.controller";
import { PrismaModule } from "../prisma/prisma.module"; // Adjust path as needed

@Module({
  imports: [PrismaModule], // Import PrismaModule to use PrismaService
  providers: [CourseService],
  controllers: [CourseController],
  exports: [CourseService], // Export service for use in other modules
})
export class CourseModule {}
