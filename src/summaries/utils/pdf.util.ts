import { LlamaParseReader } from '@llamaindex/cloud';
import { withTemporaryFile } from 'src/common/utils/file.util';
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid or empty buffer provided');
  }

  const apiKey = process.env.LLAMAINDEX_API_KEY;
  if (!apiKey) {
    throw new Error('LLAMAINDEX_API_KEY is not set in environment variables');
  }

  // Use the wrapper to handle the file life-cycle
  return await withTemporaryFile(buffer, 'pdf', async (tmpFilePath) => {
    try {
      const reader = new LlamaParseReader({
        apiKey,
        resultType: 'text',
        language: 'en',
      });

      const documents = await reader.loadData(tmpFilePath);
      const text = documents.map((doc) => doc.text).join('\n\n');

      if (!text || text.trim().length === 0) {
        throw new Error('Could not extract text from PDF');
      }

      return text;
    } catch (error: any) {
      console.error('LlamaParse error:', {
        message: error.message,
        bufferLength: buffer?.length,
      });
      throw new Error(`Failed to parse PDF with LlamaParse: ${error.message}`);
    }
  });
}
