// import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Summary } from './entities/summary.entity';
// import { User } from '../user/user.entity';
// import { extractTextFromPdf } from 'src/common/ai/pdf.ai';
// import { parseResumeWithAi } from './utils/resume.ai.util';
// import { ExtractedDataDto } from './dto/extracted-data.dto';

// @Injectable()
// export class SummariesService {
//   constructor(
//     @InjectRepository(Summary)
//     private readonly summaryRepository: Repository<Summary>,
//   ) { }

//   async processResume(fileBuffer: Buffer, user: User): Promise<Summary> {
//     if (!fileBuffer || fileBuffer.length === 0) {
//       console.error('File buffer is empty or undefined');
//       throw new InternalServerErrorException('File buffer is empty or invalid');
//     }

//     let text: string;
//     try {
//       text = await extractTextFromPdf(fileBuffer);
//     } catch (pdfError) {
//       console.error('Error extracting text from PDF:', pdfError);
//       throw new InternalServerErrorException('Failed to extract text from PDF');
//     }

//     let parsedResume: ExtractedDataDto;
//     try {
//       parsedResume = await parseResumeWithAi(text);
//     } catch (aiError) {
//       console.error('Error parsing resume with AI:', aiError);
//       throw new InternalServerErrorException('Failed to parse resume using AI');
//     }

//     let savedSummary: Summary;
//     try {
//       savedSummary = await this.saveSummary(text, parsedResume, user);
//     } catch (dbError) {
//       console.error('Error saving summary to database:', dbError);
//       throw new InternalServerErrorException(
//         'Failed to save summary to database',
//       );
//     }

//     return savedSummary;
//   }

//   async getHistory(user: User): Promise<Summary[]> {
//     try {
//       const history = await this.summaryRepository.find({
//         where: { user: { id: user.id } },
//         order: { createdAt: 'DESC' },
//       });
//       return history;
//     } catch (err) {
//       console.error('Error fetching history:', err);
//       throw new InternalServerErrorException('Failed to fetch history');
//     }
//   }

//   private async saveSummary(
//     rawText: string,
//     data: ExtractedDataDto,
//     user: User,
//   ): Promise<Summary> {
//     const summary = this.summaryRepository.create({
//       content: rawText,
//       summary: data?.summary || 'Summary not available',
//       education: data?.education || [],
//       techStack: data?.techStack || [],
//       experience: data?.experience || [],
//       user: { id: user.id } as any,
//     });

//     try {
//       const saved = await this.summaryRepository.save(summary);
//       return saved;
//     } catch (err) {
//       console.error('Database save failed:', err);
//       throw new InternalServerErrorException('Failed to save summary');
//     }
//   }
// }

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Summary } from './entities/summary.entity';
import { User } from '../user/user.entity';
import { extractTextFromPdf } from './utils/pdf.util';
import { ExtractedDataDto } from './dto/extracted-data.dto';
import { AiService } from './ai/ai.service'; // ✅ inject AI service

@Injectable()
export class SummariesService {
  constructor(
    @InjectRepository(Summary)
    private readonly summaryRepository: Repository<Summary>,
    private readonly aiService: AiService, // ✅ inject AI service
  ) {}

  async processResume(fileBuffer: Buffer, user: User): Promise<Summary> {
    if (!fileBuffer || fileBuffer.length === 0) {
      console.error('File buffer is empty or undefined');
      throw new InternalServerErrorException('File buffer is empty or invalid');
    }

    let text: string;
    try {
      text = await extractTextFromPdf(fileBuffer);
    } catch (pdfError) {
      console.error('Error extracting text from PDF:', pdfError);
      throw new InternalServerErrorException('Failed to extract text from PDF');
    }

    let parsedResume: ExtractedDataDto;
    try {
      // ✅ Use AiService instead of utility function
      parsedResume = await this.aiService.parseResume(text);
    } catch (aiError) {
      console.error('Error parsing resume with AI:', aiError);
      throw new InternalServerErrorException('Failed to parse resume using AI');
    }

    let savedSummary: Summary;
    try {
      savedSummary = await this.saveSummary(text, parsedResume, user);
    } catch (dbError) {
      console.error('Error saving summary to database:', dbError);
      throw new InternalServerErrorException(
        'Failed to save summary to database',
      );
    }

    return savedSummary;
  }

  async getHistory(user: User): Promise<Summary[]> {
    try {
      const history = await this.summaryRepository.find({
        where: { user: { id: user.id } },
        order: { createdAt: 'DESC' },
      });
      return history;
    } catch (err) {
      console.error('Error fetching history:', err);
      throw new InternalServerErrorException('Failed to fetch history');
    }
  }

  private async saveSummary(
    rawText: string,
    data: ExtractedDataDto,
    user: User,
  ): Promise<Summary> {
    const summary = this.summaryRepository.create({
      content: rawText,
      summary: data?.summary || 'Summary not available',
      education: data?.education || [],
      techStack: data?.techStack || [],
      experience: data?.experience || [],
      user: { id: user.id } as any,
    });

    try {
      const saved = await this.summaryRepository.save(summary);
      return saved;
    } catch (err) {
      console.error('Database save failed:', err);
      throw new InternalServerErrorException('Failed to save summary');
    }
  }
}
