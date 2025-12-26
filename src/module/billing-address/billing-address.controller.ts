import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Request,
} from '@nestjs/common';
import { BillingAddressService } from './billing-address.service';
import { CreateBillingAddressDto } from './dto/create-billing-address.dto';
import { UpdateBillingAddressDto } from './dto/update-billing-address.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/roles/roles.guard';
import { Roles } from '../../core/roles/roles.decorator';
import { Role } from '../../core/roles/role.enum';

@Controller('billing-address')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingAddressController {
  constructor(private readonly billingAddressService: BillingAddressService) {}

  @Post()
  create(@Body() createBillingAddressDto: CreateBillingAddressDto) {
    return this.billingAddressService.create(createBillingAddressDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.billingAddressService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billingAddressService.findOne(+id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.billingAddressService.findByUserId(+userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBillingAddressDto: UpdateBillingAddressDto) {
    return this.billingAddressService.update(+id, updateBillingAddressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billingAddressService.remove(+id);
  }
}