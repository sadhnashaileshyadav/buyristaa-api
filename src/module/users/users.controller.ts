import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../core/roles/roles.decorator';
import { Role } from '../../core/roles/role.enum';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/roles/roles.guard';
import { BadRequestException } from '@nestjs/common';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get(':id/referrals')
  getReferrals(@Param('id') id: string, @Query('level') level?: string) {
    const userId = +id;
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.usersService.getReferrals(userId, level ? +level : 2);
  }

  @Get('report/referrals')
  @Roles(Role.ADMIN)
  getReferralReport() {
    return this.usersService.getReferralReport();
  }

  @Get('referrals/all')
  @Roles(Role.ADMIN)
  getAllReferrals(@Query('level') level?: string) {
    return this.usersService.getAllReferrals(level ? +level : 2);
  }
}
