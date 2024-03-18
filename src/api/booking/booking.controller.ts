import { Controller, Get, Post, Inject, Body, UsePipes,ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';

import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dtos/create_booking.dto';
import { CancelBookingDto } from './dtos/cancel_booking.dto';
import { CheckTimeSlotAvailability } from './dtos/check_time_slot_availability.dto';
import { TimeSlotAvailabilityResponseDto } from './dtos/time_slot_availability_response.dto';
import { AmqpService } from '../../amqp/amqp.service';


/* TODO: 
	- add auth
	- add pagination
	- add indices
	- add sorting by timestamp
	- add other CRUD operations
	- write tests
	- caching maybe
*/

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly AmqpService: AmqpService,
  ) {}

  @Get()
  @ApiOperation({ description: 'Get all bookings' })
  getBookings(): Promise<Booking[]> {
    return this.bookingService.getBookings();
  }

  @Post('check_if_not_available')
  @ApiOperation({ description: 'Check if room time slots are booked already' })
  areTimeSlotsBooked(
    @Body() timeSlotAvailability: CheckTimeSlotAvailability
  ): Promise<TimeSlotAvailabilityResponseDto[]> {
    return this.bookingService.checkIfAvailable(timeSlotAvailability);
  }

  @Post()
  @ApiOperation({ description: 'Book room time slots' })
  @ApiBody({ type: CreateBookingDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createBooking(
    @Body() createBookingDto: CreateBookingDto
	): Promise<Booking> {
    const booking: Booking = await this.bookingService.createBooking(createBookingDto);

    // Send email
    // TODO: create notification service
    this.AmqpService.sendMessage('booking_created', booking);

    return booking;
  }

  @Post('cancel')
  @ApiOperation({ description: 'Cancel booking' })
  @ApiBody({ type: CancelBookingDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  updateBooking(
    @Body() cancelBookingDto: CancelBookingDto
	): Promise<Booking> {
    return this.bookingService.cancelBooking(cancelBookingDto);
  }
}
