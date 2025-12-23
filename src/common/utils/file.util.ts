import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function withTemporaryFile(
  buffer: Buffer,
  extension: string,
  callback: (path: string) => Promise<any>,
) {
  const uniqueId = Math.random().toString(36).substring(2, 9);
  const tmpFilePath = path.join(
    os.tmpdir(),
    `upload-${Date.now()}-${uniqueId}.${extension}`,
  );
  await fs.writeFile(tmpFilePath, buffer);
  try {
    return await callback(tmpFilePath);
  } finally {
    await fs.unlink(tmpFilePath).catch(() => {});
  }
}
