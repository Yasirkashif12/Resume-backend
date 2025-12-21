import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Summary } from './entities/summary.entity';
import { User } from '../user/user.entity';
import { extractTextFromPdf } from './utils/pdf.util';
import { parseResumeWithAi } from './utils/llamaindex.util';

@Injectable()
export class SummariesService {
  constructor(
    @InjectRepository(Summary)
    private readonly summaryRepository: Repository<Summary>,
  ) {}

  async processResume(fileBuffer: Buffer, user: User): Promise<Summary> {
    console.log('===== processResume START =====');
    console.log('User:', user);

    if (!fileBuffer || fileBuffer.length === 0) {
      console.error('File buffer is empty or undefined');
      throw new InternalServerErrorException('File buffer is empty or invalid');
    }

    console.log('File buffer length:', fileBuffer.length);

    let text: string;
    try {
      text = await extractTextFromPdf(fileBuffer);
      console.log(
        'PDF text extracted successfully. First 300 chars:\n',
        text.slice(0, 300),
      );
    } catch (pdfError) {
      console.error('Error extracting text from PDF:', pdfError);
      throw new InternalServerErrorException('Failed to extract text from PDF');
    }

    let extractedData: any;
    try {
      // Optional: check API key
      console.log(
        'LLAMAINDEX_API_KEY:',
        process.env.LLAMAINDEX_API_KEY ? 'Exists' : 'Missing',
      );

      extractedData = await parseResumeWithAi(text);
      console.log('AI parsing successful. Extracted data:', extractedData);
    } catch (aiError) {
      console.error('Error parsing resume with AI:', aiError);
      throw new InternalServerErrorException('Failed to parse resume using AI');
    }

    let savedSummary: Summary;
    try {
      savedSummary = await this.saveSummary(text, extractedData, user);
      console.log('Summary saved successfully:', savedSummary);
    } catch (dbError) {
      console.error('Error saving summary to database:', dbError);
      throw new InternalServerErrorException(
        'Failed to save summary to database',
      );
    }

    console.log('===== processResume END =====');
    return savedSummary;
  }

  async getHistory(user: User): Promise<Summary[]> {
    console.log('Fetching history for user:', user);

    try {
      const history = await this.summaryRepository.find({
        where: { user: { id: user.id } },
        order: { createdAt: 'DESC' },
      });
      console.log('History fetched successfully. Count:', history.length);
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
    console.log('Saving summary to database for user:', user.id);
    console.log('Data to save:', data);

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
      console.log('Summary saved successfully:', saved);
      return saved;
    } catch (err) {
      console.error('Database save failed:', err);
      throw new InternalServerErrorException('Failed to save summary');
    }
  }
}
