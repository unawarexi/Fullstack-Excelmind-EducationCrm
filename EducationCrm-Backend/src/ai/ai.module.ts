import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({

  controllers: [AiController],
  providers: [AiService],
  exports: [AiService], 
})
export class AiModule {}
