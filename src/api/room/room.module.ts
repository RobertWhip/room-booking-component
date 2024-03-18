import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { Room } from './entities/room.entity';
import { RoomTimeSlot } from './entities/room_time_slot.entity';

// LGTM

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomTimeSlot])],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
