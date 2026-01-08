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
    // with referred by user and billing address
    return this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.billingAddress', 'billingAddress')
      .leftJoinAndMapOne('user.referredByUser', User, 'referredByUser', 'user.referredBy = referredByUser.id')
      .getMany();
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
      where: [{ email: username }],
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

    const rootReferrer = await this.userRepository.findOne({ where: { id: userId } });

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
      allReferrals.push({ 
        ...user, 
        referredByUser: rootReferrer, 
        level: 1, 
        paymentStatus: payments.length > 0 ? payments[0].status : 'no payment' 
      });
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

          const referrer = level1Referrals.find(u => u.id === user.referredBy);
          allReferrals.push({ 
            ...user, 
            referredByUser: referrer, 
            level: 2, 
            paymentStatus: payments.length > 0 ? payments[0].status : 'no payment' 
          });
        }
      }
    }

    return allReferrals;
  }

  async getReferralReport() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { is_active: true } });

    // Count all level 1 referrals
    const totalLevel1 = await this.userRepository.count({ where: { referredBy: 0 } }); // assuming 0 means no referrer

    // Count all level 2 referrals (users referred by users who have referrers)
    const level2Users = await this.userRepository
      .createQueryBuilder('u')
      .innerJoin('users', 'ref1', 'u.referredBy = ref1.id')
      .where('ref1.referredBy != 0')
      .getCount();

    return {
      totalUsers,
      activeUsers,
      totalLevel1Referrals: totalLevel1,
      totalLevel2Referrals: level2Users,
    };
  }

  async getAllReferrals(level: number = 2) {
    let query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.billingAddress', 'address')
      .where('user.referredBy != 0'); // Only users with referrers

    if (level === 1) {
      // Only level 1
      query = query.andWhere('user.referredBy IN (SELECT DISTINCT id FROM users WHERE referredBy = 0)');
    }
    // For level 2, include all with referrers

    const referrals = await query.getMany();

    // Add payment status and level
    const result = await Promise.all(
      referrals.map(async (user) => {
        const payments = await this.paymentRepository.find({
          where: { userId: user.id },
          order: { createdAt: 'DESC' },
          take: 1,
        });
        const level = await this.getReferralLevel(user.id);
        return { ...user, level, paymentStatus: payments.length > 0 ? payments[0].status : 'no payment' };
      })
    );

    return result;
  }

  private async getReferralLevel(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.referredBy === 0) return 0;
    
    const referrer = await this.userRepository.findOne({ where: { id: user.referredBy } });
    if (!referrer || referrer.referredBy === 0) return 1;
    
    return 2;
  }
}
