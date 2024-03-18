import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy
  ) {}

  async sendMessage(pattern: string, data: any): Promise<void> {
		console.log(pattern, data);

    await this.client.emit(pattern, data);
  }
}