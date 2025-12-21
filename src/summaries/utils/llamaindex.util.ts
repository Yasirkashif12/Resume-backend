import { OpenAI } from '@llamaindex/openai';
import { ExtractedDataDto } from '../dto/extracted-data.dto';
import { RESUME_EXTRACTION_PROMPT } from './prompt.util';

export async function parseResumeWithAi(
  text: string,
): Promise<ExtractedDataDto> {
  console.log('===== parseResumeWithAi START =====');
  console.log('Text length:', text?.length);

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  try {
    const llm = new OpenAI({
      apiKey,
      model: 'meta-llama/llama-3.1-8b-instruct',
      additionalSessionOptions: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
    });

    // Limit text to avoid token limits
    const truncatedText = text.slice(0, 15000);
    const prompt = RESUME_EXTRACTION_PROMPT.replace('{text}', truncatedText);

    console.log('Sending request to OpenRouter...');

    const response = await llm.chat({
      messages: [
        {
          role: 'system',
          content:
            'You are a resume parsing assistant. Extract structured data from resumes and respond ONLY with valid JSON. Do not include any explanation or markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // ✅ Handle both string and array content types
    let responseText: string;
    if (typeof response.message.content === 'string') {
      responseText = response.message.content;
    } else if (Array.isArray(response.message.content)) {
      // If it's an array, join all text parts
      responseText = response.message.content
        .map((item: any) => (typeof item === 'string' ? item : item.text || ''))
        .join('');
    } else {
      throw new Error('Unexpected response content type');
    }

    console.log('AI raw response (first 500 chars):');
    console.log(responseText.slice(0, 500));

    // Extract JSON from response
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.warn('No JSON found in AI response, returning default structure');
      return {
        summary: responseText,
        education: [],
        techStack: [],
        experience: [],
      };
    }

    const parsedData = JSON.parse(jsonMatch[0]) as ExtractedDataDto;

    console.log('Successfully parsed extracted data:');
    console.log('- Summary length:', parsedData.summary?.length || 0);
    console.log('- Education entries:', parsedData.education?.length || 0);
    console.log('- Tech stack items:', parsedData.techStack?.length || 0);
    console.log('- Experience entries:', parsedData.experience?.length || 0);
    console.log('===== parseResumeWithAi END =====');

    return parsedData;
  } catch (error: any) {
    console.error('AI processing error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw new Error(`AI processing failed: ${error.message}`);
  }
}
