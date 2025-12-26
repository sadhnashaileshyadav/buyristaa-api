import { PartialType } from '@nestjs/mapped-types';
import { CreateProdcutDto } from './create-prodcut.dto';

export class UpdateProdcutDto extends PartialType(CreateProdcutDto) {}
