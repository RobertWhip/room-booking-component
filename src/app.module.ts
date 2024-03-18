import { Module } from '@nestjs/common';
import { ApiModule } from './modules/api/api.module';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      synchronize: true,
    }),
    ApiModule
  ],
})
export class AppModule {}
