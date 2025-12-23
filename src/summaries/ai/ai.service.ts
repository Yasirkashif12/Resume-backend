import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ExtractedDataDto } from '../dto/extracted-data.dto';
import { RESUME_EXTRACTION_PROMPT } from '../utils/prompt.util';
import { extractJson } from 'src/common/utils/json.util';
import { getOpenAIClient } from 'src/common/ai/client';
@Injectable()
export class AiService {
  private readonly llm = getOpenAIClient();

  /**
   * Safely extract text from LlamaIndex response content
   */
  private extractTextFromContent(content?: unknown): string {
    if (!content) return '';

    if (Array.isArray(content)) {
      return content
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object' && 'text' in item)
            return (item as any).text ?? '';
          return '';
        })
        .join('');
    }

    if (typeof content === 'string') return content;
    if (typeof content === 'object' && 'text' in content)
      return (content as any).text ?? '';

    return '';
  }

  /**
   * Build AI prompt from template
   */
  private buildResumePrompt(text: string): string {
    if (!RESUME_EXTRACTION_PROMPT.includes('{text}')) {
      console.warn('Prompt template does not include {text} placeholder');
    }
    return RESUME_EXTRACTION_PROMPT.replace('{text}', text);
  }

  /**
   * Parse resume text using AI
   */
  async parseResume(text: string): Promise<ExtractedDataDto> {
    try {
      // Truncate text safely
      let truncatedText = text;
      if (text.length > 15000) {
        console.warn(
          `Resume text truncated from ${text.length} to 15000 characters`,
        );
        truncatedText = [...text].slice(0, 15000).join(''); // UTF-16 safe
      }

      const prompt = this.buildResumePrompt(truncatedText);

      const response = await this.llm.chat({
        messages: [
          {
            role: 'system',
            content:
              'You are a resume parsing assistant. Extract structured data and respond ONLY with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
      });

      const rawContent = this.extractTextFromContent(
        response?.message?.content,
      );
      const parsedData = extractJson<ExtractedDataDto>(rawContent);

      if (!parsedData) {
        console.warn(
          'AI response did not contain valid JSON structure. Returning fallback.',
        );
        return {
          summary: rawContent.slice(0, 500),
          education: [],
          techStack: [],
          experience: [],
        };
      }

      return parsedData;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('AI processing error:', message);
      throw new InternalServerErrorException(
        `AI processing failed: ${message}`,
      );
    }
  }
}
