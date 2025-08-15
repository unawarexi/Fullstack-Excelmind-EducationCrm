import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { AssignmentController } from './assignment/assignment.controller';
import { AssignmentService } from './assignment/assignment.service';
import { AssignmentModule } from './assignment/assignment.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, AuthModule, UserModule, CourseModule, AssignmentModule, EnrollmentModule
  ],
  // controllers: [UserController, AssignmentController],
  // providers: [UserService, AssignmentService],
})
export class AppModule {}
