import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRoomTimeSlotDto } from './create_room_time_slot.dto';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  userUuid: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRoomTimeSlotDto)
  timeSlots: CreateRoomTimeSlotDto[];
}
