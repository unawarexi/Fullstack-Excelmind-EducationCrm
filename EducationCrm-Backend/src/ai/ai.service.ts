import { Injectable, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import OpenAI from "openai";
import { RecommendCoursesDto, GenerateSyllabusDto } from "./dto";
import { Role } from "../../../EducationCrm-Backend/generated/prisma";

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async recommendCourses(dto: RecommendCoursesDto, userId: string, userRole: Role) {
    try {
      // Verify user exists and get their information
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          enrollments: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      // Get all available courses
      const availableCourses = await this.prisma.course.findMany({
        include: {
          lecturer: {
            select: {
              email: true,
              id: true,
            },
          },
        },
      });

      // Get enrolled course titles for context
      const enrolledCourseTitles = user.enrollments.map((enrollment) => enrollment.course.title);

      // Create course recommendations prompt
      const courseList = availableCourses.map((course) => `${course.title} (${course.credits} credits)`).join("\n");

      const prompt = `
        Based on the following student interests and currently enrolled courses, recommend 3-5 relevant courses from the available course list.

        Student Interests: ${dto.interests}
        Currently Enrolled Courses: ${enrolledCourseTitles.join(", ") || "None"}

        Available Courses:
        ${courseList}

        Please provide course recommendations in the following JSON format:
        {
        "recommendations": [
            {
            "courseTitle": "Course Name",
            "reason": "Why this course matches the student's interests",
            "relevanceScore": 85
            }
        ],
        "summary": "Brief explanation of the recommendation strategy"
        }

        Focus on courses that align with the student's interests and complement their current enrollment.
        `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an academic advisor AI that provides personalized course recommendations based on student interests and academic history.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new InternalServerErrorException("Failed to get AI response");
      }

      // Parse JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (error) {
        // Fallback if JSON parsing fails
        parsedResponse = {
          recommendations: [],
          summary: aiResponse,
          rawResponse: aiResponse,
        };
      }

      // Enrich recommendations with actual course data
      const enrichedRecommendations = parsedResponse.recommendations?.map((rec: any) => {
        const matchedCourse = availableCourses.find((course) => course.title === rec.courseTitle);
        return {
          ...rec,
          courseDetails: matchedCourse || null,
        };
      });

      return {
        recommendations: enrichedRecommendations || [],
        summary: parsedResponse.summary,
        requestedBy: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error("Error in recommendCourses:", error);
      throw new InternalServerErrorException("Failed to generate course recommendations");
    }
  }

  async generateSyllabus(dto: GenerateSyllabusDto, userId: string, userRole: Role) {
    try {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      const prompt = `
        Create a comprehensive course syllabus for the following topic: "${dto.topic}"

        Course Details:
        - Credits: ${dto.credits || 3}
        - Duration: ${dto.duration || "1 semester (16 weeks)"}
        - Additional Context: ${dto.context || "Standard undergraduate course"}

        Please generate a detailed syllabus in the following format:

        Course Title: [Generate an appropriate course title]

        Course Description:
        [2-3 paragraph course description]

        Learning Objectives:
        [List 5-7 specific learning objectives]

        Course Schedule (Weekly):
        Week 1: [Topic and activities]
        Week 2: [Topic and activities]
        ...continue for the full duration

        Assessment Methods:
        - [List assessment types with percentages]

        Required Materials:
        - [List textbooks, software, etc.]

        Grading Scale:
        [Standard grading scale]

        Course Policies:
        [Attendance, late submissions, academic integrity, etc.]

        Make the syllabus comprehensive, professional, and academically rigorous.
        `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an experienced academic curriculum designer who creates detailed, professional course syllabi for higher education institutions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.5,
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new InternalServerErrorException("Failed to generate syllabus");
      }

      return {
        syllabus: aiResponse,
        topic: dto.topic,
        credits: dto.credits || 3,
        duration: dto.duration || "1 semester (16 weeks)",
        generatedBy: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        timestamp: new Date().toISOString(),
        metadata: {
          model: "gpt-3.5-turbo",
          tokensUsed: response.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error("Error in generateSyllabus:", error);
      throw new InternalServerErrorException("Failed to generate syllabus");
    }
  }

  async generateText(prompt: string, userId: string, userRole: Role) {
    try {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException("User not found");
      }

      if (!prompt || prompt.trim().length === 0) {
        throw new BadRequestException("Prompt cannot be empty");
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for an educational platform. Provide clear, accurate, and educational responses.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new InternalServerErrorException("Failed to generate text");
      }

      return {
        response: aiResponse,
        prompt: prompt,
        generatedBy: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        timestamp: new Date().toISOString(),
        metadata: {
          model: "gpt-3.5-turbo",
          tokensUsed: response.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error("Error in generateText:", error);
      throw new InternalServerErrorException("Failed to generate text response");
    }
  }
}
