import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe
  implements PipeTransform<Express.Multer.File, Express.Multer.File>
{
  private readonly allowedFileExtensions = ['pdf', 'jpg', 'png', 'png'];

  transform(
    value: Express.Multer.File,
    metadata: ArgumentMetadata,
  ): Express.Multer.File {
    for (let index = 0; index < Object.keys(value).length; index++) {
      if (
        !this.validateFileExtension(Object.values(value)[index][0].originalname)
      ) {
        throw new BadRequestException({
          message: `Invalid file extension detected, possible file extensions are: [${this.allowedFileExtensions}]`,
        });
      }
      return value;
    }
  }

  private validateFileExtension(fileName): boolean {
    return this.allowedFileExtensions.includes(fileName.split('.')[1]);
  }
}
