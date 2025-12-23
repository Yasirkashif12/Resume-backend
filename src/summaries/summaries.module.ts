import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummariesController } from './summaries.controller';
import { SummariesService } from './summaries.service';
import { Summary } from './entities/summary.entity';
import { AuthModule } from '../auth/auth.module';
import { AiService } from './ai/ai.service';

@Module({
  imports: [TypeOrmModule.forFeature([Summary]), AuthModule],
  controllers: [SummariesController],
  providers: [SummariesService, AiService],
  exports: [SummariesService, AiService],
})
export class SummariesModule {}
