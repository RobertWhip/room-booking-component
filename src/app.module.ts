import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RabbitMQModule } from './modules/shared/amqp/rabbitmq/rabbitmq.module'; // TODO: import from @shared
import { ApiModule } from './modules/api/api.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'room_booking',
      password: 'room_booking',
      database: 'room_booking_db',
      autoLoadEntities: true,
      synchronize: true, // TODO: turn off when gets deployed to prod, and use migrations
    }),
    RabbitMQModule,
    ApiModule
  ],
})
export class AppModule {}
