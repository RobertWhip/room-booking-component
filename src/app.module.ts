import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AmqpModule } from './amqp/amqp.module'; // TODO: import from @shared
import { ApiModule } from './api/api.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './configs/database.config';
import amqpConfig from './configs/amqp.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        databaseConfig,
        amqpConfig,
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'), // Retrieve database configuration
      }),
      inject: [ConfigService],
    }),
    AmqpModule,
    ApiModule
  ],
})
export class AppModule {}
