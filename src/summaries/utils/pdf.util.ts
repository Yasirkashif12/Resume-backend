import { LlamaParseReader } from '@llamaindex/cloud';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid or empty buffer provided');
  }

  const apiKey = process.env.LLAMAINDEX_API_KEY;
  if (!apiKey) {
    throw new Error('LLAMAINDEX_API_KEY is not set in environment variables');
  }

  // Create a temporary file
  const tmpFilePath = path.join(os.tmpdir(), `resume-${Date.now()}.pdf`);
  await fs.writeFile(tmpFilePath, buffer);

  try {
    const reader = new LlamaParseReader({
      apiKey,
      resultType: 'text',
      language: 'en',
    });

    // Pass file path (string) instead of File/Blob

    const documents = await reader.loadData(tmpFilePath);

    const text = documents.map((doc) => doc.text).join('\n\n');

    if (!text || text.trim().length === 0) {
      throw new Error('Could not extract text from PDF');
    }

    return text;
  } catch (error: any) {
    console.error('LlamaParse error:', {
      message: error.message,
      stack: error.stack,
      bufferLength: buffer?.length,
    });
    throw new Error(`Failed to parse PDF with LlamaParse: ${error.message}`);
  } finally {
    // Cleanup temporary file
    await fs.unlink(tmpFilePath).catch(() => {});
  }
}
