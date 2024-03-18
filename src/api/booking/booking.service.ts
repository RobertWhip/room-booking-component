import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

import { CreateBookingDto } from './dtos/create_booking.dto';
import { Booking } from './entities/booking.entity';
import { BookingTimeSlot } from './entities/booking_time_slots.entity';
import { CancelBookingDto } from './dtos/cancel_booking.dto';
import { CheckTimeSlotAvailability } from './dtos/check_time_slot_availability.dto';
import { TimeSlotAvailabilityResponseDto } from './dtos/time_slot_availability_response.dto';

@Injectable()
export class BookingService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingTimeSlot)
    private readonly bookingTimeSlotRepo: Repository<BookingTimeSlot>,
  ) {}

  // TODO: add pagination 'cuz it will kill the system
  // if this code will ever be deployed on production.
  // PS: add indices too.
  getBookings(): Promise<Booking[]> {
    return this.bookingRepo.find();
  }

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

    return existingBookings.map((el) =>
      plainToClass(TimeSlotAvailabilityResponseDto, {
        available: false,
        roomUuid: el.roomUuid,
        timeSlotUuid: el.roomTimeSlotUuid,
        bookingUuid: el.bookingUuid,
      }),
    );
  }

  // TODO: consider data inconsistency and indices
  createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Warning: according to https://orkhan.gitbook.io/typeorm/docs/transactions
    // SERIALIZABLE is available only MySQL, Postgres and SQL Server.
    // Keep in mind in case of DB migration.
    // Currently it is specified to achieve additional guarantees.
    return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
      const { userUuid, roomUuid, timeSlotUuids } = createBookingDto;

      // 1. Retrieve the current booking time slot entities
      // TODO: DRY...
      const existingBookings = await manager
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
          'One or more time slots are already booked.',
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
    });
  }

  async cancelBooking(updateBookingDto: CancelBookingDto): Promise<Booking> {
    // 1. Retrieve the existing booking from the database
    const existingBooking = await this.bookingRepo.findOne({
      where: { uuid: updateBookingDto.uuid },
    });

    // 2. Throw an error if the booking does not exist
    if (!existingBooking) {
      throw new Error('Booking not found');
    }

    // 3. Update the properties of the existing booking with the values from the DTO
    existingBooking.status = updateBookingDto.status as 'ACTIVE' | 'INACTIVE'; // TODO: fix this sh*t

    // 4. Save the updated booking back to the database
    return this.bookingRepo.save(existingBooking);
  }
}
