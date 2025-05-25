import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';
import { Role } from 'src/roles/role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  role?: Role;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber('IN')
  mobile: number;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  @Matches('password')
  confirmPassword?: string;
}
