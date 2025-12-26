import { Module } from '@nestjs/common';
import { BillingAddressService } from './billing-address.service';
import { BillingAddressController } from './billing-address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingAddress } from './entities/billing-address.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillingAddress, User])],
  controllers: [BillingAddressController],
  providers: [BillingAddressService],
  exports: [BillingAddressService],
})
export class BillingAddressModule {}