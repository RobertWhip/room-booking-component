import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateRoomTimeSlotDto {
  @IsDateString()
  @IsNotEmpty()
  startDateTime: Date;

  @IsDateString()
  @IsNotEmpty()
  endDateTime: Date;

  roomUuid: string; // The UUID of the room associated with this time slot
}