import { Module } from "@nestjs/common";
import { EnrollmentService } from "./enrollment.service";
import { EnrollmentController } from "./enrollment.controller";
import { PrismaModule } from "../prisma/prisma.module"; // Import the module, not the service

@Module({
  imports: [PrismaModule], // Import PrismaModule here
  providers: [EnrollmentService],
  controllers: [EnrollmentController],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
