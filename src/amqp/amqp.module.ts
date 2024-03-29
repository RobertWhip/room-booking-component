import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { AmqpService } from './amqp.service';
import amqpConfig from '../configs/amqp.config';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.register(amqpConfig()), // TODO: do not import amqpConfig explicitly
  ],
  providers: [AmqpService],
  exports: [AmqpService],
})
export class AmqpModule {}
