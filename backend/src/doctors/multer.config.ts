import { BadRequestException } from '@nestjs/common';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from './cloudinary.config';

export const doctorPhotoMulterOptions = {
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'edelweiss/doctors',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    } as never,
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
