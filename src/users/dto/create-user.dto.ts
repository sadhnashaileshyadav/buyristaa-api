import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import UserInterface from './interfaces/user.interface';
import { isUnique } from 'src/lib/validator/is-unique';
import { Transform } from 'class-transformer';

export class CreateUserDto implements UserInterface {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    return Number(value);
  })
  role: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @isUnique({ tableName: 'user', columnName: 'email' })
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber('IN')
  @isUnique({ tableName: 'user', columnName: 'mobile' })
  mobile: number;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsIn([Math.random()], {
    message: 'Passwords do not match',
  })
  @ValidateIf((o) => o.password !== o.confirmPassword)
  confirmPassword: string;
}
