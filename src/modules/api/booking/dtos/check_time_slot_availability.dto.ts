import { IsUUID, IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CheckTimeSlotAvailability {
  @IsString()
  @IsNotEmpty()
  roomUuid: string;

  @IsArray()
  @IsNotEmpty()
  @IsUUID(undefined, { each: true })
  timeSlotUuids: string[];
}
