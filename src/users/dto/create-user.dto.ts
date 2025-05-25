import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import UserInterface from './interfaces/user.interface';
import { isUnique } from 'src/lib/validator/is-unique';
import { Role } from 'src/roles/role.enum';

export class CreateUserDto implements UserInterface {
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

  @IsString()
  role: Role;
}
