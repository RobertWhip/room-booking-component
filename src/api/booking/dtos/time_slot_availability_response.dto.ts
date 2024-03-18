import { IsUUID, IsNotEmpty, IsBoolean } from 'class-validator';

export class TimeSlotAvailabilityResponseDto {
  @IsUUID()
  @IsNotEmpty()
  roomUuid: string;

  @IsBoolean()
  @IsNotEmpty()
  available: boolean;

  @IsUUID()
  @IsNotEmpty()
  timeSlotUuid: string;

  @IsUUID()
  @IsNotEmpty()
  bookingUuid: string;
}