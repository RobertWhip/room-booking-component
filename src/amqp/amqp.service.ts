import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { AmqpServices } from '../constants/amqp.constants';

@Injectable()
export class AmqpService {
  constructor(
    @Inject(AmqpServices.NOTIFICATION_AMQP_SERVICE) // TODO: make it more SOLID
    private readonly client: ClientProxy,
  ) {}

  async sendMessage(pattern: string, data: any): Promise<void> {
    await this.client.emit(pattern, data);
  }
}
