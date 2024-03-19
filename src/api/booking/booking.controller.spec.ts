import { Test, TestingModule } from '@nestjs/testing';

import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { AmqpService } from '../../amqp/amqp.service';

import { CreateBookingDto } from './dtos/create_booking.dto';
import { CheckTimeSlotAvailability } from './dtos/check_time_slot_availability.dto';
import { TimeSlotAvailabilityResponseDto } from './dtos/time_slot_availability_response.dto';
import { CancelBookingDto } from './dtos/cancel_booking.dto';
import { BookingStatus } from './constants/status.constant';
import { Booking } from './entities/booking.entity';

// Import the mocked service
jest.mock('./booking.service');
jest.mock('../../amqp/amqp.service');

describe('BookingController', () => {
  let controller: BookingController;
  let bookingService: BookingService;
  let amqpService: AmqpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [BookingService, AmqpService],
    }).compile();

    controller = module.get<BookingController>(BookingController);
    bookingService = module.get<BookingService>(BookingService);
    amqpService = module.get<AmqpService>(AmqpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBookings', () => {
    it('should return an array of bookings', async () => {
      const mockBookings: Booking[] = []; // TODO: define mock bookings here
      jest.spyOn(bookingService, 'getBookings').mockResolvedValue(mockBookings);

      const result = await controller.getBookings();

      expect(result).toEqual(mockBookings);
    });
  });

  describe('areTimeSlotsBooked', () => {
    it('should check if room time slots are booked already', async () => {
      const mockTimeSlotAvailability: CheckTimeSlotAvailability = {
        roomUuid: 'room_1',
        timeSlotUuids: ['slot_1', 'slot_2'],
      };

      const mockTimeSlotResponse: TimeSlotAvailabilityResponseDto[] = [
        {
          roomUuid: 'room_1',
          available: false,
          timeSlotUuid: 'slot_2',
          bookingUuid: 'booking_1',
        },
      ];

      jest
        .spyOn(bookingService, 'checkIfAvailable')
        .mockResolvedValue(mockTimeSlotResponse);

      const result = await controller.areTimeSlotsBooked(
        mockTimeSlotAvailability,
      );

      expect(result).toEqual(mockTimeSlotResponse);
    });
  });

  describe('createBooking', () => {
    it('should create a booking and send a message', async () => {
      const mockCreateBookingDto: CreateBookingDto = {
        userUuid: 'user_1',
        roomUuid: 'room_1',
        timeSlotUuids: ['slot_1', 'slot_2'],
      };

      const mockBooking: Booking = {
        uuid: 'generated_booking_1',
        roomUuid: 'room_1',
        userUuid: 'user_1',
        status: BookingStatus.ACTIVE,
      };

      jest
        .spyOn(bookingService, 'createBooking')
        .mockResolvedValue(mockBooking);
      const sendMessageSpy = jest.spyOn(amqpService, 'sendMessage');

      const result = await controller.createBooking(mockCreateBookingDto);

      expect(result).toEqual(mockBooking);
      expect(sendMessageSpy).toHaveBeenCalledWith(
        'booking_created',
        mockBooking,
      );
    });
  });

  describe('updateBooking', () => {
    it('should cancel a booking', async () => {
      const mockCancelBookingDto: CancelBookingDto = {
        uuid: 'generated_booking_1',
        status: BookingStatus.INACTIVE,
      };

      const mockBooking: Booking = {
        uuid: 'generated_booking_1',
        roomUuid: 'room_1',
        userUuid: 'user_1',
        status: BookingStatus.INACTIVE,
      };

      jest
        .spyOn(bookingService, 'cancelBooking')
        .mockResolvedValue(mockBooking);

      const result = await controller.updateBooking(mockCancelBookingDto);

      expect(result).toEqual(mockBooking);
    });
  });
});
