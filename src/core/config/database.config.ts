import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SeederOptions } from 'typeorm-extension';
import * as path from 'path';

@Injectable()
export class DbConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions & SeederOptions {
    const entitiesPath = path.join(process.cwd(), 'dist', '**', '*.entity{.ts,.js}');
    return {
      type: 'mysql',
      host: this.configService.get('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_NAME'),
      entities: [entitiesPath],
      seeds: [],
      synchronize: this.configService.get('DB_SYNC'),
      logging: false,
    };
  }
}
