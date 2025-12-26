import { extname } from 'path';
import { diskStorage } from 'multer';
import * as fs from 'fs'; 
import { HttpException, HttpStatus } from '@nestjs/common';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST), false);
  }
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
    const fileExtName = extname(file.originalname);
    const randomName = Array(16).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
    callback(null, `${randomName}${fileExtName}`);
};

export const createMulterOptions = (folderName: string) => {
    const destinationPath = `./uploads/${folderName}`;
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    return {
        storage: diskStorage({
            destination: destinationPath,
            filename: editFileName,
        }),
        fileFilter: imageFileFilter,
    };
};