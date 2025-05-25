import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRespository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User | undefined> {
    const role: any = await this.roleRespository.findOne({
      where: { id: createUserDto.role },
    });

    if (!role) {
      throw new BadRequestException();
    }

    const user = new User();
    user.role = role;
    user.name = createUserDto.name;
    user.password = createUserDto.password;
    user.email = createUserDto.email;
    user.mobile = createUserDto.mobile;
    user.created_at = new Date();
    user.update_at = new Date();
    return this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find({ relations: { role: true } });
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
    return await this.userRepository.find({
      where: [{ email: username }],
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
