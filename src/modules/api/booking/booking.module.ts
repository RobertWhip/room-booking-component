import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { BookingTimeSlot } from './entities/booking_time_slots.entity';
import { RabbitMQModule } from '../../shared/amqp/rabbitmq/rabbitmq.module';
import { RabbitMQService } from '../../shared/amqp/rabbitmq/rabbitmq.service';

// LGTM

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingTimeSlot]),
    RabbitMQModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
