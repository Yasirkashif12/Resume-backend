import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ResumeValidationPipe implements PipeTransform {
  private readonly MAX_SIZE = 5 * 1024 * 1024;
  private readonly ALLOWED_MIME_TYPES = ['application/pdf'];

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Resume file is required');
    }

    if (file.size > this.MAX_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${this.MAX_SIZE / (1024 * 1024)}MB`,
      );
    }

    if (file.size === 0) {
      throw new BadRequestException('Uploaded file is empty');
    }

    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PDF files are allowed',
      );
    }

    // Additional: Check file extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'pdf') {
      throw new BadRequestException(
        'Invalid file extension. Only .pdf files are allowed',
      );
    }

    // Check buffer exists
    if (!file.buffer) {
      throw new BadRequestException('File content is missing');
    }

    return file;
  }
}
