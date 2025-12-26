import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createMulterOptions } from '../../commen/utils/file-upload.utils';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(':modelType/:modelId')
  @UseInterceptors(
    FilesInterceptor('files', 5, createMulterOptions('products')),
  )
  async uploadProductImages(
    @Param('modelId', ParseIntPipe) modelId: number,
    @Param('modelType') modelType: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const savedFiles = await this.uploadService.processImages(
      files,
      modelId,
      modelType,
    );

    return {
      message: `Files uploaded and associated with ${modelType} ${modelId}`,
      files: savedFiles,
    };
  }
}
