import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../../../core/roles/role.enum';

@Entity('roles')
export class RoleEntity  {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: Role;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @ManyToMany(() => User, user => user.roles)
  users: User[];
}