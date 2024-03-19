import { Test, TestingModule } from '@nestjs/testing';

import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dtos/create_room.dto';
import { Room } from './entities/room.entity';
import { RoomTimeSlot } from './entities/room_time_slot.entity';

// Import the mocked service
jest.mock('./room.service');

describe('ProductController', () => {
  let controller: RoomController;
  let roomService: RoomService;

  const startDateTime = new Date(1616176800000);
  const endDateTime = new Date(1616176800000);

  const common = {
    name: 'room 1',
    userUuid: 'user_1',
  };

  const rooms: Room[] = [
    {
      ...common,
      uuid: 'room_1',
      timeSlots: [
        {
          uuid: 'time_slot_1',
          roomUuid: 'room_1',
          startDateTime,
          endDateTime,
        },
      ],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [RoomService],
    }).compile();

    controller = module.get<RoomController>(RoomController);
    roomService = module.get<RoomService>(RoomService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return an array of rooms', async () => {
      jest.spyOn(roomService, 'getRooms').mockResolvedValue(rooms);

      expect(await controller.getUsers()).toBe(rooms);
    });
  });

  describe('createRoom', () => {
    it('should create a new room', async () => {
      const timeSlots: RoomTimeSlot[] = [
        {
          uuid: '1',
          roomUuid: 'room_1',
          startDateTime,
          endDateTime,
        },
      ];
      const createRoomDto: CreateRoomDto = {
        name: 'name_1',
        userUuid: 'user_1',
        timeSlots,
      };
      const newRoom: Room = {
        ...common,
        timeSlots,
        uuid: 'room_1',
      };

      jest.spyOn(roomService, 'createRoom').mockResolvedValue(newRoom);

      expect(await controller.createRoom(createRoomDto)).toBe(newRoom);
    });
  });
});
