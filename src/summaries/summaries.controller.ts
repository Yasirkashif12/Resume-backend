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

@Controller('summaries')
@UseGuards(JwtAuthGuard)
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ): Promise<Summary> {
    if (!req.user) {
      console.error('Error: User not found in request (JWT issue)');
      throw new BadRequestException('User authentication failed');
    }

    if (!file) {
      console.error('Error: No file received');
      throw new BadRequestException('Resume file is required');
    }

    if (!file.buffer) {
      console.error('Error: File buffer is missing');
      throw new BadRequestException('File buffer is missing');
    }

    try {
      const result = await this.summariesService.processResume(
        file.buffer,
        req.user,
      );
      return result;
    } catch (err) {
      console.error('Error in processResume:', err);
      throw new BadRequestException(
        'Resume processing failed. Check backend logs.',
      );
    }
  }

  @Get('get')
  async getHistory(@Req() req: any): Promise<Summary[]> {
    if (!req.user) {
      console.error('Error: User not found in request (JWT issue)');
      throw new BadRequestException('User authentication failed');
    }

    try {
      const history = await this.summariesService.getHistory(req.user);
      return history;
    } catch (err) {
      console.error('Error fetching history:', err);
      throw new BadRequestException('Failed to fetch history');
    }
  }
}
