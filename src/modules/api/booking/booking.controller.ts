import { Controller, Get, Post, Put, Body, UsePipes,ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';

import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dtos/create_booking.dto';
import { CancelBookingDto } from './dtos/cancel_booking.dto';
import { UpdateBookingDto } from './dtos/update_booking.dto';


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
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @ApiOperation({ description: 'Get all bookings' })
  getBookings(): Promise<Booking[]> {
    return this.bookingService.getBookings();
  }

  @Post()
  @ApiOperation({ description: 'Book room time slots' })
  @ApiBody({ type: CreateBookingDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  createBooking(
    @Body() createBookingDto: CreateBookingDto
	): Promise<Booking> {
    return this.bookingService.createBooking(createBookingDto);
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
