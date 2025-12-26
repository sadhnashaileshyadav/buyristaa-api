import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../../module/categories/entities/category.entity';

@Entity('media')
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  filename: string;

  @Column()
  path: string; 

  @Column()
  modelType: string; 

  @Column()
  modelId: number;

  @ManyToOne(() => Category, (category) => category.image)
  @JoinColumn({ name: 'modelId' }) 
  category: Category;
}