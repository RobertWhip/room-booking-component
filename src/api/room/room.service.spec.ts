import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { RoomService } from './room.service';
import { Room } from './entities/room.entity';
import { RoomTimeSlot } from './entities/room_time_slot.entity';
import { CreateRoomDto } from './dtos/create_room.dto';

describe('ProductService', () => {
  let service: RoomService;

  const startDateTime = new Date(1616176800000);
  const endDateTime = new Date(1616176800000);

  const timeSlots: RoomTimeSlot[] = [
    {
      uuid: 'time_slot_1',
      startDateTime,
      endDateTime,
    },
  ];

  const common = {
    name: 'room 1',
    userUuid: 'user_1',
  };

  const rooms: Room[] = [
    {
      ...common,
      uuid: 'room_1',
      timeSlots,
    },
  ];

  // Mocking Booking
  const roomRepoMock = {
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(rooms),
  };

  // Mocking create transaction
  const mockTransaction = jest.fn().mockImplementation(async (callback) => {
    const mockManager = {
      save: jest.fn((entity, optionalData?) => {
        if (entity instanceof Room) {
          return { ...entity, uuid: 'generated_room_uuid_1' } as Room;
        } else if (optionalData[0] instanceof RoomTimeSlot) {
          // TODO: fix this crappy way of instance checking
          return optionalData as RoomTimeSlot[];
        }

        throw new Error('save method is not mocked for' + typeof entity);
      }),
    };

    return await callback(mockManager);
  });

  const dataSourceMock = {
    transaction: mockTransaction,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        { provide: DataSource, useValue: dataSourceMock },
        { provide: getRepositoryToken(Room), useValue: roomRepoMock },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of rooms with time slots', async () => {
    const result: Room[] = await service.getRooms();

    expect(result).toEqual(rooms);
    expect(roomRepoMock.createQueryBuilder).toHaveBeenCalled();
    expect(roomRepoMock.leftJoinAndSelect).toHaveBeenCalledWith(
      'room.timeSlots',
      'timeSlot',
    );
    expect(roomRepoMock.orderBy).toHaveBeenCalledWith('room.createdAt', 'DESC');
    expect(roomRepoMock.addOrderBy).toHaveBeenCalledWith(
      'timeSlot.startDateTime',
      'ASC',
    );
    // Other stuff...
  });

  it('should create a room with time slots', async () => {
    const createRoomDto: CreateRoomDto = {
      name: 'room_1',
      userUuid: 'user_1',
      timeSlots,
    };

    const exprectedRoomUuid = 'generated_room_uuid_1';
    const expectedResult: Room = {
      ...createRoomDto,
      uuid: exprectedRoomUuid,
      timeSlots: createRoomDto.timeSlots.map((el) => {
        el.roomUuid = exprectedRoomUuid;
        return el;
      }) as RoomTimeSlot[],
    };

    const result: Room = await service.createRoom(createRoomDto);

    // Verify the room creation result
    expect(result).toEqual(expectedResult);

    // Verify transaction creation
    expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));
  });
});
