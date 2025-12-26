import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/upload.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}
  async processImages(
    files: Array<Express.Multer.File>,
    modelId: number,
    modelType: string,
  ): Promise<FileEntity[]> {
    const fileEntities = files.map((file) => {
      const entity = new FileEntity();
      entity.filename = file.filename;
      entity.path = `/uploads/products/${file.filename}`;
      entity.modelId = modelId;
      entity.modelType = modelType;
      return entity;
    });

    return this.fileRepository.save(fileEntities);
  }
}
