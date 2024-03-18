import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateBookingDto {
  @IsString()
  @IsNotEmpty()
  uuid: string;

  // TODO: add other generic fields
};