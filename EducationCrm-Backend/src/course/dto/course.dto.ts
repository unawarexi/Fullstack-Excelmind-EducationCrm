// course/dto/create-course.dto.ts
import { IsString, IsInt, IsOptional, Min, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";
import { PartialType } from "@nestjs/mapped-types";

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  credits: number;

  @IsOptional()
  @IsString()
  syllabusPath?: string;
}

// course/dto/update-course.dto.ts



export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
