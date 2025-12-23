import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Summary } from './entities/summary.entity';
import { User } from '../user/user.entity';
import { extractTextFromPdf } from './utils/pdf.util';
import { parseResumeWithAi } from './utils/resume.ai.util';

@Injectable()
export class SummariesService {
  constructor(
    @InjectRepository(Summary)
    private readonly summaryRepository: Repository<Summary>,
  ) {}

  async processResume(fileBuffer: Buffer, user: User): Promise<Summary> {
    //buffer is a temporary container in a ram that hold the raw binary data
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

    let extractedData: any;
    try {
      extractedData = await parseResumeWithAi(text);
    } catch (aiError) {
      console.error('Error parsing resume with AI:', aiError);
      throw new InternalServerErrorException('Failed to parse resume using AI');
    }

    let savedSummary: Summary;
    try {
      savedSummary = await this.saveSummary(text, extractedData, user);
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
    data: any,
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
