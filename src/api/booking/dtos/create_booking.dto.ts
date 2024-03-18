import { IsUUID, IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  userUuid: string;

  @IsString()
  @IsNotEmpty()
  roomUuid: string;

  @IsArray()
  @IsNotEmpty()
  @IsUUID(undefined, { each: true })
  timeSlotUuids: string[];
}
