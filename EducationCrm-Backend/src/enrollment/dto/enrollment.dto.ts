// enrollment/dto/create-enrollment.dto.ts
import { IsString, IsUUID, IsEnum, IsOptional } from "class-validator";
import { EnrollStatus } from "../../../generated/prisma";



export class CreateEnrollmentDto {
  @IsString()
  @IsUUID()
  courseId: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  studentId?: string; // Optional, can default to current user

  @IsEnum(EnrollStatus)
  @IsOptional()
  status?: EnrollStatus = EnrollStatus.PENDING;
}

// enrollment/dto/update-enrollment.dto.ts


export class UpdateEnrollmentDto {
  @IsEnum(EnrollStatus)
  @IsOptional()
  status?: EnrollStatus;
}


