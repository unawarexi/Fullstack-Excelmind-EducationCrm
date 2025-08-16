import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from "class-validator";

export class RecommendCoursesDto {
  @IsString()
  @IsNotEmpty()
  interests: string;
}

export class GenerateSyllabusDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  credits?: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  context?: string;
}

export class GenerateTextDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
