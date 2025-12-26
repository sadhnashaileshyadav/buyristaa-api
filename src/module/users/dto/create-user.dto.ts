import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import UserInterface from './interfaces/user.interface';
import { isUnique } from '../../../commen/validator/is-unique';
import { Role } from '../../../core/roles/role.enum';

export class CreateUserDto implements UserInterface {
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @isUnique({ tableName: 'users', columnName: 'email' })
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber('IN')
  @isUnique({ tableName: 'users', columnName: 'mobile' })
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
  
  @IsNotEmpty()
  @IsString()
  referralCode: string;

  @IsString()
  @IsEnum(Role, { message: 'Invalid user role provided.' })
  role: Role;
}
