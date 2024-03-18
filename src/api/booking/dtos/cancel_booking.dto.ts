import { IsString, IsNotEmpty, Equals } from 'class-validator';

import { UpdateBookingDto } from './update_booking.dto';

export class CancelBookingDto extends UpdateBookingDto {
  @IsString()
  @IsNotEmpty()
  @Equals('INACTIVE')
  status: string;
}
