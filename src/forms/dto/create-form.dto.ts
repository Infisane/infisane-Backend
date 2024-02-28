import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Communication } from '../schema/enums';

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
}
