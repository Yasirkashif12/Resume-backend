import {
  Controller,
  Post,
  Get,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SummariesService } from './summaries.service';
import { Summary } from './entities/summary.entity';
import { ResumeValidationPipe } from './pipes/file-validation.pipe';

@Controller('summaries')
@UseGuards(JwtAuthGuard)
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile(new ResumeValidationPipe()) file: Express.Multer.File,
    @Req() req: Request & { user: any },
  ): Promise<Summary> {
    return this.summariesService.processResume(file.buffer, req.user);
  }

  @Get('history')
  async getHistory(@Req() req: Request & { user: any }): Promise<Summary[]> {
    return this.summariesService.getHistory(req.user);
  }
}
