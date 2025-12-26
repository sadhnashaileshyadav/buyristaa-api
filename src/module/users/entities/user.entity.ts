import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { RoleEntity } from './role.entity';
import { BillingAddress } from '../../billing-address/entities/billing-address.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'bigint', unique: true })
  mobile: number;
  user: Promise<any>;
    categories: any;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
  @Column()
  @Exclude()
  password: string;

  @ManyToMany(() => RoleEntity, role => role.users, { cascade: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];

  @Column({ nullable: true })
  referralCode: string

  @Column({
    nullable: true,
    default: 0
  })
  referredBy: number

  @Column({
    nullable: true,
    default: 0
  })
  totalPoint: number

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_at: Date;

  @OneToOne(() => BillingAddress, billingAddress => billingAddress.user, { cascade: true })
  billingAddress: BillingAddress;
}
