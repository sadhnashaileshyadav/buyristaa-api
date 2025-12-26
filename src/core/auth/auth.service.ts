import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../../module/users/dto/create-user.dto';
import { UsersService } from '../../module/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if(!user) {
      throw new UnauthorizedException();
    }
    const isMatch = await bcrypt.compare(password, user?.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async signIn(user: any) {
    const payload = {
      username: user.email,
      id: user.id,
      name: user.name,
      role: user.roles[0]?.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async signUp(createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }
}
