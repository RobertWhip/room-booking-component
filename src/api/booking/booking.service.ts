import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { CreateBookingDto } from './dtos/create_booking.dto';
import { Booking } from './entities/booking.entity';
import { BookingTimeSlot } from './entities/booking_time_slots.entity';
import { CancelBookingDto } from './dtos/cancel_booking.dto';
import { CheckTimeSlotAvailability } from './dtos/check_time_slot_availability.dto';
import { TimeSlotAvailabilityResponseDto } from './dtos/time_slot_availability_response.dto';
import { BookingStatus } from './constants/status.constant';
import errors from './constants/errors.constant';

@Injectable()
export class BookingService {
  private cachingKeys: Map<string, string> = new Map();

  constructor(
    private dataSource: DataSource,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingTimeSlot)
    private readonly bookingTimeSlotRepo: Repository<BookingTimeSlot>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {
    // Registering cache keys for booking service
    this.cachingKeys.set('bookings', 'bookings'); // TODO: later make it dymanic
    this.cachingKeys.set('availability', 'availability');
  }

  // TODO: add pagination 'cuz it will kill the system
  // if this code will ever be deployed on production.
  // PS: add indices too.
  async getBookings(): Promise<Booking[]> {
    const cachedBookings: Booking[] = await this.cacheManager.get(
      this.cachingKeys.get('bookings'),
    );

    if (cachedBookings) {
      return cachedBookings;
    }

    const bookings: Booking[] = await this.bookingRepo.find();

    await this.cacheManager.set(this.cachingKeys.get('bookings'), bookings);

    return bookings;
  }

  // TODO: add caching when the route itself gets refactored
  async checkIfAvailable(
    timeSlotAvailability: CheckTimeSlotAvailability,
  ): Promise<TimeSlotAvailabilityResponseDto[]> {
    const { roomUuid, timeSlotUuids } = timeSlotAvailability;

    // TODO: DRY...
    const existingBookings = await this.bookingTimeSlotRepo
      .createQueryBuilder('booking_time_slots')
      .innerJoin('booking_time_slots.booking', 'booking')
      .andWhere('booking.status = :status', { status: 'ACTIVE' })
      .andWhere('booking.roomUuid = :roomUuid', { roomUuid })
      .andWhere('booking_time_slots.roomTimeSlotUuid IN (:...uuids)', {
        uuids: timeSlotUuids,
      })
      .getMany();

    // Form a map of not available time slots (skipping elements which are not booked)
    const result: TimeSlotAvailabilityResponseDto[] =
      await existingBookings.map((el) =>
        plainToClass(TimeSlotAvailabilityResponseDto, {
          available: false,
          roomUuid: el.roomUuid,
          timeSlotUuid: el.roomTimeSlotUuid,
          bookingUuid: el.bookingUuid,
        }),
      );

    return result;
  }

  // TODO: consider testing data inconsistency and benchmark
  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Warning: according to https://orkhan.gitbook.io/typeorm/docs/transactions
    // SERIALIZABLE is available only MySQL, Postgres and SQL Server.
    // Keep in mind in case of DB migration.
    // Currently it is specified to achieve additional guarantees.
    const result: Booking = await this.dataSource.transaction(
      'SERIALIZABLE',
      async (manager) => {
        const { userUuid, roomUuid, timeSlotUuids } = createBookingDto;

        // 1. Retrieve the current booking time slot entities
        // TODO: DRY...
        const existingBookings: BookingTimeSlot[] = await manager
          .getRepository(BookingTimeSlot)
          .createQueryBuilder('booking_time_slots')
          .innerJoin('booking_time_slots.booking', 'booking')
          .andWhere('booking.status = :status', { status: 'ACTIVE' })
          .andWhere('booking.roomUuid = :roomUuid', { roomUuid })
          .andWhere('booking_time_slots.roomTimeSlotUuid IN (:...uuids)', {
            uuids: timeSlotUuids,
          })
          .getMany();

        // 2. Check if any of the requested time slots are already booked
        const conflictingBookings = existingBookings.filter(
          (booking) => booking.bookingUuid !== null,
        );
        if (conflictingBookings.length > 0) {
          throw new HttpException(
            errors.ALREADY_BOOKED,
            HttpStatus.BAD_REQUEST,
          );
        }

        // 3.. Create a new booking
        const booking = plainToClass(Booking, createBookingDto);
        const savedBooking = await manager.save(booking);

        // 4. Create booking time slot entities
        const bookingTimeSlots = timeSlotUuids.map((timeSlotUuid) => {
          return plainToClass(BookingTimeSlot, {
            userUuid: userUuid,
            roomUuid: roomUuid,
            bookingUuid: savedBooking.uuid,
            roomTimeSlotUuid: timeSlotUuid,
          });
        });

        await manager.save(BookingTimeSlot, bookingTimeSlots);

        // 5. Return booking data
        return savedBooking;
      },
    );

    await this.cacheManager.del(this.cachingKeys.get('bookings')); // TODO: later might be by booking ID

    return result;
  }

  async cancelBooking(updateBookingDto: CancelBookingDto): Promise<Booking> {
    // 1. Retrieve the existing booking from the database
    const existingBooking = await this.bookingRepo.findOne({
      where: { uuid: updateBookingDto.uuid },
    });

    // 2. Throw an error if the booking does not exist
    if (!existingBooking) {
      throw new HttpException(errors.BOOKING_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    // 3. Update the properties of the existing booking with the values from the DTO
    existingBooking.status = BookingStatus.INACTIVE;

    // 4. Save the updated booking back to the database
    const booking: Booking = await this.bookingRepo.save(existingBooking);

    await this.cacheManager.del(this.cachingKeys.get('bookings')); // TODO: later might be by booking ID

    return booking;
  }
}
