import { Module } from '@nestjs/common';
import { UsersModule } from './module/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbConfig } from './core/config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './core/auth/auth.module';
import isUniqueConstraint from './commen/validator/is-unique-constraint';
import { DataSource } from 'typeorm';
import { Reflector } from '@nestjs/core';
import { CategoriesModule } from './module/categories/categories.module';
import { UploadModule } from './core/upload/upload.module';
import { ProdcutsModule } from './module/prodcuts/prodcuts.module';
import { BillingAddressModule } from './module/billing-address/billing-address.module';
import { PaymentModule } from './module/payment/payment.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // Production env file confi
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: DbConfig,
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
    AuthModule,
    CategoriesModule,
    UploadModule,
    ProdcutsModule,
    BillingAddressModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [isUniqueConstraint, Reflector],
})
export class AppModule {}
