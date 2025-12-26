import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { ReferralService } from '../../commen/services/refferal/refferal.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { Payment } from '../payment/entities/payment.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../../core/config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RoleEntity, Payment]),
    JwtModule.registerAsync({
      useClass: JwtConfig,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, ReferralService],
  exports: [UsersService, ReferralService],
})
export class UsersModule {}

export { UsersService };
