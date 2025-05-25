import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class JwtConfig implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createJwtOptions(): Promise<JwtModuleOptions> | JwtModuleOptions {
    return {
      global: true,
      secret: this.configService.get('JWT_SECRET'),
      signOptions: { expiresIn: this.configService.get('JWT_EXPIRES_IN') },
    };
  }
}
