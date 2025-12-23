import { ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';

export const ResumeValidationPipe = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: 'pdf',
  })
  .addMaxSizeValidator({
    maxSize: 5 * 1024 * 1024,
  })
  .build({
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    fileIsRequired: true,
  });
