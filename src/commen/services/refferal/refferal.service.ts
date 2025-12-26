import { Injectable } from '@nestjs/common';
import * as referralCodes from 'referral-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../module/users/entities/user.entity';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async generateUniqueReferralCode(): Promise<string> {
    let code: string;
    let isUnique = false;
    while (!isUnique) {
      const generatedCodes = referralCodes.generate({
        length: 8,
        count: 1,
        charset: 'alphanumeric',
      });
      code = `BR${generatedCodes[0]}`;
      const existingUser = await this.usersRepository.findOne({
        where: { referralCode: code },
      });

      if (!existingUser) {
        isUnique = true;
      }
    }

    return code.toUpperCase();
  }
}
