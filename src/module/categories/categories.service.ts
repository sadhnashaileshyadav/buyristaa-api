import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryInterface } from './dto/category.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryInterface> {
    const newCategory = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(newCategory);
  }

  async findAll(): Promise<CategoryInterface[]> {
    return this.categoryRepository.find({
      where: { parent: null },
      relations: ['children', 'children.children', 'image'],
      
    });
  }

  async findOne(id: number): Promise<CategoryInterface> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'image'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    return category;
  }

  async findOneBySlug(slug: string): Promise<CategoryInterface> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['parent', 'children', 'image'],
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found.`);
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryInterface> {
    const categoryToUpdate = await this.findOne(id);
    Object.assign(categoryToUpdate, updateCategoryDto);
    return this.categoryRepository.save(categoryToUpdate);
  }

  async remove(id: number): Promise<{ deleted: boolean; message?: string }> {
    const categoryToDelete = await this.findOne(id);
    await this.categoryRepository.delete(id);

    return {
      deleted: true,
      message: `Category ${categoryToDelete.name} was successfully deleted.`,
    };
  }
}
