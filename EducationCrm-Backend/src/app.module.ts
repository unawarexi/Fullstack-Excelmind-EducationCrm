import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

@Module({
  imports: [PrismaModule, AuthModule, UserModule, CourseModule, AssignmentModule, EnrollmentModule],
  controllers: [AppController, UserController, AssignmentController],
  providers: [AppService, UserService, AssignmentService],
})
export class AppModule {}
