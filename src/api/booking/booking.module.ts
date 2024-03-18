import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { BookingTimeSlot } from './entities/booking_time_slots.entity';
import { AmqpModule } from '../../amqp/amqp.module';

// LGTM

@Module({
  imports: [TypeOrmModule.forFeature([Booking, BookingTimeSlot]), AmqpModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
