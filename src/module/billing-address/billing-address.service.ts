import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingAddress } from './entities/billing-address.entity';
import { CreateBillingAddressDto } from './dto/create-billing-address.dto';
import { UpdateBillingAddressDto } from './dto/update-billing-address.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BillingAddressService {
  constructor(
    @InjectRepository(BillingAddress)
    private readonly billingAddressRepository: Repository<BillingAddress>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createBillingAddressDto: CreateBillingAddressDto): Promise<BillingAddress> {
    const user = await this.userRepository.findOne({ where: { id: createBillingAddressDto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has a billing address
    const existing = await this.billingAddressRepository.findOne({ where: { user: { id: createBillingAddressDto.userId } } });
    if (existing) {
      throw new NotFoundException('Billing address already exists for this user');
    }

    const billingAddress = this.billingAddressRepository.create({
      ...createBillingAddressDto,
      user,
    });
    return this.billingAddressRepository.save(billingAddress);
  }

  async findAll(): Promise<BillingAddress[]> {
    return this.billingAddressRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<BillingAddress> {
    const billingAddress = await this.billingAddressRepository.findOne({ where: { id }, relations: ['user'] });
    if (!billingAddress) {
      throw new NotFoundException('Billing address not found');
    }
    return billingAddress;
  }

  async findByUserId(userId: number): Promise<BillingAddress> {
    const billingAddress = await this.billingAddressRepository.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (!billingAddress) {
      throw new NotFoundException('Billing address not found for this user');
    }
    return billingAddress;
  }

  async update(id: number, updateBillingAddressDto: UpdateBillingAddressDto): Promise<BillingAddress> {
    const billingAddress = await this.findOne(id);
    Object.assign(billingAddress, updateBillingAddressDto);
    return this.billingAddressRepository.save(billingAddress);
  }

  async remove(id: number): Promise<void> {
    const billingAddress = await this.findOne(id);
    await this.billingAddressRepository.remove(billingAddress);
  }
}