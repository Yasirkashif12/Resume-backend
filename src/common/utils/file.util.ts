import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function withTemporaryFile(
  buffer: Buffer,
  extension: string,
  callback: (path: string) => Promise<any>,
) {
  const tmpFilePath = path.join(
    os.tmpdir(),
    `upload-${Date.now()}.${extension}`,
  );
  await fs.writeFile(tmpFilePath, buffer);
  try {
    return await callback(tmpFilePath);
  } finally {
    await fs.unlink(tmpFilePath).catch(() => {});
  }
}
