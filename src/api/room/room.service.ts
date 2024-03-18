import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';

import { CreateRoomDto } from './dtos/create_room.dto';
import { Room } from './entities/room.entity';
import { RoomTimeSlot } from './entities/room_time_slot.entity';

@Injectable()
export class RoomService {
  constructor(
		private dataSource: DataSource,
		@InjectRepository(Room)
		private readonly roomRepo: Repository<Room>,
	) {}

	// TODO: add pagination 'cuz it will kill the system 
	// if this code will ever be deployed on production.
  // PS: add indices too.
  getRooms(): Promise<Room[]> {
		return this.roomRepo
			.createQueryBuilder('room')
			.leftJoinAndSelect('room.timeSlots', 'timeSlot') // Join time slots table
			.orderBy('room.createdAt', 'DESC') // Sort rooms by creation datetime in descending order
			.addOrderBy('timeSlot.startDateTime', 'ASC') // Sort time slots by start date time in ascending order
			.getMany();
  }

	createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
		return this.dataSource.transaction(async manager => {
			// 1. Create the room and get its UUID
      const room = plainToClass(Room, createRoomDto);
      const savedRoom = await manager.save(room);

			// 2. Map through the timeslots and create db data
			const timeSlotsToSave = createRoomDto.timeSlots.map((timeSlotDto) => {
				return { 
					...plainToClass(RoomTimeSlot, timeSlotDto), 
					roomUuid: savedRoom.uuid,
				};
			});

			// 3. Batch insert the time slots
			const savedTimeSlots = await manager.save(RoomTimeSlot, timeSlotsToSave);
	
			// 4. Return new room with time slots
			savedRoom.timeSlots = savedTimeSlots;
			return savedRoom;
		});
	}
}
