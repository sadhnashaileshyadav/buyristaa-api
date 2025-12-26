import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { Role } from '../../core/roles/role.enum';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { ReferralService } from '../../commen/services/refferal/refferal.service';
import { Payment } from '../payment/entities/payment.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RoleEntity)
    private rolesRepository: Repository<RoleEntity>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private readonly referralService: ReferralService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User | undefined> {
    const user = new User();
    const defaultUserRole = await this.rolesRepository.findOne({
      where: { name: createUserDto.role },
    });
    if (!defaultUserRole) {
      throw new InternalServerErrorException(
        'Default user role not found in configuration.',
      );
    }
    user.name = createUserDto.name;
    user.password = createUserDto.password;
    user.email = createUserDto.email;
    user.mobile = createUserDto.mobile;
    user.referralCode = await this.referralService.generateUniqueReferralCode();
    user.referredBy = await this.findUserByReferralCode(
      createUserDto.referralCode,
    );
    user.is_active = false;
    user.roles = [defaultUserRole];
    return this.userRepository.save(user);
  }
  
  async findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.find({
      where: {id},
      relations: ['roles'] 
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`); 
    }
    return await this.userRepository.update(
      id,
      {
        name: updateUserDto.name,
        update_at: new Date(), 
      },
    );
  }

  async findByUsername(username: string): Promise<any> {
    return await this.userRepository.findOne({
      where: [{ email: username, is_active: true }],
      relations: ['roles'],
    });
  }

  async findOneById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ 
        where: { id },
        relations: ['roles'] 
    });
  }

  async findUserByReferralCode(refferalCode: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: [{ referralCode: refferalCode, is_active: true }],
    });

    return user ? user?.id : 0;
  }

  async remove(id: number) {
    const user = await this.userRepository.find({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new BadRequestException();
    }

    await this.userRepository.delete(id);
    return 'User deleted successfully';
  }

  async getReferrals(userId: number, level: number = 2) {
    if (!userId || userId <= 0) {
      throw new BadRequestException('Invalid user ID');
    }
    const level1Referrals = await this.userRepository.find({
      where: { referredBy: userId },
      relations: ['billingAddress'],
    });

    let allReferrals = [];
    for (const user of level1Referrals) {
      const payments = await this.paymentRepository.find({
        where: { userId: user.id },
        order: { createdAt: 'DESC' },
        take: 1,
      });
      allReferrals.push({ ...user, level: 1, paymentStatus: payments.length > 0 ? payments[0].status : 'no payment' });
    }

    if (level >= 2) {
      const level1Ids = level1Referrals.map(u => u.id);
      if (level1Ids.length > 0) {
        const level2Referrals = await this.userRepository.find({
          where: { referredBy: In(level1Ids) },
          relations: ['billingAddress'],
        });
        for (const user of level2Referrals) {
          const payments = await this.paymentRepository.find({
            where: { userId: user.id },
            order: { createdAt: 'DESC' },
            take: 1,
          });
          allReferrals.push({ ...user, level: 2, paymentStatus: payments.length > 0 ? payments[0].status : 'no payment' });
        }
      }
    }

    return allReferrals;
  }

  async getReferralReport() {
    const allUsers = await this.userRepository.find({ relations: ['billingAddress'] });
    let totalLevel1 = 0;
    let totalLevel2 = 0;
    let totalUsers = allUsers.length;
    let activeUsers = allUsers.filter(u => u.is_active).length;

    for (const user of allUsers) {
      const level1 = await this.userRepository.count({ where: { referredBy: user.id } });
      totalLevel1 += level1;
      for (const l1 of await this.userRepository.find({ where: { referredBy: user.id } })) {
        totalLevel2 += await this.userRepository.count({ where: { referredBy: l1.id } });
      }
    }

    return {
      totalUsers,
      activeUsers,
      totalLevel1Referrals: totalLevel1,
      totalLevel2Referrals: totalLevel2,
    };
  }

  async getAllReferrals(level: number = 2) {
    const allUsers = await this.userRepository.find();
    let allReferrals: any[] = [];

    for (const user of allUsers) {
      try {
        const referrals = await this.getReferrals(user.id, level);
        allReferrals = [...allReferrals, ...referrals];
      } catch (error) {
        // Skip invalid users
        continue;
      }
    }

    return allReferrals;
  }
}
