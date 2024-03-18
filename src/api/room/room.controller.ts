import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dtos/create_room.dto';
import { Room } from './entities/room.entity';

/* TODO: 
	- add auth
	- add pagination
	- add indices
	- add sorting by timestamp
	- add other CRUD operations
	- write tests
	- caching maybe
*/

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  @ApiOperation({ description: 'Get all rooms' })
  getUsers(): Promise<Room[]> {
    return this.roomService.getRooms();
  }

  @Post()
  @ApiOperation({ description: 'Create a new room with time slots' })
  @ApiBody({ type: CreateRoomDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  createRoom(@Body() createUserDto: CreateRoomDto): Promise<Room> {
    return this.roomService.createRoom(createUserDto);
  }
}
