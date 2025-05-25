import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    const isMatch = await bcrypt.compare(password, user?.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.mobile | user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async signUp(createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }
}
