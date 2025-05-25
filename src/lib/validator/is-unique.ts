import { registerDecorator, ValidationOptions } from 'class-validator';
import isUniqueConstraint from './is-unique-constraint';

export type isUniqueConstraintInput = {
  tableName: string;
  columnName: string;
};

export const isUnique = (
  options: isUniqueConstraintInput,
  validationOptions?: ValidationOptions,
) => {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'is-unique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: isUniqueConstraint,
    });
  };
};
