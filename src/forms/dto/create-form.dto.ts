import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Communication } from '../schema/enums';
// import { Transform } from 'class-transformer';

export class CreateFormDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(Communication)
  @IsNotEmpty()
  methodOfCommunication: string;

  @IsOptional()
  @IsNotEmpty({ groups: ['Call'] })
  contactNo?: string;

  @IsOptional()
  @IsNotEmpty({ groups: ['Email'] })
  emailAddress?: string;

  @IsString()
  @IsNotEmpty()
  brandName: string;

  // @Transform(({ value }) => value as boolean)
  @IsString()
  @IsNotEmpty()
  sloganChoice: string;

  @IsOptional()
  @IsString()
  sloganTag?: string;

  @IsString()
  @IsNotEmpty()
  brandDescription: string;

  @IsString()
  @IsNotEmpty()
  customers: string;

  @IsString()
  @IsNotEmpty()
  perception: string;

  // @IsEnum(Color)
  @IsString()
  @IsNotEmpty()
  brandColor: string;

  @IsString()
  @IsNotEmpty()
  competitors: string;

  @IsString()
  @IsNotEmpty()
  likedLogos: string;

  @IsOptional()
  @IsString()
  logoIdea?: string;

  @IsString()
  @IsNotEmpty()
  logoType: string;

  @IsString()
  @IsNotEmpty()
  differences: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsOptional({ groups: ['file'] })
  images?: Express.Multer.File;
}
