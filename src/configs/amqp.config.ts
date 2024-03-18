import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { registerAs } from '@nestjs/config';

import { AmqpServices, AmqpQueues } from '../constants/amqp.constants';

const bookingQueue = {
    name: AmqpServices.NOTIFICATION_AMQP_SERVICE,
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.AMQP_URI || 'amqp://localhost:5672'
    	],
      queue: AmqpQueues.EMAIL,
      queueOptions: {
        durable: true,
      },
    },
  };

export default registerAs('amqpConfig', () => ([
    bookingQueue
  ] as ClientsModuleOptions));