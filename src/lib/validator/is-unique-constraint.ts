import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isUniqueConstraintInput } from './is-unique';
import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'isUniqueConstraint', async: true })
@Injectable()
export default class isUniqueConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly entityManager: EntityManager) {}
  async validate(value: any, arg?: ValidationArguments): Promise<boolean> {
    const { tableName, columnName }: isUniqueConstraintInput =
      arg.constraints[0];

    const exists = await this.entityManager
      .getRepository(tableName)
      .createQueryBuilder(tableName)
      .where({ [columnName]: value })
      .getExists();
    console.log(exists);
    return exists ? false : true;
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `The ${validationArguments.constraints[0].columnName} already exists in record`;
  }
}
