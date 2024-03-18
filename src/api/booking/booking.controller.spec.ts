import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository,  } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { BookingTimeSlot } from './entities/booking_time_slots.entity';
import { AmqpService } from '../../amqp/amqp.service';
import { CreateBookingDto } from './dtos/create_booking.dto';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

// TODO: split the logic into booking.service
describe('BookingController', () => {
  let controller: BookingController;

  // Mocking AmqpService
  const sendMessageMock = jest.fn();
  const mockAmqpService: Partial<Record<keyof AmqpService, jest.Mock>> = {
    sendMessage: sendMessageMock,
  };

  // Mocking Booking
  const bookingRepoMockSave = jest.fn();
  const bookingRepoMockFind = jest.fn().mockResolvedValue([]);
  // @ts-ignore
  const bookingRepoMockFactory: () => MockType<Repository<Booking>> = jest.fn(() => ({
    find: bookingRepoMockFind,
    save: bookingRepoMockSave,
  }));

  // Mocking BookingTimeSlot
  const slotsRepoMockSave = jest.fn(entity => {
    return entity.map(el => {
      el.bookingUuid = 'mock_booking_uuid';
    });
  })
  // @ts-ignore
  const slotsRepoMockFactory: () => MockType<Repository<BookingTimeSlot>> = jest.fn(() => ({
    find: jest.fn().mockResolvedValue([]),
    save: slotsRepoMockSave,
  }));

  // Mocking create transaction
  const saveInTrx = jest.fn((entity, optionalData?) => {
    if (entity instanceof Booking) {
      return { ...entity, uuid: 'mock_booking_uuid' };

    } else if (optionalData[0] instanceof BookingTimeSlot) { // TODO: fix this crappy way of instance checking
      return slotsRepoMockSave(optionalData);
    }

    return [];
  }); // Mock save method

  const mockTransaction = jest.fn().mockImplementation(async (isolationLevel, callback) => {
    const mockManager = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(), 
        getMany: jest.fn().mockResolvedValue([]),
      }),
      save: saveInTrx,
    };
  
    return await callback(mockManager);
  });

  const dataSourceMock = { 
    transaction: mockTransaction,
  };

  const createBookingDto: CreateBookingDto = {
    userUuid: 'test_user',
    roomUuid: 'test_room',
    timeSlotUuids: ['time_slot_1', 'time_slot_2'],
  };
  const expectedBooking = { // TODO: add type -> add other class fields in jest.fn
    ...createBookingDto,
    uuid: 'mock_booking_uuid',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        BookingService, 
        { provide: DataSource, useValue: dataSourceMock },
        { provide: getRepositoryToken(Booking), useFactory: bookingRepoMockFactory },
        { provide: getRepositoryToken(BookingTimeSlot), useFactory: slotsRepoMockFactory },
        { provide: AmqpService, useValue: mockAmqpService },
      ],
    }).compile();

    controller = app.get<BookingController>(BookingController);
  });

  describe('root', () => {
    it('should create a booking and return it', async () => {
      // Call the createBooking method
      const result: Booking = await controller.createBooking(createBookingDto);

      // Verify the booking result
      expect(result).toEqual(expectedBooking);

      // Verify that the booking and booking time slots are saved
      expect(mockTransaction).toHaveBeenCalledWith('SERIALIZABLE', expect.any(Function));

      // Verify that the slots reservations being created
      expect(slotsRepoMockSave).toHaveBeenCalledWith(
        createBookingDto.timeSlotUuids.map(
          el => ({
            roomTimeSlotUuid: el,
            userUuid: createBookingDto.userUuid,
            roomUuid: createBookingDto.roomUuid,
            bookingUuid: 'mock_booking_uuid',
          })
        ) as BookingTimeSlot[]
      );

      // Verify that the email was sent
      expect(sendMessageMock).toHaveBeenCalledWith('booking_created', expectedBooking);
    });

    // TODO: rewrite mocking logic so we'll able to easily modify the mock functions
    // and test every case of the creation function.
    xit('should not create a booking when failed', async () => {
      const result: Booking = await controller.createBooking(createBookingDto);
      expect(sendMessageMock).toHaveBeenCalledWith('booking_created', expectedBooking);
    });
    
    // TODO: test query properties when added
    it('should get all bookings', async () => {
      await controller.getBookings();
      expect(bookingRepoMockFind).toHaveBeenCalled();
    });

    // TODO: add module defining checks
  });
});
