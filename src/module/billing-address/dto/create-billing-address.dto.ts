import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateBillingAddressDto {
  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  zipCode: number;

  @IsNotEmpty()
  userId: number;
}