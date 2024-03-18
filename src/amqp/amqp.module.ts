import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AmqpService } from './amqp.service';
import { ConfigModule } from '@nestjs/config';
import amqpConfig from '../configs/amqp.config';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.register(amqpConfig()),
  ],
  providers: [AmqpService],
  exports: [AmqpService],
})
export class AmqpModule {}
