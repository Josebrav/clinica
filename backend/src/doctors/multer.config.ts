import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const doctorPhotoMulterOptions = {
  storage: diskStorage({
    destination: './uploads/doctors',
    filename: (_req, file, callback) => {
      const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (_req: unknown, file: Express.Multer.File, callback: any) => {
    if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
      return callback(
        new BadRequestException('Solo se permiten imágenes (jpg, png, webp)'),
        false,
      );
    }
    callback(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};
