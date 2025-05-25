import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User | undefined> {
    const user = new User();
    user.role = createUserDto.role;
    user.name = createUserDto.name;
    user.password = createUserDto.password;
    user.email = createUserDto.email;
    user.mobile = createUserDto.mobile;
    user.created_at = new Date();
    user.update_at = new Date();
    return this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.find({
      where: {
        id: id,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.find({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new BadRequestException();
    }

    return await this.userRepository.update(
      { user: { id: id } },
      {
        name: updateUserDto.name,
        email: updateUserDto.email,
        mobile: updateUserDto.mobile,
        update_at: new Date(),
      },
    );
  }

  async findByUsername(username: string): Promise<any> {
    return await this.userRepository.findOne({
      where: [{ email: username, is_active: true }],
    });
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
}
