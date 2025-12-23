import { OpenAI } from '@llamaindex/openai';
import { InternalServerErrorException } from '@nestjs/common';

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new InternalServerErrorException(
      'OPENROUTER_API_KEY is not configured',
    );
  }

  return new OpenAI({
    apiKey,
    model: 'meta-llama/llama-3.1-8b-instruct',
    additionalSessionOptions: { baseURL: 'https://openrouter.ai/api/v1' },
  });
}
