import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

import { AmqpModule } from './amqp/amqp.module'; // TODO: import from @shared
import { ApiModule } from './api/api.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './configs/database.config';
import amqpConfig from './configs/amqp.config';
import cacheConfig from './configs/cache.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, amqpConfig, cacheConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'), // Retrieve database configuration
      }),
      inject: [ConfigService],
    }),
    AmqpModule,
    CacheModule.register(cacheConfig()), // TODO: import config dynamically
    ApiModule,
  ],
})
export class AppModule {}
