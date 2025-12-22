import { OpenAI } from '@llamaindex/openai';
import { ExtractedDataDto } from '../dto/extracted-data.dto';
import { RESUME_EXTRACTION_PROMPT } from './prompt.util';
import { extractJson } from 'src/common/utils/json.util';

export async function parseResumeWithAi(
  text: string,
): Promise<ExtractedDataDto> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const llm = new OpenAI({
    apiKey,
    model: 'meta-llama/llama-3.1-8b-instruct',
    additionalSessionOptions: {
      baseURL: 'https://openrouter.ai/api/v1',
    },
  });

  try {
    const truncatedText = text.slice(0, 15000);
    const prompt = RESUME_EXTRACTION_PROMPT.replace('{text}', truncatedText);

    const response = await llm.chat({
      messages: [
        {
          role: 'system',
          content:
            'You are a resume parsing assistant. Extract structured data and respond ONLY with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract content safely from LlamaIndex response object
    const rawContent = Array.isArray(response.message.content)
      ? response.message.content
          .map((item: any) =>
            typeof item === 'string' ? item : item.text || '',
          )
          .join('')
      : response.message.content || '';

    // Use our shared utility to get the JSON
    const parsedData = extractJson<ExtractedDataDto>(rawContent);

    // Fallback if parsing fails
    if (!parsedData) {
      console.warn('AI response did not contain valid JSON structure');
      return {
        summary: rawContent.slice(0, 500), // Return partial text as summary if JSON fails
        education: [],
        techStack: [],
        experience: [],
      };
    }

    return parsedData;
  } catch (error: any) {
    console.error('AI processing error:', error.message);
    throw new Error(`AI processing failed: ${error.message}`);
  }
}
