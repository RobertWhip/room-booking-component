import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { BookingService } from './booking.service';
import { BookingTimeSlot } from './entities/booking_time_slots.entity';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dtos/create_booking.dto';

describe('BookingController', () => {
  let service: BookingService;

  // Mocking Booking
  const bookingRepoMock = {
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
  };

  // Mocking BookingTimeSlot
  const slotsRepoMock = {
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn((entity) => {
      return entity.map((el) => {
        el.bookingUuid = 'mock_booking_uuid';
      });
    }),
  };

  // Mocking BookingTimeSlot
  const cacheMock = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  // Mocking create transaction
  const saveInTrx = jest.fn((entity, optionalData?) => {
    if (entity instanceof Booking) {
      return { ...entity, uuid: 'mock_booking_uuid' };
    } else if (optionalData[0] instanceof BookingTimeSlot) {
      // TODO: fix this crappy way of instance checking
      return slotsRepoMock.save(optionalData);
    }

    throw new Error('save method is not mocked for' + typeof entity);
  });

  const mockTransaction = jest
    .fn()
    .mockImplementation(async (isolationLevel, callback) => {
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
  const expectedBooking = {
    // TODO: add type -> add other class fields in jest.fn
    ...createBookingDto,
    uuid: 'mock_booking_uuid',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: DataSource, useValue: dataSourceMock },
        { provide: getRepositoryToken(Booking), useValue: bookingRepoMock },
        {
          provide: getRepositoryToken(BookingTimeSlot),
          useValue: slotsRepoMock,
        },
        { provide: CACHE_MANAGER, useValue: cacheMock },
      ],
    }).compile();

    service = app.get<BookingService>(BookingService);
  });

  describe('root', () => {
    it('should create a booking and return it', async () => {
      // Call the createBooking method
      const result: Booking = await service.createBooking(createBookingDto);

      // Verify the booking result
      expect(result).toEqual(expectedBooking);

      // Verify that the booking and booking time slots are saved
      expect(mockTransaction).toHaveBeenCalledWith(
        'SERIALIZABLE',
        expect.any(Function),
      );

      // Verify that the slots reservations being created
      expect(slotsRepoMock.save).toHaveBeenCalledWith(
        createBookingDto.timeSlotUuids.map((el) => ({
          roomTimeSlotUuid: el,
          userUuid: createBookingDto.userUuid,
          roomUuid: createBookingDto.roomUuid,
          bookingUuid: 'mock_booking_uuid',
        })) as BookingTimeSlot[],
      );

      // Verify cache removing
      expect(cacheMock.del).toHaveBeenCalledWith('bookings');
    });

    // TODO: rewrite mocking logic so we'll able to easily modify the mock functions
    // and test every case of the creation function.
    xit('should not create a booking when failed', async () => {
      //const result: Booking = await service.createBooking(createBookingDto); // should throw error
    });

    // TODO: test query properties when added
    it('should get all bookings (with cache)', async () => {
      await service.getBookings();
      expect(bookingRepoMock.find).toHaveBeenCalled();

      // Verify caching
      expect(cacheMock.set).toHaveBeenCalledWith('bookings', []);
      await service.getBookings();
      expect(cacheMock.get).toHaveBeenCalledWith('bookings');
    });
  });
});
